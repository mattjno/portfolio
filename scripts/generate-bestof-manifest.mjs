import fs from "fs";
import { imageSize } from "image-size";

const BUCKET_NAME = "mattjno-photos";
const THUMBS_PREFIX = "bestof/thumbs/";
const FULL_PREFIX = "bestof/full/";
const PUBLIC_BASE_URL = `https://f003.backblazeb2.com/file/${BUCKET_NAME}/`;

const keyId = process.env.B2_KEY_ID;
const appKey = process.env.B2_APPLICATION_KEY;

if (!keyId || !appKey) {
  throw new Error("Missing B2_KEY_ID or B2_APPLICATION_KEY (GitHub Secrets)");
}

async function b2Authorize() {
  const res = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: {
      Authorization: "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64"),
    },
  });
  if (!res.ok) throw new Error(`Authorize failed: ${await res.text()}`);
  return res.json();
}

async function listAllThumbKeys({ apiUrl, token, bucketId }) {
  let nextFileName = null;
  const keys = [];

  while (true) {
    const body = { bucketId, prefix: THUMBS_PREFIX, maxFileCount: 1000 };
    if (nextFileName) body.startFileName = nextFileName;

    const res = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`List files failed: ${await res.text()}`);

    const data = await res.json();
    for (const f of data.files || []) {
      const name = f.fileName || "";
      if (/\.(jpg|jpeg|png|webp)$/i.test(name)) keys.push(name);
    }

    nextFileName = data.nextFileName;
    if (!nextFileName) break;
  }

  keys.sort((a, b) => a.localeCompare(b));
  return keys;
}

// Limite de concurrence pour rester raisonnable
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

async function fetchImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

const auth = await b2Authorize();

const apiUrl = auth.apiUrl;
const token = auth.authorizationToken;
const bucketId = auth.allowed?.bucketId;

if (!bucketId) {
  throw new Error("No allowed.bucketId returned. Make sure the B2 key is restricted to the mattjno-photos bucket.");
}

const thumbKeys = await listAllThumbKeys({ apiUrl, token, bucketId });

const items = await mapLimit(thumbKeys, 6, async (thumbKey) => {
  const fileNameOnly = thumbKey.slice(THUMBS_PREFIX.length);
  const thumbUrl = `${PUBLIC_BASE_URL}${thumbKey}`;
  const fullUrl = `${PUBLIC_BASE_URL}${FULL_PREFIX}${fileNameOnly}`;

  const buf = await fetchImageBuffer(thumbUrl);
  const dim = imageSize(buf);

  const w = dim.width || 1;
  const h = dim.height || 1;

  return {
    name: fileNameOnly,
    w,
    h,
    thumb: thumbUrl,
    full: fullUrl,
  };
});

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/bestof-manifest.json", JSON.stringify(items, null, 2) + "\n");
console.log(`Wrote ${items.length} items to public/bestof-manifest.json`);
