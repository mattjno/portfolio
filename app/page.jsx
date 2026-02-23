"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [urls, setUrls] = useState([]);
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
        if (alive) setUrls(data.urls || []);
      } catch (e) {
        console.error(e);
        if (alive) setUrls([]);
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

  const next = () => setIndex((prev) => (prev + 1) % urls.length);
  const prev = () =>
    setIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));

  useEffect(() => {
    const handleKey = (e) => {
      if (index === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, urls.length]);

  return (
    <main style={{ padding: "20px" }}>
      <header style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, letterSpacing: 2, opacity: 0.85 }}>
          MATTJNO | Sport Photography
        </div>
        {loading && (
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.65 }}>
            Chargement…
          </div>
        )}
      </header>

      <section className="masonry">
        {urls.map((src, i) => (
          <button key={src} className="item" onClick={() => open(i)} aria-label="Open photo">
            <img
              src={src}
              className="img"
              loading="lazy"
              decoding="async"
              onLoad={(e) => e.currentTarget.classList.add("loaded")}
            />
          </button>
        ))}
      </section>

      {index !== null && (
        <div className="modal" onClick={close}>
          <button className="nav left" onClick={(e) => (e.stopPropagation(), prev())} aria-label="Previous">
            ‹
          </button>

          <img
            src={urls[index]}
            className="modalImg"
            onClick={(e) => e.stopPropagation()}
          />

          <button className="nav right" onClick={(e) => (e.stopPropagation(), next())} aria-label="Next">
            ›
          </button>

          <button className="close" onClick={(e) => (e.stopPropagation(), close())} aria-label="Close">
            ✕
          </button>
        </div>
      )}

      <style jsx global>{`
        body {
          background: #000;
          color: #fff;
        }

        .masonry {
          column-count: 6;
          column-gap: 14px;
        }

        @media (max-width: 1600px) {
          .masonry { column-count: 5; }
        }
        @media (max-width: 1200px) {
          .masonry { column-count: 4; }
        }
        @media (max-width: 900px) {
          .masonry { column-count: 3; }
        }
        @media (max-width: 600px) {
          .masonry { column-count: 2; }
        }

        .item {
          width: 100%;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
          margin: 0 0 14px 0;
          break-inside: avoid;
          display: block;
        }

        .img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 2px;
          background: #111;
          opacity: 0;
          transition: opacity 220ms ease;
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
