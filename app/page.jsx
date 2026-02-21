"use client";

import { useState, useEffect } from "react";
import photos from "../public/photos.json";

const BASE_URL = "https://f003.backblazeb2.com/file/mattjno-photos/";

export default function Home() {
  const [index, setIndex] = useState(null);

  const open = (i) => setIndex(i);
  const close = () => setIndex(null);

  const next = () =>
    setIndex((prev) => (prev + 1) % photos.length);

  const prev = () =>
    setIndex((prev) =>
      prev === 0 ? photos.length - 1 : prev - 1
    );

  useEffect(() => {
    const handleKey = (e) => {
      if (index === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index]);

  return (
    <main style={{ padding: "20px" }}>
      <header style={{ marginBottom: "22px" }}>
        <div style={{ fontSize: "14px", letterSpacing: "2px", opacity: 0.85 }}>
          MATTJNO | Sport Photography
        </div>
      </header>

      <section className="masonry">
        {photos.map((file, i) => (
          <div key={file} className="masonryItem">
            <img
              src={`${BASE_URL}${file}`}
              className="masonryImg"
              loading="lazy"
              onClick={() => open(i)}
              style={{ cursor: "pointer" }}
            />
          </div>
        ))}
      </section>

      {index !== null && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "zoom-out"
          }}
        >
          <img
            src={`${BASE_URL}${photos[index]}`}
            style={{
              maxWidth: "95%",
              maxHeight: "95%",
              objectFit: "contain"
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
