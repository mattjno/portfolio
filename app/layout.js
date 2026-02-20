import "./globals.css";

export const metadata = {
  title: "MATTJNO | Sport Photography",
  description: "Football photography portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
