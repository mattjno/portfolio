"use client";

import { useEffect, useMemo, useState } from "react";

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
        if (!res.ok) throw new Error(data?.error || "Failed to load photos");
        if (alive) setItems(data.items || []);
      } catch (e) {
        console.error(e);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
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
    <main style={{ padding: 20 }}>
      <header style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, letterSpacing: 2, opacity: 0.85 }}>
          {title}
        </div>
        {loading && (
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.65 }}>
            Chargement…
          </div>
        )}
      </header>

      <section className="grid">
        {items.map((it, i) => (
          <button
            key={it.thumb}
            className="tile"
            onClick={() => open(i)}
            aria-label="Open photo"
          >
            <img
              src={it.thumb}
              className="img"
              loading="lazy"
              decoding="async"
              onLoad={(e) => e.currentTarget.classList.add("loaded")}
              alt=""
            />
          </button>
        ))}
      </section>

      {index !== null && (
        <div className="modal" onClick={close}>
          <button
            className="nav left"
            onClick={(e) => (e.stopPropagation(), prev())}
            aria-label="Previous"
          >
            ‹
          </button>

          <img
            src={items[index]?.full}
            className="modalImg"
            onClick={(e) => e.stopPropagation()}
            alt=""
          />

          <button
            className="nav right"
            onClick={(e) => (e.stopPropagation(), next())}
            aria-label="Next"
          >
            ›
          </button>

          <button
            className="close"
            onClick={(e) => (e.stopPropagation(), close())}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      <style jsx global>{`
        body {
          background: #000;
          color: #fff;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 1600px) {
          .grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
        }
        @media (max-width: 1200px) {
          .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (max-width: 900px) {
          .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 600px) {
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        .tile {
          border: 0;
          padding: 0;
          background: #111;
          cursor: pointer;
          border-radius: 2px;
          overflow: hidden;
        }

        .img {
          width: 100%;
          height: auto;
          display: block;
          opacity: 0;
          transition: opacity 200ms ease;
        }

        .img.loaded {
          opacity: 1;
        }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .modalImg {
          max-width: 94vw;
          max-height: 92vh;
          object-fit: contain;
        }

        .nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          font-size: 34px;
          width: 48px;
          height: 48px;
          border-radius: 999px;
          cursor: pointer;
        }

        .nav.left { left: 18px; }
        .nav.right { right: 18px; }

        .close {
          position: absolute;
          top: 18px;
          right: 18px;
          border: 0;
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 18px;
        }
      `}</style>
    </main>
  );
}
