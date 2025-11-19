// app/home/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "./home.css";

const VERSES = [
  "I am with you always — Matthew 28:20",
  "Let not your heart be troubled — John 14:1",
  "Ask and you shall receive — Matthew 7:7",
  "The Lord is near to the brokenhearted — Psalm 34:18",
  "Peace I leave with you — John 14:27",
  "Cast all your anxiety on Him — 1 Peter 5:7",
  "The Lord is my shepherd — Psalm 23:1",
  "Be still and know that I am God — Psalm 46:10",
  "Trust in the Lord with all your heart — Proverbs 3:5",
] as const;

interface Suggestion {
  text: string;
  icon: string;
  gradient: string;
}

const SUGGESTIONS = [
  {
    text: "How do I find peace?",
    icon: "🕊️",
    gradient: "from-blue-400 to-purple-500",
  },
  {
    text: "Why am I feeling lost?",
    icon: "🧭",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    text: "How do I forgive someone?",
    icon: "💝",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    text: "What should I do about my future?",
    icon: "🌟",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    text: "How do I deal with stress?",
    icon: "🙏",
    gradient: "from-indigo-400 to-blue-500",
  },
  {
    text: "Guide me in my relationships",
    icon: "💑",
    gradient: "from-rose-400 to-purple-500",
  },
];

