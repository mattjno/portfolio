"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    fetch("/api/photos")
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data : (data?.items || [])));
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
            onClick={() => setIndex(i)}
            style={{ 
              /* 1. On force le ratio ici pour bloquer la hauteur immédiatement */
              aspectRatio: `${it.w} / ${it.h}`,
              /* 2. On ajoute une couleur de fond pour voir le bloc pendant le chargement */
              backgroundColor: "#0d0d0d"
            }}
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

      {/* Modal */}
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
        body { margin: 0; background: #000; }

        .masonry-gallery {
          column-count: 6;
          column-gap: 12px;
          padding: 0 10px;
          width: 100%;
        }

        .masonry-brick {
          break-inside: avoid;
          margin-bottom: 12px;
          cursor: pointer;
          width: 100%;
          display: block;
          overflow: hidden;
          border-radius: 2px;
          /* 3. On aide le navigateur à ne pas s'effondrer */
          contain: size layout;
        }

        .raw-img {
          width: 100%;
          height: 100%; /* L'image remplit le bloc déjà dimensionné */
          display: block;
          opacity: 0;
          transition: opacity 0.6s ease;
          object-fit: cover;
        }

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
