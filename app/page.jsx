"use client";
import { useEffect, useState, useMemo } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Chargement du manifest avec sécurité anti-crash
  useEffect(() => {
    async function loadPhotos() {
      try {
        const res = await fetch("/api/photos");
        const data = await res.json();
        // Gère les formats [ ] ou { items: [ ] }
        const photos = Array.isArray(data) ? data : (data?.items || []);
        setItems(photos);
      } catch (e) {
        console.error("Erreur de chargement:", e);
      } finally {
        setLoading(false);
      }
    }
    loadPhotos();
  }, []);

  // 2. Fonctions de navigation
  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  // 3. Raccourcis clavier
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

  return (
    <main className="container">
      <header className="header">
        <h1 className="logo">MATTJNO | Sport Photography</h1>
        {loading && <p className="loader">Chargement de la galerie...</p>}
      </header>

      {/* GRILLE CSS GRID : Verrouille la position de chaque image */}
      <section className="photo-grid">
        {items.map((it, i) => (
          <div
            key={it.name || i}
            className="photo-brick"
            onClick={() => setIndex(i)}
            style={{ 
              /* Utilise w et h du manifest pour bloquer l'espace immédiatement */
              aspectRatio: it.w && it.h ? `${it.w} / ${it.h}` : "4 / 5"
            }}
          >
            <img
              src={it.thumb}
              alt=""
              loading="lazy"
              className="photo-img"
              onLoad={(e) => e.currentTarget.classList.add("loaded")}
            />
          </div>
        ))}
      </section>

      {/* MODAL : Responsive et tactile-friendly */}
      {index !== null && items[index] && (
        <div className="modal" onClick={() => setIndex(null)}>
          <button className="close-btn">✕</button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={items[index].full} 
              className="modal-img" 
              alt="" 
            />
            <div className="nav-container">
               <button className="nav-btn" onClick={prev}>‹</button>
               <button className="nav-btn" onClick={next}>›</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Reset & Base */
        body { 
          margin: 0; 
          background: #000; 
          color: #fff; 
          font-family: -apple-system, system-ui, sans-serif;
          overflow-x: hidden;
        }

        .container { padding: 10px; min-height: 100vh; }

        .header { 
          padding: 40px 0; 
          text-align: center; 
        }

        .logo { 
          font-size: 11px; 
          letter-spacing: 6px; 
          font-weight: 300; 
          text-transform: uppercase; 
          opacity: 0.8;
          margin: 0;
        }

        .loader { font-size: 10px; opacity: 0.4; margin-top: 15px; }

        /* --- LA GRILLE --- */
        .photo-grid {
          display: grid;
          /* Défaut (PC) : 6 colonnes */
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          max-width: 2200px;
          margin: 0 auto;
          align-items: start; /* Garde le haut des images aligné */
        }

        .photo-brick {
          width: 100%;
          cursor: pointer;
          background: #0a0a0a; /* Squelette noir en attendant l'image */
          overflow: hidden;
          border-radius: 2px;
          transition: transform 0.3s ease;
        }

        .photo-brick:hover {
          transform: scale(1.02);
          z-index: 2;
        }

        .photo-img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        .photo-img.loaded { opacity: 1; }

        /* --- MODAL --- */
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 95vw;
        }

        .modal-img {
          max-width: 95vw;
          max-height: 92vh;
          object-fit: contain;
          box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }

        .nav-container {
          position: absolute;
          width: 110%;
          display: flex;
          justify-content: space-between;
          pointer-events: none;
        }

        .nav-btn {
          pointer-events: auto;
          background: none;
          border: none;
          color: #fff;
          font-size: 60px;
          cursor: pointer;
          opacity: 0.3;
          transition: 0.2s;
          padding: 20px;
        }

        .nav-btn:hover { opacity: 1; }

        .close-btn {
          position: absolute;
          top: 25px;
          right: 25px;
          background: none;
          border: none;
          color: #fff;
          font-size: 30px;
          cursor: pointer;
          z-index: 1010;
        }

        /* --- RESPONSIVE / IPAD & MOBILE --- */

        /* iPad Landscape / Small PC */
        @media (max-width: 1200px) {
          .photo-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* iPad Portrait / Tablets */
        @media (max-width: 900px) {
          .photo-grid { grid-template-columns: repeat(3, 1fr); }
          .nav-container { width: 100%; padding: 0 10px; }
          .nav-btn { font-size: 45px; }
        }

        /* Mobile */
        @media (max-width: 600px) {
          .photo-grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 8px; 
          }
          .nav-container { display: none; } /* On navigue en fermant/cliquant sur mobile */
          .logo { font-size: 10px; letter-spacing: 4px; }
          .close-btn { top: 15px; right: 15px; }
        }
      `}</style>
    </main>
  );
}
