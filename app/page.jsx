"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    // On charge ton manifest
    fetch("/api/photos")
      .then(res => res.json())
      .then(data => setItems(data || [])); // Utilise direct 'data' si c'est une liste
  }, []);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '10px' }}>
      <header style={{ marginBottom: '30px', padding: '10px 0' }}>
        <h1 style={{ fontSize: '12px', letterSpacing: '4px', fontWeight: '300', textTransform: 'uppercase', opacity: 0.8 }}>
          MATTJNO | Sport Photography
        </h1>
      </header>

      <div className="masonry-grid">
        {items.map((it, i) => (
          <div 
            key={it.name} 
            className="masonry-item" 
            onClick={() => setIndex(i)}
            style={{ 
              /* Utilisation de 'w' et 'h' de ton JSON pour bloquer la mise en page */
              aspectRatio: `${it.w} / ${it.h}`,
              backgroundColor: '#0a0a0a' 
            }}
          >
            <img 
              src={it.thumb} 
              alt={it.name}
              loading="lazy" 
              className="gallery-img"
              onLoad={(e) => e.currentTarget.style.opacity = "1"}
            />
          </div>
        ))}
      </div>

      {/* Modal Plein Écran Adaptable */}
      {index !== null && (
        <div className="modal" onClick={() => setIndex(null)}>
          <button className="close-btn">✕</button>
          
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={items[index]?.full} 
              className="modal-img" 
              alt="" 
              style={{ aspectRatio: `${items[index].w} / ${items[index].h}` }}
            />
            
            <button className="nav-btn prev" onClick={() => setIndex((index - 1 + items.length) % items.length)}>‹</button>
            <button className="nav-btn next" onClick={() => setIndex((index + 1) % items.length)}>›</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .masonry-grid {
          column-count: 6;
          column-gap: 8px;
          width: 100%;
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 8px;
          border-radius: 1px;
          cursor: pointer;
          overflow: hidden;
          width: 100%;
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          display: block;
          opacity: 0;
          transition: opacity 0.4s ease-in-out;
          object-fit: cover;
        }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.98);
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
        }

        .modal-img {
          max-width: 95vw;
          max-height: 92vh;
          object-fit: contain;
          box-shadow: 0 0 40px rgba(0,0,0,0.5);
        }

        .nav-btn {
          position: absolute;
          background: none;
          border: none;
          color: white;
          font-size: 60px;
          cursor: pointer;
          opacity: 0.3;
          transition: 0.2s;
          padding: 20px;
          top: 50%;
          transform: translateY(-50%);
        }
        .nav-btn:hover { opacity: 1; }
        .prev { left: -80px; }
        .next { right: -80px; }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          z-index: 1010;
        }

        /* Responsiveness pour garder des photos visibles */
        @media (max-width: 1600px) { .masonry-grid { column-count: 5; } }
        @media (max-width: 1200px) { .masonry-grid { column-count: 4; } }
        @media (max-width: 900px) { 
          .masonry-grid { column-count: 2; } 
          .prev, .next { display: none; }
        }
      `}</style>
    </main>
  );
}
