"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    fetch("/api/photos").then(res => res.json()).then(data => setItems(data.items || []));
  }, []);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <header style={{ marginBottom: '20px', fontSize: '12px', letterSpacing: '2px' }}>
        MATTJNO | SPORT PHOTOGRAPHY
      </header>

      {/* Grille type "Pinterest" (Masonry) : Idéal pour portrait + paysage */}
      <div className="columns">
        {items.map((it, i) => (
          <div key={i} className="item" onClick={() => setIndex(i)}>
            <img src={it.thumb} alt="" loading="lazy" />
          </div>
        ))}
      </div>

      {/* Modal Plein Écran */}
      {index !== null && (
        <div className="modal" onClick={() => setIndex(null)}>
          <img src={items[index]?.full} className="modal-img" alt="" />
          <button className="close-x">✕</button>
        </div>
      )}

      <style jsx>{`
        .columns {
          column-count: 4; /* Nombre de colonnes */
          column-gap: 10px;
        }
        .item {
          margin-bottom: 10px;
          break-inside: avoid;
          cursor: pointer;
        }
        .item img {
          width: 100%;
          display: block;
          border-radius: 4px;
        }
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .modal-img {
          max-width: 95vw;
          max-height: 95vh;
          object-fit: contain;
        }
        .close-x {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
        }

        /* Ajustement mobile */
        @media (max-width: 800px) { .columns { column-count: 2; } }
      `}</style>
    </main>
  );
}
