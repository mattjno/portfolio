"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";

export default function MasonryGallery({ items }) {
  const [index, setIndex] = useState(null);

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  return (
    <>
      <section className="masonry-gallery">
        {items.map((it, i) => (
          <div
            key={it.name || i}
            className="masonry-brick"
            onClick={() => setIndex(i)}
            style={{ aspectRatio: it.w && it.h ? `${it.w} / ${it.h}` : undefined }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setIndex(i)}
            aria-label={`Voir photo ${i + 1}`}
          >
            <img
              src={it.thumb}
              alt={it.name ? it.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") : `Photo ${i + 1}`}
              loading="lazy"
              className="raw-img"
              onLoad={(e) => (e.currentTarget.style.opacity = "1")}
            />
          </div>
        ))}
      </section>

      {index !== null && (
        <Lightbox
          items={items}
          index={index}
          onClose={() => setIndex(null)}
          onNext={next}
          onPrev={prev}
        />
      )}

      <style jsx global>{`
        .masonry-gallery {
          column-count: 6;
          column-gap: 10px;
          padding: 0 10px;
          width: 100%;
        }

        .masonry-brick {
          break-inside: avoid;
          margin-bottom: 10px;
          background: #0d0d0d;
          cursor: pointer;
          width: 100%;
          display: block;
          overflow: hidden;
          border-radius: 2px;
          transition: transform 0.3s ease;
        }

        .masonry-brick:hover {
          transform: scale(1.015);
          z-index: 1;
          position: relative;
        }

        .raw-img {
          width: 100%;
          height: auto;
          display: block;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        @media (max-width: 1200px) { .masonry-gallery { column-count: 4; } }
        @media (max-width: 900px)  { .masonry-gallery { column-count: 3; } }
        @media (max-width: 600px)  { .masonry-gallery { column-count: 2; } }
      `}</style>
    </>
  );
}
