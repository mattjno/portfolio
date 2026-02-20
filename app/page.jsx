import fs from "fs";
import path from "path";

export default function Home() {
  const directory = path.join(process.cwd(), "public/photos/bestof");

  const photos = fs.existsSync(directory)
    ? fs
        .readdirSync(directory)
        .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    : [];

  return (
    <main style={{ padding: "20px" }}>
      {/* Header */}
      <header style={{ marginBottom: "22px" }}>
        <div
          style={{
            fontSize: "14px",
            letterSpacing: "2px",
            opacity: 0.85,
          }}
        >
          MATTJNO | Sport Photography
        </div>
      </header>

      {/* Grid */}
      <section className="masonry">
        {photos.map((file) => (
          <div key={file} className="masonryItem">
            <img
              src={`/photos/bestof/${file}`}
              alt=""
              className="masonryImg"
              loading="lazy"
            />
          </div>
        ))}
      </section>
    </main>
  );
}
