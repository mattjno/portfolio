"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header style={{
      padding: "24px 30px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", color: "#fff" }}>
        <span style={{
          fontSize: "13px",
          letterSpacing: "4px",
          fontWeight: "400",
          textTransform: "uppercase",
        }}>
          MATT.JNO
        </span>
      </Link>

      {/* Nav */}
      <nav style={{
        display: "flex",
        gap: "30px",
      }}>
        {[
          { href: "/", label: "Sélection" },
          { href: "/albums", label: "Albums" },
          { href: "/contact", label: "Contact" },
        ].map(({ href, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              fontSize: "10px",
              letterSpacing: "2px",
              textDecoration: "none",
              color: isActive ? "#fff" : "#555",
              borderBottom: isActive ? "1px solid #fff" : "none",
              paddingBottom: "4px",
              textTransform: "uppercase",
              transition: "color 0.3s",
            }}>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Layout desktop : logo gauche + nav centrée */}
      <style jsx>{`
        @media (min-width: 768px) {
          header {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 0 !important;
          }
          nav {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      `}</style>
    </header>
  );
}
