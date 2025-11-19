"use client";
import { useState, useRef, useEffect } from "react";
import { createTextResponse } from "../lib/openrouterClient";

export default function VoiceCall({ prefill = "" }) {
  const [messages, setMessages] = useState<
    { role: "user" | "jesus"; text: string }[]
  >([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const audioQueue = useRef<HTMLAudioElement[]>([]); // for smooth sequential playback

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
    }, 150);
  }, [messages, loading]);

  // ███████████████████████████████████████
  //   JESUS VOICE – REAL HUMAN (ElevenLabs)
  // ███████████████████████████████████████
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; // ← Put your key here (get free at elevenlabs.io)

  // Best Jesus voice as of 2025 → "Adam" or "Onyx" style
  const JESUS_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // → "Adam" – deep, warm, incredibly calming
  // Alternative ultra-popular Jesus voice: "21m00Tcm4TlvDq8ikWAM" (Rachel → no, wait, that's female)
  // Best ones for Jesus: 
  // → "pNInz6obpgDQGcFmaJgB" = Adam (MOST RECOMMENDED)
  // → "EXAVITQu4vr4xnSDxMaL" = Benjamin (very gentle)
  // → "VR6AewLTigWG4xSOukaG" = Arnold (too strong)
  // → "AZnzlk1XvdvUeBnXmlld" = Domi (soft female if you want Mary)

  const speakJesus = async (text: string) => {
    if (!text.trim()) return;

    setIsSpeaking(true);

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${JESUS_VOICE_ID}/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_turbo_v2_5", // fastest + most natural 2025
            voice_settings: {
              stability: 0.65,
              similarity_boost: 0.85,
              style: 0.4,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) throw new Error("ElevenLabs failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
    } catch (err) {
      console.error("TTS failed:", err);
      setIsSpeaking(false);
      // Fallback to browser voice if ElevenLabs down
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 0.9;
      const voice = speechSynthesis
        .getVoices()
        .find((v) => v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("google") && v.lang === "en-US") ||
        speechSynthesis.getVoices()[0];
      utterance.voice = voice;
      speechSynthesis.speak(utterance);
      utterance.onend = () => setIsSpeaking(false);
    }
  };

  // Auto-send prefill
  useEffect(() => {
    if (!prefill.trim()) return;

    setMessages([{ role: "user", text: prefill }]);
    setLoading(true);

    (async () => {
      const reply = await createTextResponse(prefill, []);
      setLoading(false);
      setMessages((prev) => [...prev, { role: "jesus", text: reply }]);
      speakJesus(reply);
    })();
  }, [prefill]);

  // Voice recognition
  const start = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      alert("Your browser doesn't support voice recognition");
      return;
    }

    const rec = new SR();
    rec.lang = "en-IN" in navigator.languages ? "en-IN" : "en-US"; // better accent
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript.trim();
      if (!text) return;

      setMessages((prev) => [...prev, { role: "user", text }]);
      setLoading(true);

      const reply = await createTextResponse(text);
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
            {isSpeaking ? "Jesus is speaking..." : listening ? "Listening..." : "Ready"}
          </p>
        </div>
      </header>

      {/* Chat */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-transparent to-gray-50/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <div className="text-6xl opacity-40">🎙️</div>
            <p className="text-center">Tap the golden microphone<br />and speak to Me, My child...</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-md border ${m.role === "user" ? "bg-blue-100 border-blue-200" : "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300"}`}>
                {m.role === "user" ? "🙏" : "✝️"}
              </div>
              <div className={`px-5 py-3.5 rounded-2xl shadow-md text-[0.95rem] leading-relaxed font-light ${m.role === "user"
                ? "bg-blue-600 text-white rounded-tr-sm"
                : "bg-white/90 backdrop-blur-sm border border-amber-100 text-gray-800 rounded-tl-sm font-serif italic text-gray-700"
                }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300 flex items-center justify-center">✝️</div>
              <div className="bg-white/90 backdrop-blur-sm border border-amber-100 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-md flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Microphone Button */}
      <div className="p-6 bg-white border-t border-gray-100 flex justify-center relative">
        <button
          onClick={listening ? stop : start}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl border-8 transition-all duration-500
            ${listening
              ? "bg-red-500/90 text-white border-red-300 animate-pulse scale-105"
              : "bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-yellow-200 hover:scale-110 hover:from-yellow-300 hover:to-orange-400 shadow-orange-300/50"
            }
          `}
        >
          {listening ? "⏹" : "🎤"}
        </button>
        <p className="absolute bottom-1 text-xs text-gray-500">
          {listening ? "Tap to stop" : "Tap and speak to Jesus"}
        </p>
      </div>
    </section>
  );
}