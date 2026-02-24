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

      {/* SYSTÈME MASONRY : Respecte les hauteurs naturelles */}
      <section className="masonry-gallery">
        {items.map((it, i) => (
          <div
            key={it.name || i}
            className="masonry-brick"
            onClick={() => setIndex(i)}
            style={{ 
              /* On utilise tes données w et h pour calculer le ratio réel */
              aspectRatio: it.w && it.h ? `${it.w} / ${it.h}` : "auto",
            }}
          >
            <img
              src={it.thumb}
              alt={it.name}
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
              style={{ aspectRatio: `${items[index].w} / ${items[index].h}` }}
              alt=""
            />
            <button className="nav-btn left" onClick={prev}>‹</button>
            <button className="nav-btn right" onClick={next}>›</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        body { margin: 0; background: #000; overflow-x: hidden; }

        .masonry-gallery {
          column-count: 6; /* Tes 6 colonnes */
          column-gap: 8px;
          padding: 0 10px;
        }

        .masonry-brick {
          break-inside: avoid;
          margin-bottom: 8px;
          background: #0a0a0a; /* Fond en attendant l'image */
          cursor: pointer;
          width: 100%;
          border-radius: 2px;
          overflow: hidden;
        }

        .raw-img {
          width: 100%;
          height: auto; /* CRUCIAL : L'image prend sa hauteur naturelle */
          display: block;
          opacity: 0;
          transition: opacity 0.5s ease;
          /* On retire object-fit: cover pour éviter le zoom */
        }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content { position: relative; max-width: 95vw; }

        .modal-img {
          max-width: 95vw;
          max-height: 90vh;
          object-fit: contain; /* Respecte le format paysage en grand aussi */
          display: block;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: white;
          font-size: 50px;
          cursor: pointer;
          padding: 20px;
          opacity: 0.3;
          transition: 0.2s;
        }
        .nav-btn:hover { opacity: 1; }
        .left { left: -70px; }
        .right { right: -70px; }

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

        /* Ajustement colonnes selon l'écran */
        @media (max-width: 1600px) { .masonry-gallery { column-count: 5; } }
        @media (max-width: 1200px) { .masonry-gallery { column-count: 4; } }
        @media (max-width: 800px) { 
          .masonry-gallery { column-count: 2; } 
          .left, .right { display: none; }
        }
      `}</style>
    </main>
  );
}
