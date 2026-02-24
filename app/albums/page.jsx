"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/albums");
      const data = await res.json();
      setAlbums(data.albums || []);
    }
    load();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Albums</h1>

      <div className="grid">
        {albums.map((album) => (
          <Link key={album.slug} href={`/albums/${album.slug}`} className="tile">
            <img src={album.cover} />
            <div className="title">{album.title}</div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .tile {
          text-decoration: none;
          color: white;
        }

        img {
          width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .title {
          margin-top: 6px;
          font-size: 14px;
          opacity: 0.8;
        }
      `}</style>
    </main>
  );
}
