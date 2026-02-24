import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BUCKET_NAME = "mattjno-photos";
const PUBLIC_BASE = `https://f003.backblazeb2.com/file/${BUCKET_NAME}/`;

export async function GET() {
  try {
    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APPLICATION_KEY;

    if (!keyId || !appKey) {
      return NextResponse.json({ error: "Missing B2 keys" }, { status: 500 });
    }

    // 1) Authorize
    const authRes = await fetch(
      "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64"),
        },
        cache: "no-store",
      }
    );
    const auth = await authRes.json();
    if (!authRes.ok) {
      return NextResponse.json({ error: auth }, { status: 500 });
    }

    const apiUrl = auth.apiUrl;
    const token = auth.authorizationToken;
    const accountId = auth.accountId;

    // 2) Get bucketId by name
    const bucketsRes = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
      cache: "no-store",
    });
    const bucketsData = await bucketsRes.json();
    if (!bucketsRes.ok) {
      return NextResponse.json({ error: bucketsData }, { status: 500 });
    }

    const bucket = (bucketsData.buckets || []).find(
      (b) => b.bucketName === BUCKET_NAME
    );

    if (!bucket?.bucketId) {
      return NextResponse.json(
        { error: `Bucket not found: ${BUCKET_NAME}` },
        { status: 500 }
      );
    }

    const bucketId = bucket.bucketId;

    // 3) List all files under albums/
    let nextFileName = null;
    const files = [];

    while (true) {
      const body = { bucketId, prefix: "albums/", maxFileCount: 1000 };
      if (nextFileName) body.startFileName = nextFileName;

      const listRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      const data = await listRes.json();
      if (!listRes.ok) {
        return NextResponse.json({ error: data }, { status: 500 });
      }

      for (const f of data.files || []) {
        if (f.fileName) files.push(f.fileName);
      }

      nextFileName = data.nextFileName;
      if (!nextFileName) break;
    }

    // 4) Detect albums from albums/<slug>/thumbs/<file>
    const albumToCover = new Map();

    for (const name of files) {
      const parts = name.split("/");
      if (parts.length < 4) continue;
      if (parts[0] !== "albums") continue;

      const slug = parts[1];
      const folder = parts[2];
      const file = parts[3];

      if (folder !== "thumbs") continue;
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

      if (!albumToCover.has(slug)) {
        albumToCover.set(slug, `${PUBLIC_BASE}${name}`);
      }
    }

    const albums = Array.from(albumToCover.entries())
      .map(([slug, cover]) => ({
        slug,
        title: slug.replace(/_/g, " "),
        cover,
      }))
      .sort((a, b) => b.slug.localeCompare(a.slug));

    return NextResponse.json(
      { albums },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}
