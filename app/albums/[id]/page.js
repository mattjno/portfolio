"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MasonryGallery, { MasonrySkeleton } from "../../components/MasonryGallery";

export default function AlbumDetailPage() {
  const params = useParams();
  const albumId = params?.id;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;
    fetch(`/api/photos?album=${albumId}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, [albumId]);

  if (!albumId) return null;

  const title = albumId.replaceAll("-", " ").toUpperCase();

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "10px" }}>
      <header style={{ padding: "30px 0", textAlign: "center" }}>
        <Link
          href="/albums"
          style={{
            display: "inline-block",
            marginBottom: "15px",
            fontSize: "9px",
            letterSpacing: "2px",
            color: "#555",
            textDecoration: "none",
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#fff")}
          onMouseLeave={(e) => (e.target.style.color = "#555")}
        >
          ← Retour aux albums
        </Link>
        <h1
          style={{
            fontSize: "11px",
            letterSpacing: "5px",
            fontWeight: "300",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {!loading && (
          <p style={{ fontSize: "9px", opacity: 0.3, marginTop: "8px", letterSpacing: "2px" }}>
            {items.length} photo{items.length !== 1 ? "s" : ""}
          </p>
        )}
      </header>

      {loading ? <MasonrySkeleton /> : <MasonryGallery items={items} />}
    </main>
  );
}
