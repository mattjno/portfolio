export const metadata = {
  title: "MATTJNO | Sport Photography",
  description: "Football photography portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "Arial, sans-serif"
      }}>
        {children}
      </body>
    </html>
  );
}
