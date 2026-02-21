import { NextResponse } from "next/server";

const BUCKET_NAME = "mattjno-photos";
const PREFIX = "bestof/";

// URL publique "conviviale" que tu as déjà
const PUBLIC_BASE_URL = `https://f003.backblazeb2.com/file/${BUCKET_NAME}/`;

export async function GET() {
  try {
    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APPLICATION_KEY;

    if (!keyId || !appKey) {
      return NextResponse.json(
        { error: "Missing B2_KEY_ID or B2_APPLICATION_KEY in Vercel env vars" },
        { status: 500 }
      );
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

    if (!authRes.ok) {
      const txt = await authRes.text();
      return NextResponse.json({ error: txt }, { status: 500 });
    }

    const auth = await authRes.json();

    const apiUrl = auth.apiUrl;
    const token = auth.authorizationToken;

    // bucketId est généralement présent dans allowed.bucketId quand la key est limitée à un bucket
    const bucketId = auth.allowed?.bucketId;
    if (!bucketId) {
      return NextResponse.json(
        { error: "No allowed.bucketId returned. Key might not be limited to a bucket." },
        { status: 500 }
      );
    }

    // 2) List files
    const listRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId,
        prefix: PREFIX,
        maxFileCount: 10000,
      }),
      cache: "no-store",
    });

    if (!listRes.ok) {
      const txt = await listRes.text();
      return NextResponse.json({ error: txt }, { status: 500 });
    }

    const data = await listRes.json();

    const files =
      (data.files || [])
        .map((f) => f.fileName)
        .filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name))
        .sort((a, b) => a.localeCompare(b));

    // On renvoie à la fois les chemins et les URLs publiques prêtes à afficher
    const urls = files.map((fileName) => `${PUBLIC_BASE_URL}${fileName}`);

    return NextResponse.json({ files, urls });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
