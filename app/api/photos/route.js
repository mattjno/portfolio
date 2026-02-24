import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BUCKET_NAME = "mattjno-photos";
const PUBLIC_BASE_URL = `https://f003.backblazeb2.com/file/${BUCKET_NAME}/`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("album"); // ex: "2026-02-21-OMvsOL"
    const listAlbums = searchParams.get("list"); // pour avoir la liste des dossiers

    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APPLICATION_KEY;

    // --- AUTHENTICATION ---
    const authRes = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      headers: { Authorization: "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64") },
    });
    const auth = await authRes.json();
    const { apiUrl, authorizationToken: token, allowed } = auth;
    const bucketId = allowed?.bucketId;

    // --- CAS 1 : LISTER TOUS LES DOSSIERS DANS /ALBUMS ---
    if (listAlbums) {
      const listRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify({ bucketId, prefix: "albums/", delimiter: "/" }),
      });
      const data = await listRes.json();
      
      // On récupère les noms de dossiers (ex: "albums/2026-02-21-OMvsOL/")
      const folders = (data.files || [])
        .filter(f => f.fileName.endsWith('/') && f.fileName !== "albums/")
        .map(f => ({
          id: f.fileName.replace("albums/", "").replace("/", ""),
          title: f.fileName.replace("albums/", "").replace("/", "").replaceAll("-", " "),
        }));

      // Pour chaque dossier, on va chercher la 1ère image pour la couverture
      const foldersWithCover = await Promise.all(folders.map(async (f) => {
        const coverRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
          method: "POST",
          headers: { Authorization: token, "Content-Type": "application/json" },
          body: JSON.stringify({ bucketId, prefix: `albums/${f.id}/thumbs/`, maxFileCount: 1 }),
        });
        const coverData = await coverRes.json();
        return { ...f, cover: coverData.files?.[0] ? `${PUBLIC_BASE_URL}${coverData.files[0].fileName}` : null };
      }));

      return NextResponse.json({ albums: foldersWithCover });
    }

    // --- CAS 2 : LISTER LES PHOTOS D'UN ALBUM (OU BESTOF) ---
    const prefix = albumId ? `albums/${albumId}/` : "bestof/";
    const THUMBS_PREFIX = `${prefix}thumbs/`;
    const FULL_PREFIX = `${prefix}full/`;

    let allThumbKeys = [];
    let nextFileName = null;

    while (true) {
      const body = { bucketId, prefix: THUMBS_PREFIX, maxFileCount: 1000 };
      if (nextFileName) body.startFileName = nextFileName;

      const listRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await listRes.json();
      const batch = (data.files || [])
        .map((f) => f.fileName)
        .filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name));

      allThumbKeys.push(...batch);
      nextFileName = data.nextFileName;
      if (!nextFileName) break;
    }

    const items = allThumbKeys.map((thumbKey) => {
      const fileNameOnly = thumbKey.slice(THUMBS_PREFIX.length);
      return {
        name: fileNameOnly,
        thumb: `${PUBLIC_BASE_URL}${thumbKey}`,
        full: `${PUBLIC_BASE_URL}${FULL_PREFIX}${fileNameOnly}`,
      };
    });

    return NextResponse.json({ items });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
