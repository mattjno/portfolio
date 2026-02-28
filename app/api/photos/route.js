import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Cache statique — Next.js régénère toutes les 5 minutes
export const revalidate = 300;

const BUCKET_NAME = "mattjno-photos";
const PUBLIC_BASE_URL = `https://f003.backblazeb2.com/file/${BUCKET_NAME}/`;

// Lecture d'un manifest JSON local (généré par le script GitHub Actions)
function readManifest(filename) {
  try {
    const filePath = join(process.cwd(), "public", filename);
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// Cache token B2 en mémoire (uniquement utilisé pour les albums sans manifest)
let cachedAuth = null;
let authExpiry = 0;

async function getB2Auth() {
  const now = Date.now();
  if (cachedAuth && now < authExpiry) return cachedAuth;

  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;

  const authRes = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: { Authorization: "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64") },
  });
  const auth = await authRes.json();

  cachedAuth = {
    apiUrl: auth.apiUrl,
    token: auth.authorizationToken,
    bucketId: auth.allowed?.bucketId,
  };
  authExpiry = now + 12 * 60 * 60 * 1000;
  return cachedAuth;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("album");
    const listAlbums = searchParams.get("list");

    // -------------------------------------------------------
    // CAS 1 : LISTE DES ALBUMS
    // -------------------------------------------------------
    if (listAlbums) {
      const manifest = readManifest("albums-manifest.json");
      if (manifest) {
        return NextResponse.json(
          { albums: manifest },
          { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
        );
      }

      // Fallback : appel B2 si pas de manifest
      const { apiUrl, token, bucketId } = await getB2Auth();
      const listRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify({ bucketId, prefix: "albums/", delimiter: "/" }),
      });
      const data = await listRes.json();
      const folders = (data.files || [])
        .filter((f) => f.fileName.endsWith("/") && f.fileName !== "albums/")
        .map((f) => {
          const cleanId = f.fileName.replace("albums/", "").replace("/", "");
          return {
            id: cleanId,
            title: cleanId.replaceAll("-", " "),
            cover: `${PUBLIC_BASE_URL}albums/${cleanId}/thumbs/cover.jpg`,
          };
        });

      return NextResponse.json(
        { albums: folders },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
      );
    }

    // -------------------------------------------------------
    // CAS 2 : PHOTOS BESTOF (page principale)
    // -------------------------------------------------------
    if (!albumId) {
      const manifest = readManifest("bestof-manifest.json");
      if (manifest) {
        return NextResponse.json(
          { items: manifest },
          { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
        );
      }
    }

    // -------------------------------------------------------
    // CAS 3 : PHOTOS D'UN ALBUM
    // -------------------------------------------------------
    const albumManifest = albumId ? readManifest(`albums/${albumId}-manifest.json`) : null;
    if (albumManifest) {
      return NextResponse.json(
        { items: albumManifest },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
      );
    }

    // Fallback : appel B2
    const { apiUrl, token, bucketId } = await getB2Auth();
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

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
