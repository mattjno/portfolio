const photos = [
  // Remplace ensuite par tes vrais fichiers dans /public/photos/bestof/
  // Exemple:
  // { src: "/photos/bestof/001.jpg", alt: "Best of 001" },
];

export default function Home() {
  return (
    <main style={{ padding: "20px" }}>
      <header style={{ marginBottom: "22px" }}>
        <div style={{ fontSize: "14px", letterSpacing: "2px", opacity: 0.85 }}>
          MATTJNO | Sport Photography
        </div>
      </header>

      <section
        style={{
          columnCount: 4,
          columnGap: "10px",
        }}
      >
        {photos.length === 0 ? (
          // Placeholder tant que tu n'as pas mis de photos
          Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                breakInside: "avoid",
                marginBottom: "10px",
                background: "#111",
                height: i % 3 === 0 ? 420 : i % 3 === 1 ? 300 : 520,
                borderRadius: "2px",
              }}
            />
          ))
        ) : (
          photos.map((p) => (
            <figure
              key={p.src}
              style={{
                breakInside: "avoid",
                margin: 0,
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              <img
                src={p.src}
                alt={p.alt || ""}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </figure>
          ))
        )}
      </section>

      <style jsx global>{`
        @media (max-width: 1200px) {
          main section {
            column-count: 3 !important;
          }
        }
        @media (max-width: 800px) {
          main section {
            column-count: 2 !important;
          }
        }
        @media (max-width: 520px) {
          main section {
            column-count: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}
