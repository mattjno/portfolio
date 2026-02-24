"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function AlbumDetailPage({ params: paramsPromise }) {
  // On récupère l'ID de l'album depuis l'URL (ex: 2026-02-21-OMvsOL)
  const params = use(paramsPromise);
  const albumId = params.id;

  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On appelle l'API avec le paramètre 'album'
    fetch(`/api/photos?album=${albumId}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement album:", err);
        setLoading(false);
      });
  }, [albumId]);

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "10px" }}>
      <header style={{ padding: "30px 0", textAlign: "center" }}>
        <Link href="/albums" style={{ 
          display: 'inline-block', 
          marginBottom: '15px', 
          fontSize: '10px', 
          letterSpacing: '2px', 
          color: '#555', 
          textDecoration: 'none',
          textTransform: 'uppercase'
        }}>
          ← Retour aux albums
        </Link>
        <h1 style={{ fontSize: "11px", letterSpacing: "5px", fontWeight: "300", textTransform: "uppercase", margin: 0 }}>
          {albumId.replaceAll("-", " ")}
        </h1>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', fontSize: '10px', opacity: 0.5 }}>Chargement des photos...</div>
      ) : (
        <section className="masonry-gallery">
          {items.map((it, i) => (
            <div
              key={it.name || i}
              className="masonry-brick"
              onClick={() => setIndex(i)}
              style={{ aspectRatio: `auto` }} // Le masonry gère le reste
            >
              <img
                src={it.thumb}
                alt=""
                loading="lazy"
                className="raw-img"
                onLoad={(e) => e.currentTarget.style.opacity = "1"}
              />
            </div>
          ))}
        </section>
      )}

      {/* Modal identique à ta page d'accueil */}
      {index !== null && items[index] && (
        <div className="modal" onClick={() => setIndex(null)}>
          <button className="close-btn">✕</button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={items[index].full} className="modal-img" alt="" />
            <button className="nav-btn left" onClick={prev}>‹</button>
            <button className="nav-btn right" onClick={next}>›</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .masonry-gallery {
          column-count: 6;
          column-gap: 12px;
          padding: 0 10px;
        }

        .masonry-brick {
          break-inside: avoid;
          margin-bottom: 12px;
          background: #111;
          cursor: pointer;
          border-radius: 2px;
          overflow: hidden;
        }

        .raw-img {
          width: 100%;
          height: auto;
          display: block;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        /* Modal Styles */
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { position: relative; max-width: 90vw; }
        .modal-img { max-width: 90vw; max-height: 90vh; object-fit: contain; }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: none; border: none; color: white; font-size: 50px; cursor: pointer; padding: 20px; }
        .left { left: -70px; }
        .right { right: -70px; }
        .close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 30px; cursor: pointer; }

        /* Responsive */
        @media (max-width: 1200px) { .masonry-gallery { column-count: 4; } }
        @media (max-width: 900px) { .masonry-gallery { column-count: 3; } }
        @media (max-width: 600px) { 
          .masonry-gallery { column-count: 2; } 
          .nav-btn { display: none; }
          .left, .right { display: none; }
        }
      `}</style>
    </main>
  );
}
