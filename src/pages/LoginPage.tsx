import { useState, type FormEvent } from "react";
import { api, storeToken } from "../api";
import type { User } from "../types";
import logoImg from "../assets/logo.png";

interface Props {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.ok && res.data) {
        storeToken(res.data.accessToken);
        onLogin(res.data.user);
      } else {
        setError("Invalid email or password.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fdf8f2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e8dfd6",
            borderRadius: 12,
            padding: "32px 28px",
            boxShadow: "0 2px 16px rgba(26,26,26,0.06)",
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center" }}>
            <img
              src={logoImg}
              alt="INFNOVA Technologies"
              style={{ height: 64, objectFit: "contain", margin: "0 auto" }}
            />
            <p
              style={{
                fontSize: 13,
                color: "#a89d96",
                fontFamily: "var(--font-mono)",
                marginTop: 5,
                textAlign: "center",
              }}
            >
              Internship Admin Portal
            </p>
          </div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: 6,
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            Sign in
          </h1>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#f5820f")}
                onBlur={(e) => (e.target.style.borderColor = "#e8dfd6")}
                placeholder="youremail@gmail.com"
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#f5820f")}
                onBlur={(e) => (e.target.style.borderColor = "#e8dfd6")}
                placeholder="your password"
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  background: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                  fontSize: 13,
                  color: "#b91c1c",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "11px",
                background: loading ? "#d06a00" : "#f5820f",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <Spinner />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#7a6e66",
  marginBottom: 6,
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#fef9f4",
  border: "1px solid #e8dfd6",
  borderRadius: 6,
  padding: "10px 12px",
  fontSize: 14,
  color: "#1a1a1a",
  outline: "none",
  transition: "border-color 0.15s",
};

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
      />
      <path
        d="M8 2a6 6 0 016 6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
