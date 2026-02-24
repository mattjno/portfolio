import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BUCKET = "mattjno-photos";
const BASE = `https://f003.backblazeb2.com/file/${BUCKET}/albums/`;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;

  const authRes = await fetch(
    "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
    {
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64"),
      },
    }
  );

  const auth = await authRes.json();

  const listRes = await fetch(
    `${auth.apiUrl}/b2api/v2/b2_list_file_names`,
    {
      method: "POST",
      headers: {
        Authorization: auth.authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: auth.allowed.bucketId,
        prefix: `albums/${slug}/thumbs/`,
      }),
    }
  );

  const data = await listRes.json();

  const items = data.files.map(
    (f) => `${BASE}${slug}/thumbs/${f.fileName.split("/").pop()}`
  );

  return NextResponse.json({ items });
}
