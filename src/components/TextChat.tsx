"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createTextResponse } from "../lib/openrouterClient";

export default function TextChat() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("prefill") || "";

  const [messages, setMessages] = useState([
    {
      role: "jesus",
      text: "Peace be with you, my child. How may I guide you today?",
    },
  ]);

  const [input, setInput] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep input updated when page loads with prefill
  useEffect(() => {
    if (prefill) setInput(prefill);
  }, [prefill]);

  // Voice
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const load = () => {
      const v = speechSynthesis.getVoices();
      if (v.length) setVoices(v);
      else setTimeout(load, 200);
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  }, []);

  const speakAsJesus = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.pitch = 0.4;
    u.rate = 0.88;

    const jesusVoice =
      voices.find((v) => v.name.includes("Matthew")) ||
      voices.find((v) => v.name.includes("Brian")) ||
      voices.find((v) => v.lang === "en-US");

    if (jesusVoice) u.voice = jesusVoice;

    setTimeout(() => speechSynthesis.speak(u), 150);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    const reply = await createTextResponse(
      text,
      messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }))
    );

    setMessages((prev) => [...prev, { role: "jesus", text: reply }]);
    speakAsJesus(reply);

    setLoading(false);

    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
    }, 80);
  };

  return (
    <section className="rounded-2xl p-6 bg-white/80 backdrop-blur-lg shadow-2xl border border-yellow-300">
      <h2 className="text-3xl font-bold text-yellow-700 mb-6">💬 Talk with Jesus</h2>

      {/* Chat box */}
      <div
        ref={scrollRef}
        className="h-96 overflow-y-auto p-4 bg-white/60 rounded-xl flex flex-col gap-3 shadow-inner"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[75%] shadow-md whitespace-pre-line ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-yellow-100 border border-yellow-300 heaven-beam"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Speak from your heart..."
          className="flex-1 p-3 rounded-xl border shadow bg-white/90 focus:outline-yellow-600"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-yellow-600 text-white font-semibold hover:bg-yellow-700 shadow-lg"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </section>
  );
}
