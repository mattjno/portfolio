"use client";

import { useEffect, useCallback } from "react";

export default function Lightbox({ items, index, onClose, onNext, onPrev }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "Escape") onClose();
    },
    [onNext, onPrev, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (index === null || !items[index]) return null;

  return (
    <div className="modal" onClick={onClose}>
      <button className="close-btn" onClick={onClose} aria-label="Fermer">✕</button>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={items[index].full} className="modal-img" alt={items[index].name || `Photo ${index + 1}`} />
        <button className="nav-btn left" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Photo précédente">‹</button>
        <button className="nav-btn right" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Photo suivante">›</button>
        <div className="counter">{index + 1} / {items.length}</div>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.97);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-img {
          max-width: 92vw;
          max-height: 90vh;
          object-fit: contain;
          animation: scaleIn 0.2s ease;
        }
        @keyframes scaleIn { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: white;
          font-size: 48px;
          cursor: pointer;
          padding: 20px 30px;
          opacity: 0.4;
          transition: opacity 0.2s;
          line-height: 1;
        }
        .nav-btn:hover { opacity: 1; }
        .left { left: -90px; }
        .right { right: -90px; }

        .close-btn {
          position: fixed;
          top: 20px;
          right: 24px;
          background: none;
          border: none;
          color: white;
          font-size: 22px;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s;
          z-index: 10;
        }
        .close-btn:hover { opacity: 1; }

        .counter {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          letter-spacing: 2px;
          opacity: 0.4;
          color: white;
        }

        @media (max-width: 700px) {
          .nav-btn { display: none; }
          .modal-img { max-width: 100vw; max-height: 85vh; }
        }
      `}</style>
    </div>
  );
}