interface Prayer {
  id: number;
  text: string;
  date: string;
}

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [verse, setVerse] = useState("");
  const [message, setMessage] = useState("");
  const [prayerHistory, setPrayerHistory] = useState<Prayer[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<number | null>(
    null
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHeaven, setShowHeaven] = useState(true);


  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Simple auth check
    const isLoggedIn = localStorage.getItem("loggedin");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    // Random verse
    setVerse(VERSES[Math.floor(Math.random() * VERSES.length)]);

    // Load prayer history
    try {
      const saved = localStorage.getItem("prayerHistory");
      if (saved) setPrayerHistory(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to load prayer history", err);
    }
  }, [router]);

  useEffect(() => {
    setShowHeaven(true);

    // hide overlay after animation ends
    const t = setTimeout(() => setShowHeaven(false), 20000);

    return () => clearTimeout(t);
  }, []);

  const savePrayer = (text: string) => {
    if (!text.trim()) return;

    const newPrayer: Prayer = {
      id: Date.now(),
      text: text.trim(),
      date: new Date().toISOString(),
    };

    const updated = [newPrayer, ...prayerHistory].slice(0, 10);
    setPrayerHistory(updated);
    localStorage.setItem("prayerHistory", JSON.stringify(updated));
  };

  const handleSuggestionClick = (text: string) => {
    setMessage(text);
    textareaRef.current?.focus();
  };

  const handleLogout = () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("loggedin");
    router.push("/");
  };

  const goText = () => {
    if (!message.trim()) return;
    savePrayer(message);
    router.push(`/text?prefill=${encodeURIComponent(message)}`);
  };

  const goVoice = () => {
    if (!message.trim()) return;
    savePrayer(message);
    router.push(`/voice?prefill=${encodeURIComponent(message)}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Prevent rendering until mounted (avoid SSR mismatch with localStorage)
  if (!mounted) return null;

  return (
    <main className="home-wrap">
      {/* Background Effects */}
      {showHeaven && (
        <div className="heaven-entrance">
          {/* Simplified entrance for Ethereal theme */}
        </div>
      )}

      <div className="celestial-bg" />

      {/* Removed heavy painting-like elements for cleaner Ethereal look */}

      <header className="home-header glass-card">
        <div className="brand">
          <span>⛪</span>
          <span className="brand-title">
            Divine Conversation
          </span>
        </div>

        <div className="header-actions">
          <button className="btn-ghost" onClick={handleLogout}>
            <span className="btn-icon">👋</span>
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="home-grid">
        {/* Left Column */}
        <section className="col-left">
          <div className="verse-card glass-card animate-slide-up">
            <div className="verse-title">
              <span>📖</span>
              <h3>Daily Verse</h3>
            </div>
            <p className="verse-text">{verse}</p>
          </div>

          <div
            className="suggestions-wrap animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <h4 className="section-title">
              <span className="title-icon">💭</span>
              <span>Ask Jesus Anything</span>
            </h4>

            <div className="suggestions-grid">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className={`suggestion-card glass-card ${hoveredSuggestion === i ? "is-hover" : ""
                    }`}
                  onClick={() => handleSuggestionClick(s.text)}
                  onMouseEnter={() => setHoveredSuggestion(i)}
                  onMouseLeave={() => setHoveredSuggestion(null)}
                  style={{ animationDelay: `${0.2 + i * 0.05}s` }}
                >
                  <span className="suggest-ico">{s.icon}</span>
                  <span className="suggest-text">{s.text}</span>
                  <div className="suggest-arrow">➜</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column */}
        <aside className="col-right">
          <div
            className="prayer-card glass-card animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            <label className="prayer-label">
              <span className="label-icon">✍️</span>
              Write your prayer or thought
            </label>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share what's on your heart..."
              className="prayer-textarea"
              maxLength={500}
            />
            <div className="char-count">{message.length}/500</div>

            <div className="prayer-actions">
              <button
                className="btn-primary"
                onClick={goText}
                disabled={!message.trim()}
              >
                <span className="btn-icon">💬</span> Text Jesus
              </button>
              <button
                className="btn-outline"
                onClick={goVoice}
                disabled={!message.trim()}
              >
                <span className="btn-icon">📞</span> Voice Jesus
              </button>
            </div>
          </div>

          {/* Prayer History */}
          <div
            className="history-card glass-card animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div
              className="history-header"
              onClick={() => setShowHistory(!showHistory)}
            >
              <h5>
                <span className="history-icon">📜</span> Prayer History
              </h5>
              <button className="toggle-btn">{showHistory ? "▼" : "▶"}</button>
            </div>

            {showHistory && (
              <div className="history-list">
                {prayerHistory.length === 0 ? (
                  <p className="history-empty" style={{ color: 'var(--txt-tertiary)', fontStyle: 'italic', padding: '1rem' }}>
                    No prayers yet. Start your divine conversation!
                  </p>
                ) : (
                  prayerHistory.map((p) => (
                    <div key={p.id} className="history-item">
                      <div className="history-text">
                        {p.text.length > 60
                          ? `${p.text.substring(0, 60)}...`
                          : p.text}
                      </div>
                      <div className="history-date">{formatDate(p.date)}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Coming Soon */}
          <div
            className="other-card glass-card animate-slide-up"
            style={{ animationDelay: "0.25s" }}
          >
            <h5 className="section-title" style={{ fontSize: '0.95rem', marginBottom: '0.8rem' }}>
              More Ways to Connect
            </h5>
            <div className="other-list">
              <div className="other-item">
                <span className="other-icon">📹</span>
                <button
                  onClick={() => alert("Video call — Coming soon")}
                  className="linkish"
                >
                  Video Call Jesus <span className="badge">Soon</span>
                </button>
              </div>
              <div className="other-item">
                <span className="other-icon">✨</span>
                <button
                  onClick={() => alert("Guided prayers — Coming soon")}
                  className="linkish"
                >
                  Guided Prayers <span className="badge">Soon</span>
                </button>
              </div>
              <div className="other-item">
                <span className="other-icon">📝</span>
                <button
                  onClick={() => alert("Journal — Coming soon")}
                  className="linkish"
                >
                  Journal <span className="badge">Soon</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="home-footer animate-fade-in">
        <div className="footer-content glass-card">
          <blockquote>
            <span className="quote-mark">"</span>
            Come to me, all you who are weary and burdened, and I will give you
            rest.
            <span className="quote-mark">"</span>
            <cite>— Matthew 11:28</cite>
          </blockquote>
        </div>
      </footer>

      {/* Logout Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-sm w-full p-8 text-center shadow-2xl border border-white/50 transform scale-100 animate-slide-up">
            <div className="text-4xl mb-4">🕊️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Logged Out</h3>
            <p className="text-gray-600 mb-6 italic">
              "May divine wisdom guide you."
            </p>
            <button
              onClick={confirmLogout}
              className="btn-primary w-full justify-center py-3 text-lg"
            >
              Amen
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
