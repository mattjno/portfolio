import photos from "../public/photos.json";

const BASE_URL = "https://f003.backblazeb2.com/file/mattjno-photos/";

export default function Home() {
  return (
    <main style={{ padding: "20px" }}>
      <header style={{ marginBottom: "22px" }}>
        <div style={{ fontSize: "14px", letterSpacing: "2px", opacity: 0.85 }}>
          MATTJNO | Sport Photography
        </div>
      </header>

      <section className="masonry">
        {photos.map((file) => (
          <div key={file} className="masonryItem">
            <img
              src={`${BASE_URL}${file}`}
              className="masonryImg"
              loading="lazy"
            />
          </div>
        ))}
      </section>
    </main>
  );
}
