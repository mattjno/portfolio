/**
 * generate-album-manifest.mjs
 * 
 * Génère un manifest JSON pour chaque album avec les dimensions réelles des images.
 * 
 * Produit :
 *   public/albums-manifest.json          → liste des albums avec cover
 *   public/albums/<id>-manifest.json     → photos de chaque album avec w/h
 */

import fs from "fs";
import { imageSize } from "image-size";

const BUCKET_NAME = "mattjno-photos";
const PUBLIC_BASE_URL = `https://f003.backblazeb2.com/file/${BUCKET_NAME}/`;

const keyId = process.env.B2_KEY_ID;
const appKey = process.env.B2_APPLICATION_KEY;

if (!keyId || !appKey) {
  throw new Error("Missing B2_KEY_ID or B2_APPLICATION_KEY");
}

async function mapLimit(arr, limit, fn) {
  const out = new Array(arr.length);
  let i = 0;
  async function worker() {
    while (i < arr.length) {
      const idx = i++;
      out[idx] = await fn(arr[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, arr.length) }, worker));
  return out;
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Auth B2
const authRes = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
  headers: { Authorization: "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64") },
});
if (!authRes.ok) throw new Error(`Auth failed: ${await authRes.text()}`);
const auth = await authRes.json();
const { apiUrl, authorizationToken: token, allowed } = auth;
const bucketId = allowed?.bucketId;

// 1. Lister les dossiers d'albums
console.log("📁 Listing albums...");
const foldersRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
  method: "POST",
  headers: { Authorization: token, "Content-Type": "application/json" },
  body: JSON.stringify({ bucketId, prefix: "albums/", delimiter: "/" }),
});
const foldersData = await foldersRes.json();
const albumFolders = (foldersData.files || [])
  .filter((f) => f.fileName.endsWith("/") && f.fileName !== "albums/")
  .map((f) => f.fileName.replace("albums/", "").replace("/", ""));

console.log(`Found ${albumFolders.length} albums: ${albumFolders.join(", ")}`);

// 2. Pour chaque album, lister et mesurer les thumbs
fs.mkdirSync("public/albums", { recursive: true });

const albumsSummary = [];

for (const albumId of albumFolders) {
  console.log(`\n📸 Processing album: ${albumId}`);
  const THUMBS_PREFIX = `albums/${albumId}/thumbs/`;
  const FULL_PREFIX = `albums/${albumId}/full/`;

  const listRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ bucketId, prefix: THUMBS_PREFIX, maxFileCount: 1000 }),
  });
  const listData = await listRes.json();

  const thumbFiles = (listData.files || []).filter(
    (f) => /\.(jpg|jpeg|png|webp)$/i.test(f.fileName) && !f.fileName.includes("cover.jpg")
  );

  console.log(`  → ${thumbFiles.length} photos`);

  const items = await mapLimit(thumbFiles, 6, async (f) => {
    const fileNameOnly = f.fileName.slice(THUMBS_PREFIX.length);
    const thumbUrl = `${PUBLIC_BASE_URL}${f.fileName}`;
    const fullUrl = `${PUBLIC_BASE_URL}${FULL_PREFIX}${fileNameOnly}`;

    try {
      const buf = await fetchBuffer(thumbUrl);
      const dim = imageSize(buf);
      return {
        name: fileNameOnly,
        w: dim.width || 1,
        h: dim.height || 1,
        thumb: thumbUrl,
        full: fullUrl,
      };
    } catch (e) {
      console.warn(`  ⚠️  Could not get dimensions for ${fileNameOnly}: ${e.message}`);
      return { name: fileNameOnly, w: 3, h: 2, thumb: thumbUrl, full: fullUrl };
    }
  });

  const manifestPath = `public/albums/${albumId}-manifest.json`;
  fs.writeFileSync(manifestPath, JSON.stringify(items, null, 2) + "\n");
  console.log(`  ✅ Written ${manifestPath}`);

  const coverFile = (listData.files || []).find((f) => f.fileName.includes("cover.jpg"));
  const cover = coverFile
    ? `${PUBLIC_BASE_URL}${coverFile.fileName}`
    : items[0]?.thumb || null;

  albumsSummary.push({
    id: albumId,
    title: albumId.replaceAll("-", " "),
    cover,
    count: items.length,
  });
}

// 3. Écrire le manifest global des albums
fs.writeFileSync("public/albums-manifest.json", JSON.stringify(albumsSummary, null, 2) + "\n");
console.log(`\n✅ Written public/albums-manifest.json (${albumsSummary.length} albums)`);
console.log("🎉 Done!");
