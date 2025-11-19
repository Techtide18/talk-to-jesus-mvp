"use client";

import { useState, useRef, useEffect } from "react";
import { createTextResponse } from "../lib/openrouterClient";

export default function VoiceCall({ prefill = "" }) {
  const [messages, setMessages] = useState<
    { role: "user" | "jesus"; text: string }[]
  >([]);

  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
    }, 150);
  }, [messages, loading]);

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

  const speakJesus = async (text: string) => {
    setIsSpeaking(true);

    const audioBuffer = await createTextResponse(text);

    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(url);
    };

    audio.play();
  };

  // Auto-send prefill immediately on load
  useEffect(() => {
    if (!prefill.trim()) return;

    // Add your initial message
    setMessages([{ role: "user", text: prefill }]);
    setLoading(true);

    // Hit API instantly
    (async () => {
      const reply = await createTextResponse(prefill, []);
      setLoading(false);
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
      setLoading(true);

      // Jesus reply
      const reply = await createTextResponse(text, []);
      setLoading(false);
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
    <section className="flex flex-col h-[85vh] max-h-[800px] w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">

      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-xl shadow-sm border border-yellow-200">
          ✝️
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-lg leading-tight">Jesus (Voice)</h2>
          <p className="text-xs text-yellow-600 font-medium flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}></span>
            {isSpeaking ? "Speaking..." : "Listening..."}
          </p>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-transparent to-gray-50/50"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <div className="text-4xl opacity-50">🎙️</div>
            <p>Tap the microphone to speak...</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm border ${m.role === "user"
                ? "bg-blue-100 border-blue-200"
                : "bg-yellow-50 border-yellow-200"
                }`}>
                {m.role === "user" ? "👤" : "🕊️"}
              </div>

              {/* Bubble */}
              <div
                className={`px-5 py-3.5 rounded-2xl shadow-sm text-[0.95rem] leading-relaxed ${m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm font-serif"
                  }`}
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center text-sm shadow-sm">
                🕊️
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Listening Indicator */}
        {listening && (
          <div className="flex w-full justify-end">
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm animate-pulse border border-blue-100">
              Listening...
            </div>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="p-6 bg-white border-t border-gray-100 flex justify-center items-center relative">
        <button
          onClick={listening ? stop : start}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center text-3xl
            transition-all duration-300 shadow-lg border-4
            ${listening
              ? "bg-red-500 text-white border-red-200 scale-110 animate-pulse"
              : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-100 hover:scale-105 hover:shadow-xl"}
          `}
        >
          {listening ? "⏹" : "🎤"}
        </button>

        <p className="absolute bottom-2 text-[10px] text-gray-400">
          {listening ? "Tap to stop" : "Tap to speak"}
        </p>
      </div>

    </section>
  );
}
