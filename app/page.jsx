"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    fetch("/api/photos").then(res => res.json()).then(data => setItems(data.items || []));
  }, []);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '15px' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '14px', letterSpacing: '4px', fontWeight: '300' }}>
          MATTJNO | SPORT PHOTOGRAPHY
        </h1>
      </header>

      {/* Grille à 6 colonnes avec stabilisation */}
      <div className="masonry-grid">
        {items.map((it, i) => (
          <div key={i} className="masonry-item" onClick={() => setIndex(i)}>
            <img 
              src={it.thumb} 
              alt="" 
              loading="lazy" 
              className="gallery-img"
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {index !== null && (
        <div className="modal" onClick={() => setIndex(null)}>
          <button className="close-btn">✕</button>
          <img src={items[index]?.full} className="modal-img" alt="" onClick={(e) => e.stopPropagation()} />
          <div className="nav-container">
            <button className="nav-btn" onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + items.length) % items.length); }}>‹</button>
            <button className="nav-btn" onClick={(e) => { e.stopPropagation(); setIndex((index + 1) % items.length); }}>›</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .masonry-grid {
          column-count: 6; /* Tes 6 colonnes */
          column-gap: 12px;
          width: 100%;
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 12px;
          background: #111; /* Couleur d'attente */
          border-radius: 2px;
          cursor: pointer;
          overflow: hidden;
        }

        .gallery-img {
          width: 100%;
          height: auto;
          display: block;
          transition: opacity 0.3s ease;
          /* Supprime le saut de mise en page */
          content-visibility: auto; 
        }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.97);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-img {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          user-select: none;
        }

        .nav-container {
          position: absolute;
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          pointer-events: none;
        }

        .nav-btn {
          pointer-events: auto;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          font-size: 40px;
          padding: 10px 20px;
          cursor: pointer;
          border-radius: 50%;
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: white;
          font-size: 30px;
          cursor: pointer;
        }

        /* Responsiveness */
        @media (max-width: 1400px) { .masonry-grid { column-count: 5; } }
        @media (max-width: 1100px) { .masonry-grid { column-count: 4; } }
        @media (max-width: 800px) { .masonry-grid { column-count: 3; } }
        @media (max-width: 500px) { .masonry-grid { column-count: 2; } }
      `}</style>
    </main>
  );
}
