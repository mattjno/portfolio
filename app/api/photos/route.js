import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BUCKET_NAME = "mattjno-photos";
const THUMBS_PREFIX = "bestof/thumbs/";
const FULL_PREFIX = "bestof/full/";
const PUBLIC_BASE_URL = `https://f003.backblazeb2.com/file/${BUCKET_NAME}/`;

export async function GET() {
  try {
    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APPLICATION_KEY;

    if (!keyId || !appKey) {
      return NextResponse.json(
        { error: "Missing B2_KEY_ID or B2_APPLICATION_KEY in Vercel env vars" },
        { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

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
      return NextResponse.json(
        { error: `Authorize failed: ${txt}` },
        { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const auth = await authRes.json();
    const apiUrl = auth.apiUrl;
    const token = auth.authorizationToken;

    const bucketId = auth.allowed?.bucketId;
    if (!bucketId) {
      return NextResponse.json(
        {
          error:
            "No allowed.bucketId returned. Make sure your B2 key is restricted to the bucket (mattjno-photos).",
        },
        { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    let nextFileName = null;
    let allThumbKeys = [];

    while (true) {
      const body = {
        bucketId,
        prefix: THUMBS_PREFIX,
        maxFileCount: 1000,
      };
      if (nextFileName) body.startFileName = nextFileName;

      const listRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (!listRes.ok) {
        const txt = await listRes.text();
        return NextResponse.json(
          { error: `List files failed: ${txt}` },
          { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
        );
      }

      const data = await listRes.json();
      const batch = (data.files || [])
        .map((f) => f.fileName)
        .filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name));

      allThumbKeys.push(...batch);

      nextFileName = data.nextFileName;
      if (!nextFileName) break;
    }

    allThumbKeys.sort((a, b) => a.localeCompare(b));

    const items = allThumbKeys.map((thumbKey) => {
      const fileNameOnly = thumbKey.slice(THUMBS_PREFIX.length);
      const fullKey = `${FULL_PREFIX}${fileNameOnly}`;

      return {
        name: fileNameOnly,
        thumb: `${PUBLIC_BASE_URL}${thumbKey}`,
        full: `${PUBLIC_BASE_URL}${fullKey}`,
      };
    });

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
