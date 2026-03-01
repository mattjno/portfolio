"use client";

import { useState } from "react";
import SiteHeader from "../components/SiteHeader";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // null | "sending" | "ok" | "error"

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("ok");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>
      <SiteHeader />

      <div style={{ maxWidth: "560px", margin: "60px auto", padding: "0 20px" }}>
        <h1 style={{
          fontSize: "11px",
          letterSpacing: "5px",
          fontWeight: "300",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: "10px",
        }}>
          Contact
        </h1>
        <p style={{
          fontSize: "10px",
          letterSpacing: "2px",
          opacity: 0.4,
          textAlign: "center",
          marginBottom: "50px",
          textTransform: "uppercase",
        }}>
          Une question, un projet, une collaboration
        </p>

        {status === "ok" ? (
          <div style={{ textAlign: "center", fontSize: "11px", letterSpacing: "2px", opacity: 0.7 }}>
            Message envoyé ✓
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label style={labelStyle}>Nom</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label style={labelStyle}>Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Votre message..."
              />
            </div>

            {status === "error" && (
              <p style={{ fontSize: "10px", color: "#f66", letterSpacing: "1px" }}>
                Une erreur est survenue, réessaie.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                background: "none",
                border: "1px solid #fff",
                color: "#fff",
                padding: "14px 30px",
                fontSize: "10px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                cursor: status === "sending" ? "wait" : "pointer",
                opacity: status === "sending" ? 0.5 : 1,
                transition: "opacity 0.3s",
                alignSelf: "center",
                width: "200px",
              }}
            >
              {status === "sending" ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "9px",
  letterSpacing: "2px",
  textTransform: "uppercase",
  opacity: 0.5,
  marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
  background: "none",
  border: "none",
  borderBottom: "1px solid #333",
  color: "#fff",
  fontSize: "12px",
  padding: "10px 0",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.3s",
};
