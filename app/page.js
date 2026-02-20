export default function Home() {
  return (
    <main style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "14px", letterSpacing: "2px" }}>
        MATTJNO | Sport Photography
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "10px",
        marginTop: "30px"
      }}>
        {[...Array(24)].map((_, i) => (
          <div key={i} style={{
            background: "#111",
            aspectRatio: "3/2"
          }} />
        ))}
      </div>
    </main>
  );
}
