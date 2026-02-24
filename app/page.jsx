"use client";
import { useEffect, useState, useRef, useCallback } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([[], [], [], [], [], []]);
  const [index, setIndex] = useState(null);
  const containerRef = useRef(null);

  const getColCount = () => {
    if (typeof window === "undefined") return 6;
    if (window.innerWidth <= 800) return 2;
    if (window.innerWidth <= 1200) return 4;
    return 6;
  };

  const buildColumns = useCallback((photoItems, colCount) => {
    const cols = Array.from({ length: colCount }, () => []);
    const heights = new Array(colCount).fill(0);

    photoItems.forEach((item) => {
      const shortest = heights.indexOf(Math.min(...heights));
      cols[shortest].push(item);
      const ratio = item.h && item.w ? item.h / item.w : 1;
      heights[shortest] += ratio;
    });

    return cols;
  }, []);

  useEffect(() => {
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data) => {
        const photos = Array.isArray(data) ? data : data?.items || [];
        setItems(photos);
        setColumns(buildColumns(photos, getColCount()));
      })
      .catch((err) => console.error("Erreur de chargement:", err));
  }, [buildColumns]);

  useEffect(() => {
    const handleResize = () => {
      if (items.length > 0) {
        setColumns(buildColumns(items, getColCount()));
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [items, buildColumns]);

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  useEffect(() => {
    const handleKey = (e) => {
      if (index === null) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index]);

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "10px" }}>
      <header style={{ padding: "20px 0", textAlign: "center" }}>
        <h1 style={{ fontSize: "11px", letterSpacing: "5px", fontWeight: "300", textTransform: "uppercase" }}>
          MATTJNO | Sport Photography
        </h1>
      </header>

      <div className="masonry-container" ref={containerRef}>
        {columns.map((col, ci) => (
          <div key={ci} className="masonry-col">
            {col.map((it) => {
              const globalIndex = items.findIndex(
                (x) => (x.name || x.thumb) === (it.name || it.thumb)
              );
              return (
                <div
                  key={it.name || it.thumb}
                  className="masonry-brick"
                  onClick={() => setIndex(globalIndex)}
                >
                  <img
                    src={it.thumb}
                    alt=""
                    loading="lazy"
                    className="masonry-img"
                    onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {index !== null && items[index] && (
        <div className="modal" onClick={() => setIndex(null)}>
          <button className="close-btn" onClick={() => setIndex(null)}>✕</button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={items[index].full} className="modal-img" alt="" />
            <button className="nav-btn left" onClick={prev}>‹</button>
            <button className="nav-btn right" onClick={next}>›</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        body { margin: 0; background: #000; }

        .masonry-container {
          display: flex;
          gap: 12px;
          padding: 0 10px;
          align-items: flex-start;
        }

        .masonry-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }

        .masonry-brick {
          width: 100%;
          background: #111;
          cursor: pointer;
          overflow: hidden;
          border-radius: 2px;
        }

        .masonry-img {
          display: block;
          width: 100%;
          height: auto;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .modal {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.95);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-content { position: relative; max-width: 90vw; }
        .modal-img { max-width: 90vw; max-height: 90vh; object-fit: contain; display: block; }
        .nav-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: white;
          font-size: 50px; cursor: pointer; padding: 20px;
        }
        .left { left: -70px; }
        .right { right: -70px; }
        .close-btn {
          position: absolute; top: 20px; right: 20px;
          background: none; border: none; color: white;
          font-size: 30px; cursor: pointer; z-index: 1001;
        }

        @media (max-width: 800px) {
          .nav-btn { display: none; }
        }
      `}</style>
    </main>
  );
}
