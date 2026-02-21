"use client";

import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(null);

  const hasPhotos = urls.length > 0;

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/photos", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load photos");
        if (isMounted) setUrls(data.urls || []);
      } catch (e) {
        console.error(e);
        if (isMounted) setUrls([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
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

  const title = useMemo(() => "MATTJNO | Sport Photography", []);

  return (
    <main style={{ padding: "20px" }}>
      <header style={{ marginBottom: "22px" }}>
        <div style={{ fontSize: "14px", letterSpacing: "2px", opacity: 0.85 }}>
          {title}
        </div>
      </header>

      {loading && (
        <div style={{ opacity: 0.7, fontSize: 14 }}>Chargement des photos…</div>
      )}

      {!loading && !hasPhotos && (
        <div style={{ opacity: 0.7, fontSize: 14 }}>
          Aucune photo trouvée dans bestof/. Ajoute des JPG dans Backblaze dans
          le dossier bestof et recharge.
        </div>
      )}

      <section className="masonry" style={{ marginTop: 14 }}>
        {urls.map((src, i) => (
          <div key={src} className="masonryItem">
            <img
              src={src}
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
            cursor: "zoom-out",
          }}
        >
          <img
            src={urls[index]}
            style={{ maxWidth: "95%", maxHeight: "95%", objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
