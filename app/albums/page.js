"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AlbumsListPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On appelle notre API avec le paramètre 'list'
    fetch("/api/photos?list=true")
      .then((res) => res.json())
      .then((data) => {
        setAlbums(data.albums || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur albums:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "10px" }}>
      <header style={{ padding: "40px 0", textAlign: "center" }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ fontSize: "11px", letterSpacing: "5px", fontWeight: "300", textTransform: "uppercase", cursor: 'pointer' }}>
            MATTJNO | Sport Photography
          </h1>
        </Link>
        <p style={{ fontSize: "10px", opacity: 0.5, marginTop: "10px", letterSpacing: "2px" }}>ALBUMS & MATCHS</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', fontSize: '10px', opacity: 0.5 }}>Chargement des matchs...</div>
      ) : (
        <section className="albums-grid">
          {albums.map((album) => (
            <Link href={`/albums/${album.id}`} key={album.id} className="album-card">
              <div className="album-cover-container">
                {album.cover ? (
                  <img src={album.cover} alt={album.title} className="album-cover-img" />
                ) : (
                  <div className="no-cover">Pas encore de photos</div>
                )}
                <div className="album-overlay">
                  <span className="view-text">VOIR LE MATCH</span>
                </div>
              </div>
              <h2 className="album-title">{album.title}</h2>
            </Link>
          ))}
        </section>
      )}

      <style jsx>{`
        .albums-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* 3 colonnes sur PC */
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .album-card {
          text-decoration: none;
          color: white;
          group: hover;
        }

        .album-cover-container {
          position: relative;
          aspect-ratio: 3 / 2; /* Format paysage pour les couvertures */
          background: #111;
          overflow: hidden;
          border-radius: 2px;
        }

        .album-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .album-card:hover .album-cover-img {
          transform: scale(1.05);
        }

        .album-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }

        .album-card:hover .album-overlay {
          background: rgba(0, 0, 0, 0.4);
        }

        .view-text {
          font-size: 10px;
          letter-spacing: 3px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .album-card:hover .view-text {
          opacity: 1;
          transform: translateY(0);
        }

        .album-title {
          font-size: 12px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 15px;
          text-align: center;
        }

        .no-cover {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          opacity: 0.3;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .albums-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .albums-grid { grid-template-columns: 1fr; gap: 20px; }
          .album-title { font-size: 10px; }
        }
      `}</style>
    </main>
  );
}
