"use client";

import { useEffect, useState, useMemo } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(null);

  // 1. Chargement sécurisé des données
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/photos");
        const data = await res.json();
        
        // Sécurité : gère si le JSON est [ ] ou { items: [ ] }
        const photos = Array.isArray(data) ? data : (data?.items || []);
        setItems(photos);
      } catch (e) {
        console.error("Erreur API:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 2. Navigation
  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  useEffect(() => {
    const handleKey = (e) => {
      if (index === null) return;
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, items.length]);

  const title = useMemo(() => "MATTJNO | Sport Photography", []);

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "20px" }}>
      <header style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1 style={{ fontSize: "12px", letterSpacing: "4px", fontWeight: "300", opacity: 0.8 }}>
          {title}
        </h1>
        {loading && <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "10px" }}>Chargement...</div>}
      </header>

      {/* Grille Masonry 6 colonnes stable */}
      <section className="grid">
        {items.map((it, i) => (
          <button
            key={it.name || i}
            className="tile"
            onClick={() => setIndex(i)}
            style={{ 
              /* Utilisation de tes clés w et h pour bloquer le layout */
              aspectRatio: it.w && it.h ? `${it.w} / ${it.h}` : "2/3" 
            }}
          >
            <img
              src={it.thumb}
              className="img"
              loading="lazy"
              alt=""
              onLoad={(e) => e.currentTarget.classList.add("loaded")}
            />
          </button>
        ))}
      </section>

      {/* Modal Plein Écran */}
      {index !== null && items[index] && (
        <div className="modal" onClick={() => setIndex(null)}>
          <button className="close" onClick={() => setIndex(null)}>✕</button>
          
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={items[index].full}
              className="modalImg"
              style={{ aspectRatio: items[index].w && items[index].h ? `${items[index].w} / ${items[index].h}` : "auto" }}
              alt=""
            />
            
            <button className="nav left" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
            <button className="nav right" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        body { margin: 0; background: #000; }

        .grid {
          column-count: 6;
          column-gap: 10px;
          width: 100%;
        }

        .tile {
          display: block;
          width: 100%;
          border: 0;
          padding: 0;
          margin-bottom: 10px;
          background: #0a0a0a;
          cursor: pointer;
          break-inside: avoid;
          overflow: hidden;
        }

        .img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .img.loaded { opacity: 1; }

        /* Modal */
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .modal-content { position: relative; display: flex; align-items: center; }

        .modalImg {
          max-width: 95vw;
          max-height: 92vh;
          object-fit: contain;
        }

        .nav {
          position: absolute;
          background: none;
          border: none;
          color: #fff;
          font-size: 50px;
          cursor: pointer;
          opacity: 0.3;
          padding: 20px;
          transition: 0.2s;
        }
        .nav:hover { opacity: 1; }
        .nav.left { left: -80px; }
        .nav.right { right: -80px; }

        .close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
        }

        /* Responsive */
        @media (max-width: 1600px) { .grid { column-count: 5; } }
        @media (max-width: 1200px) { .grid { column-count: 4; } }
        @media (max-width: 800px) { 
          .grid { column-count: 2; } 
          .nav { display: none; }
        }
      `}</style>
    </main>
  );
}
