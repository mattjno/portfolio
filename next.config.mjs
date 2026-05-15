import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const revalidate = 300;

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "gallery-manifest.json");
    const manifest = JSON.parse(readFileSync(filePath, "utf-8"));
    return NextResponse.json(manifest, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
