"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const isAlbums = pathname.startsWith("/albums");

  return (
    <header style={{ padding: "40px 0", textAlign: "center" }}>
      <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
        <h1 style={{
          fontSize: "11px",
          letterSpacing: "5px",
          fontWeight: "300",
          textTransform: "uppercase",
          marginBottom: "20px",
          cursor: "pointer",
        }}>
          MATTJNO | Sport Photography
        </h1>
      </Link>

      <nav style={{ display: "flex", justifyContent: "center", gap: "25px" }}>
        <Link href="/" style={{
          fontSize: "10px",
          letterSpacing: "2px",
          textDecoration: "none",
          color: isAlbums ? "#555" : "#fff",
          borderBottom: isAlbums ? "none" : "1px solid #fff",
          paddingBottom: "4px",
          textTransform: "uppercase",
          transition: "color 0.3s",
        }}>
          Sélection
        </Link>
        <Link href="/albums" style={{
          fontSize: "10px",
          letterSpacing: "2px",
          textDecoration: "none",
          color: isAlbums ? "#fff" : "#555",
          borderBottom: isAlbums ? "1px solid #fff" : "none",
          paddingBottom: "4px",
          textTransform: "uppercase",
          transition: "color 0.3s",
        }}>
          Albums
        </Link>
      </nav>
    </header>
  );
}
