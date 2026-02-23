"use client";

import { useEffect, useMemo, useState } from "react";

function loadImageSize(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = reject;
    img.src = url;
  });
}

// Petit limiteur de concurrence pour éviter de lancer 60 téléchargements en même temps
async function mapLimit(arr, limit, fn) {
  const out = new Array(arr.length);
  let i = 0;

  async function worker() {
    while (i < arr.length) {
      const idx = i++;
      out[idx] = await fn(arr[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, arr.length) }, () => worker());
  await Promise.all(workers);
  return out;
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [ratios, setRatios] = useState({}); // key: thumb url -> ratio (w/h)
  const [loadingList, setLoadingList] = useState(true);
  const [loadingBatch, setLoadingBatch] = useState(false);

  const [index, setIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoadingList(true);
        const res = await fetch("/api/photos", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load photos");
        if (alive) setItems(data.items || []);
      } catch (e) {
        console.error(e);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoadingList(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const displayed = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  // Précharge les thumbs du lot visible pour récupérer les ratios avant affichage
  useEffect(() => {
    let alive = true;

    async function warmUp() {
      if (displayed.length === 0) return;

      // Ne charge que ceux qu'on ne connaît pas encore
      const toFetch = displayed
        .map((it) => it.thumb)
        .filter((thumb) => ratios[thumb] == null);

      if (toFetch.length === 0) return;

      try {
        setLoadingBatch(true);

        const results = await mapLimit(toFetch, 8, async (thumbUrl) => {
          try {
            const { w, h } = await loadImageSize(thumbUrl);
            return { thumbUrl, ratio: w / h };
          } catch {
            // fallback safe
            return { thumbUrl, ratio: 4 / 3 };
          }
        });

        if (!alive) return;

        setRatios((prev) => {
          const next = { ...prev };
          for (const r of results) next[r.thumbUrl] = r.ratio;
          return next;
        });
      } finally {
        if (alive) setLoadingBatch(false);
      }
    }

    warmUp();
    return () => {
      alive = false;
    };
  }, [displayed, ratios]);

  const gridReady = displayed.length > 0 && displayed.every((it) => ratios[it.thumb] != null);

  const open = (i) => setIndex(i);
  const close = () => setIndex(null);

  const next = () => setIndex((prev) => (prev + 1) % displayed.length);
  const prev = () => setIndex((prev) => (prev === 0 ? displayed.length - 1 : prev - 1));

  useEffect(() => {
    const handleKey = (e) => {
      if (index === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, displayed.length]);

  return (
    <main style={{ padding: "20px" }}>
      <header style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, letterSpacing: 2, opacity: 0.85 }}>
          MATTJNO | Sport Photography
        </div>

        {(loadingList || loadingBatch) && (
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.65 }}>
            Chargement…
          </div>
        )}
      </header>

      {!loadingList && items.length === 0 && (
        <div style={{ opacity: 0.7, fontSize: 14 }}>
          Aucune photo trouvée dans bestof/thumbs.
        </div>
      )}

      {/* Tant que les ratios ne sont pas prêts, on évite d'afficher la masonry pour éviter les shifts */}
      {!gridReady ? (
        <div style={{ opacity: 0.7, fontSize: 14 }}>
          Préparation de la grille…
        </div>
      ) : (
        <section className="masonry">
          {displayed.map((it, i) => {
            const r = ratios[it.thumb]; // w/h
            return (
              <button
                key={it.thumb}
                className="item"
                onClick={() => open(i)}
                aria-label="Open photo"
              >
                <div className="frame" style={{ aspectRatio: `${r}` }}>
                  <img
                    src={it.thumb}
                    className="img"
                    loading="lazy"
                    decoding="async"
                    alt=""
                  />
                </div>
              </button>
            );
          })}
        </section>
      )}

      {!loadingList && visibleCount < items.length && (
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => setVisibleCount((c) => Math.min(c + 60, items.length))}
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Afficher plus
          </button>
        </div>
      )}

      {index !== null && (
        <div className="modal" onClick={close}>
          <button className="nav left" onClick={(e) => (e.stopPropagation(), prev())} aria-label="Previous">
            ‹
          </button>

          <img
            src={displayed[index]?.full}
            className="modalImg"
            onClick={(e) => e.stopPropagation()}
            alt=""
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

        .frame {
          width: 100%;
          background: #111;
          border-radius: 2px;
          overflow: hidden;
        }

        .img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          background: #000;
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
