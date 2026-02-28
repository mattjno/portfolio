"use client";

import { useEffect, useState } from "react";
import SiteHeader from "./components/SiteHeader";
import MasonryGallery, { MasonrySkeleton } from "./components/MasonryGallery";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data) => {
        const photos = Array.isArray(data) ? data : data?.items || [];
        setItems(photos);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de chargement:", err);
        setError("Impossible de charger les photos.");
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "10px" }}>
      <SiteHeader />

      {loading && <MasonrySkeleton />}

      {error && (
        <div style={{ textAlign: "center", fontSize: "10px", color: "#f66", marginTop: "60px" }}>
          {error}
        </div>
      )}

      {!loading && !error && <MasonryGallery items={items} />}
    </main>
  );
}
