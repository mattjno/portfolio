"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image"; // Import indispensable pour la vitesse

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/photos", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed");
        if (alive) setItems(data.items || []);
      } catch (e) {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const open = (i) => setIndex(i);
  const close = () => setIndex(null);
  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  useEffect(() => {
    const handleKey = (e) => {
      if (index === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, items.length]);

  const title = useMemo(() => "MATTJNO | Sport Photography", []);

  return (
    <main style={{ padding: "20px" }}>
      <header style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 14, letterSpacing: 4, opacity: 0.85, textTransform: 'uppercase' }}>
          {title}
        </h1>
        {loading && <div style={{ fontSize: 12, opacity: 0.5 }}>Chargement...</div>}
      </header>

      {/* Section Masonry */}
      <section className="masonry-grid">
        {items.map((it, i) => (
          <div key={it.thumb} className="masonry-item" onClick={() => open(i)}>
            <Image
              src={it.thumb}
              alt=""
              width={500} // Largeur de référence pour l'optimisation
              height={700} // Hauteur de référence (Next calculera le ratio)
              className="img-fluid"
              sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 16vw"
            />
          </div>
        ))}
      </section>

      {/* Modal - Plein écran adaptable */}
      {index !== null && (
        <div className="modal" onClick={close}>
          <button className="nav left" onClick={(e) => {e.stopPropagation(); prev();}}>‹</button>
          
          <div className="modal-content">
             <Image 
                src={items[index]?.full} 
                alt="" 
                fill 
                className="modalImg"
                priority // Charge l'image de la modal immédiatement
             />
          </div>

          <button className="nav right" onClick={(e) => {e.stopPropagation(); next();}}>›</button>
          <button className="close" onClick={close}>✕</button>
        </div>
      )}

      <style jsx global>{`
        body { background: #000; color: #fff; margin: 0; font-family: sans-serif; }

        /* Configuration du Masonry */
        .masonry-grid {
          column-count: 6;
          column-gap: 15px;
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 15px;
          cursor: pointer;
          background: #111;
          transition: transform 0.3s ease;
        }
        
        .masonry-item:hover { transform: scale(1.02); }

        .img-fluid {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 2px;
        }

        /* Responsive Masonry */
        @media (max-width: 1600px) { .masonry-grid { column-count: 5; } }
        @media (max-width: 1200px) { .masonry-grid { column-count: 4; } }
        @media (max-width: 900px) { .masonry-grid { column-count: 3; } }
        @media (max-width: 600px) { .masonry-grid { column-count: 2; } }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .modal-content {
          position: relative;
          width: 90vw;
          height: 85vh;
        }

        .modalImg {
          object-fit: contain; /* Garde le ratio peu importe le format */
        }

        .nav, .close {
          position: absolute;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 40px;
          z-index: 10;
          opacity: 0.6;
          transition: 0.2s;
        }
        .nav:hover, .close:hover { opacity: 1; }
        .nav.left { left: 20px; }
        .nav.right { right: 20px; }
        .close { top: 20px; right: 20px; font-size: 24px; }
      `}</style>
    </main>
  );
}
