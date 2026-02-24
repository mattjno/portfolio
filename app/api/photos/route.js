import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BUCKET_NAME = "mattjno-photos";
const PUBLIC_BASE_URL = `https://f003.backblazeb2.com/file/${BUCKET_NAME}/`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("album");
    const listAlbums = searchParams.get("list");

    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APPLICATION_KEY;

    const authRes = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      headers: { Authorization: "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64") },
    });
    const auth = await authRes.json();
    const { apiUrl, authorizationToken: token, allowed } = auth;
    const bucketId = allowed?.bucketId;

    // --- CAS 1 : LISTE DES ALBUMS (Optimisé avec cover.jpg) ---
    if (listAlbums) {
      const listRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify({ bucketId, prefix: "albums/", delimiter: "/" }),
      });
      const data = await listRes.json();
      
      const folders = (data.files || [])
        .filter(f => f.fileName.endsWith('/') && f.fileName !== "albums/")
        .map(f => {
          const cleanId = f.fileName.replace("albums/", "").replace("/", "");
          // On construit directement le chemin vers cover.jpg
          // C'est beaucoup plus rapide car on ne fait plus de deuxième appel API par dossier
          return {
            id: cleanId,
            title: cleanId.replaceAll("-", " "),
            cover: `${PUBLIC_BASE_URL}albums/${cleanId}/thumbs/cover.jpg`
          };
        });

      return NextResponse.json({ albums: folders });
    }

    // --- CAS 2 : PHOTOS D'UN ALBUM ---
    const prefix = albumId ? `albums/${albumId}/` : "bestof/";
    const THUMBS_PREFIX = `${prefix}thumbs/`;
    const FULL_PREFIX = `${prefix}full/`;

    const listFilesRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({ bucketId, prefix: THUMBS_PREFIX, maxFileCount: 1000 }),
    });

    const data = await listFilesRes.json();
    const items = (data.files || [])
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f.fileName) && !f.fileName.includes("cover.jpg"))
      .map((f) => {
        const fileNameOnly = f.fileName.slice(THUMBS_PREFIX.length);
        return {
          name: fileNameOnly,
          thumb: `${PUBLIC_BASE_URL}${f.fileName}`,
          full: `${PUBLIC_BASE_URL}${FULL_PREFIX}${fileNameOnly}`,
        };
      });

    return NextResponse.json({ items });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
