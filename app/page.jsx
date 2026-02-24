"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    fetch("/api/photos")
      .then(res => res.json())
      .then(data => {
        const photos = Array.isArray(data) ? data : (data?.items || []);
        setItems(photos);
      });
  }, []);

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "10px" }}>
      <header style={{ padding: "20px 0", textAlign: "center" }}>
        <h1 style={{ fontSize: "11px", letterSpacing: "5px", fontWeight: "300", textTransform: "uppercase" }}>
          MATTJNO | Sport Photography
        </h1>
      </header>

      <section className="masonry-gallery">
        {items.map((it, i) => (
          <div
            key={it.name || i}
            className="masonry-brick"
            style={{ 
              /* 1. On réserve l'espace EXACT avec le ratio */
              aspectRatio: `${it.w} / ${it.h}`,
              /* 2. On définit une hauteur minimale pour éviter que la div ne fasse 0px au départ */
              minHeight: "50px" 
            }}
            onClick={() => setIndex(i)}
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

      {/* Modal Plein Écran */}
      {index !== null && items[index] && (
        <div className="modal" onClick={() => setIndex(null)}>
          <button className="close-btn">✕</button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={items[index].full}
              className="modal-img"
              alt=""
            />
            <button className="nav-btn left" onClick={prev}>‹</button>
            <button className="nav-btn right" onClick={next}>›</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        body { margin: 0; background: #000; }

        .masonry-gallery {
          column-count: 6;
          column-gap: 12px;
          padding: 0 10px;
          /* 3. Empêche le recalcul global pendant le scroll */
          contain: layout;
        }

        .masonry-brick {
          break-inside: avoid;
          margin-bottom: 12px;
          background: #111; /* Petit gris foncé pour simuler la photo qui arrive */
          cursor: pointer;
          width: 100%;
          border-radius: 2px;
          overflow: hidden;
          /* 4. Force le maintien de la position */
          transform: translateZ(0); 
        }

        .raw-img {
          width: 100%;
          height: auto;
          display: block;
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        /* Modal simple */
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { position: relative; max-width: 90vw; }
        .modal-img { max-width: 90vw; max-height: 90vh; object-fit: contain; }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: none; border: none; color: white; font-size: 50px; cursor: pointer; padding: 20px; }
        .left { left: -70px; }
        .right { right: -70px; }
        .close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 30px; cursor: pointer; }

        @media (max-width: 1200px) { .masonry-gallery { column-count: 4; } }
        @media (max-width: 800px) { .masonry-gallery { column-count: 2; } .nav-btn { display: none; } }
      `}</style>
    </main>
  );
}
