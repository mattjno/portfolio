const photos = [
  // Exemple plus tard:
  // { src: "/photos/bestof/001.jpg", alt: "OL vs OM" },
];

export default function Home() {
  return (
    <main style={{ padding: "20px" }}>
      <header style={{ marginBottom: "22px" }}>
        <div style={{ fontSize: "14px", letterSpacing: "2px", opacity: 0.85 }}>
          MATTJNO | Sport Photography
        </div>
      </header>

      <section className="masonry">
        {photos.length === 0
          ? Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="masonryItem"
                style={{
                  background: "#111",
                  height: i % 3 === 0 ? 420 : i % 3 === 1 ? 300 : 520,
                }}
              />
            ))
          : photos.map((p) => (
              <figure key={p.src} className="masonryItem" style={{ margin: 0 }}>
                <img className="masonryImg" src={p.src} alt={p.alt || ""} loading="lazy" />
              </figure>
            ))}
      </section>
    </main>
  );
}
