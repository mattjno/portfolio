"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AlbumDetailPage() {
  const params = useParams();
  const albumId = params?.id;

  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;

    fetch(`/api/photos?album=${albumId}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, [albumId]);

  if (!albumId) return null;

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "10px" }}>
      <header style={{ padding: "30px 0", textAlign: "center" }}>
        <Link href="/albums" style={{ display: 'inline-block', marginBottom: '15px', fontSize: '9px', letterSpacing: '2px', color: '#666', textDecoration: 'none', textTransform: 'uppercase' }}>
          ← Retour aux albums
        </Link>
        <h1 style={{ fontSize: "11px", letterSpacing: "5px", fontWeight: "300", textTransform: "uppercase", margin: 0 }}>
          {albumId.replaceAll("-", " ")}
        </h1>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', fontSize: '10px', opacity: 0.5, marginTop: '50px' }}>Chargement des photos...</div>
      ) : (
        <section className="masonry-gallery">
          {items.map((it, i) => (
            <div key={i} className="masonry-brick" onClick={() => setIndex(i)}>
              <img
                src={it.thumb}
                alt=""
                className="raw-img"
                onLoad={(e) => e.currentTarget.style.opacity = "1"}
              />
            </div>
          ))}
        </section>
      )}

      {index !== null && items[index] && (
        <div className="modal" onClick={() => setIndex(null)}>
          <button className="close-btn">✕</button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={items[index].full} className="modal-img" alt="" />
            <button className="nav-btn left" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
            <button className="nav-btn right" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .masonry-gallery { column-count: 6; column-gap: 12px; padding: 20px; }
        .masonry-brick { break-inside: avoid; margin-bottom: 12px; background: #111; cursor: pointer; border-radius: 2px; overflow: hidden; }
        .raw-img { width: 100%; height: auto; display: block; opacity: 0; transition: opacity 0.5s ease; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.98); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { position: relative; }
        .modal-img { max-width: 95vw; max-height: 90vh; object-fit: contain; }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: none; border: none; color: white; font-size: 40px; cursor: pointer; padding: 40px; transition: 0.3s; }
        .nav-btn:hover { opacity: 0.5; }
        .left { left: -100px; }
        .right { right: -100px; }
        .close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 25px; cursor: pointer; opacity: 0.5; }
        
        @media (max-width: 1200px) { .masonry-gallery { column-count: 4; } }
        @media (max-width: 800px) { .masonry-gallery { column-count: 2; } .left, .right { display: none; } }
      `}</style>
    </main>
  );
}
