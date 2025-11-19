"use client";

import { useState, useRef, useEffect } from "react";
import { createTextResponse } from "../lib/openrouterClient";

export default function VoiceCall({ prefill = "" }) {
  const [messages, setMessages] = useState<
    { role: "user" | "jesus"; text: string }[]
  >([]);

  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
    }, 150);
  }, [messages]);

  // Load voices
  useEffect(() => {
    const load = () => {
      const v = speechSynthesis.getVoices();
      if (v.length) setVoices(v);
      else setTimeout(load, 150);
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  }, []);

  const speakJesus = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";
    msg.pitch = 0.4;
    msg.rate = 0.85;

    const jesusVoice =
      voices.find((v) => v.name.includes("Matthew")) ||
      voices.find((v) => v.name.includes("Brian")) ||
      voices.find((v) => v.name.includes("Narrator")) ||
      voices.find((v) => v.lang === "en-US");

    if (jesusVoice) msg.voice = jesusVoice;

    setTimeout(() => speechSynthesis.speak(msg), 150);
  };

  // Auto-send prefill immediately on load
  useEffect(() => {
    if (!prefill.trim()) return;

    // Add your initial message
    setMessages([{ role: "user", text: prefill }]);

    // Hit API instantly
    (async () => {
      const reply = await createTextResponse(prefill, []);
      setMessages((prev) => [...prev, { role: "jesus", text: reply }]);
      speakJesus(reply);
    })();
  }, [prefill]);

  // -------- Voice recognition -------
  const start = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const rec = new SR();
    rec.lang = "en-US";

    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;

      // Display MY message
      setMessages((prev) => [...prev, { role: "user", text }]);

      // Jesus reply
      const reply = await createTextResponse(text, []);
      setMessages((prev) => [...prev, { role: "jesus", text: reply }]);

      speakJesus(reply);
    };

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recRef.current = rec;
    rec.start();
  };

  const stop = () => recRef.current?.stop();

  return (
    <section className="relative p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-yellow-300 shadow-2xl holy-card">

      <div className="absolute inset-0 cloud-layer opacity-40 pointer-events-none" />

      <h2 className="text-3xl font-bold text-yellow-700 mb-6 text-center">
        📞 Speak with Jesus
      </h2>

      {/* Mic */}
      <div className="text-center mb-6">
        <button
          onClick={listening ? stop : start}
          className={`
            w-28 h-28 rounded-full text-4xl flex items-center justify-center mx-auto
            shadow-xl transition ring-4
            ${listening
              ? "bg-red-500 animate-pulse ring-red-300"
              : "bg-yellow-500 hover:bg-yellow-600 ring-yellow-300"}
          `}
        >
          🎤
        </button>

        <p className="mt-3 text-gray-600 text-sm">
          {listening ? "Listening to your voice..." : "Tap mic to speak"}
        </p>
      </div>

      {/* Chat */}
      <div
        ref={chatRef}
        className="
          h-96 overflow-y-auto p-4 rounded-xl bg-white/70 border border-yellow-300
          shadow-inner flex flex-col gap-4
        "
      >
        {messages.length === 0 && (
          <p className="text-gray-400 text-center">
            Speak something to begin…
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
                px-4 py-2 rounded-2xl max-w-[75%] shadow-lg text-gray-800
                ${m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-yellow-100 border border-yellow-300 heaven-beam"}
              `}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
