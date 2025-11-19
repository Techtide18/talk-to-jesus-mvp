"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faJedi } from "@fortawesome/free-solid-svg-icons";
import { faUserLock } from "@fortawesome/free-solid-svg-icons/faUserLock";

export default function HomePage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW STATES
  const [showDoors, setShowDoors] = useState(false); // doors visible?
  const [doorsOpen, setDoorsOpen] = useState(false); // doors animation?

  const router = useRouter();

  const login = () => {
    if (user === "jc123" && pass === "admin123") {
      setError("");
      setLoading(true);
      //setTimeout(() => setDoorsOpen(true), 1000);
      // SHOW DOORS
      setShowDoors(true);

      // OPEN DOORS after short delay
      setTimeout(() => setDoorsOpen(true));

      // Redirect once doors finish opening
      setTimeout(() => {
        localStorage.setItem("loggedin", "true");
        router.push("/home");
      }, 1000);
    } else {
      setTimeout(() => {
        setError("Invalid username or password");
      }, 250);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") login();
  };

  // Halo
  useEffect(() => {
    const halo = document.getElementById("cursor-halo");
    const move = (e: MouseEvent) => {
      if (!halo) return;
      halo.style.left = `${e.clientX}px`;
      halo.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <main className="login-container">
      {/* Background */}
      <div className="background-image" />
      <div className="background-overlay" />
      <div className="fog-layer" />
      <div id="cursor-halo"></div>

      {/* Rays */}
      <div className="holy-rays">
        <div className="ray ray-1"></div>
        <div className="ray ray-2"></div>
        <div className="ray ray-3"></div>
        <div className="ray ray-4"></div>
        <div className="ray ray-5"></div>
      </div>

      {/* Doves */}
      <div className="birds-container">
        <div className="bird bird-1">🕊️</div>
        <div className="bird bird-2">🕊️</div>
        <div className="bird bird-3">🕊️</div>
        <div className="bird bird-4">🕊️</div>
        <div className="bird bird-5">🕊️</div>
      </div>

      {/* Particles */}
      <div className="particles">
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>

      {/* -------------------- */}
      {/* UPDATED DOOR LOGIC  */}
      {/* -------------------- */}
      {showDoors && (
        <div className={`holy-doors ${doorsOpen ? "open" : ""}`}>
          <div className="door left-door"></div>
          <div className="door right-door"></div>

          {/* Light behind doors */}
          <div className="door-light"></div>
        </div>
      )}

      {/* Login Card */}
      <div className="login-card">
        <div className="ai-badge">
          <span className="ai-icon">✨</span>
          <span className="ai-text">AI-POWERED</span>
          <span className="ai-icon">✨</span>
        </div>

        <div className="church-icon">⛪</div>

        <h1 className="login-title">Talk to Jesus AI</h1>
        <p className="login-subtitle">
          Find light, direction, and peace—whenever you need.
        </p>

        <div className="divider">
          <span className="cross">✝</span>
        </div>

        <div className="input-group">
          <div className="input-wrapper">
            <span className="input-icon">
              <FontAwesomeIcon icon={faJedi} className="input-icon-fa" />
            </span>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyPress={handleKeyPress}
              className="login-input"
              placeholder="Username"
              type="text"
            />
          </div>

          <div className="input-wrapper">
            <span className="input-icon">
              <FontAwesomeIcon icon={faUserLock} className="input-icon-fa" />
            </span>
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyPress={handleKeyPress}
              className="login-input"
              placeholder="Password"
              type="password"
            />
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          onClick={login}
          disabled={loading}
          className={`login-button single-line-btn ${loading ? "loading" : ""}`}
        >
          {loading ? "Verifying access..." : "Login For Conversation →"}
        </button>

        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">💬</span>
            <span className="feature-text">Chat</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📞</span>
            <span className="feature-text">Call</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📹</span>
            <span className="feature-text">Video Call</span>
          </div>
        </div>

        <p className="footer-text">
          “Come to me, all you who are weary and burdened, and I will give you
          rest.” — Matthew 11:28
        </p>
      </div>
    </main>
  );
}
