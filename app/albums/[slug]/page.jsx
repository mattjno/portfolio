"use client";

import { useEffect, useState } from "react";

export default function AlbumPage({ params }) {
  const { slug } = params;
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/album?slug=${slug}`);
      const data = await res.json();
      setPhotos(data.items || []);
    }
    load();
  }, [slug]);

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>{slug.replace(/_/g, " ")}</h1>

      <div className="masonry">
        {photos.map((src) => (
          <img key={src} src={src} />
        ))}
      </div>

      <style jsx>{`
        .masonry {
          column-count: 5;
          column-gap: 12px;
        }
        img {
          width: 100%;
          margin-bottom: 12px;
          border-radius: 4px;
        }
      `}</style>
    </main>
  );
}
