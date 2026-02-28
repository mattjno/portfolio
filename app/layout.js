import "./globals.css";

export const metadata = {
  title: "MATTJNO | Sport Photography",
  description: "Portfolio de photographie sportive — Football & Sport par MATTJNO",
  openGraph: {
    title: "MATTJNO | Sport Photography",
    description: "Portfolio de photographie sportive",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
