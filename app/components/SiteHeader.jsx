"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "30px 40px",
      position: "relative",
    }}>
      {/* Logo gauche */}
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

      {/* Nav centrée */}
      <nav style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "40px",
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
    </header>
  );
}
