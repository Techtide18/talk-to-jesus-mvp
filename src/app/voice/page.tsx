"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import VoiceCall from "../../components/VoiceCall";
import { isLoggedIn } from "../../lib/auth";

export default function VoicePage() {
  const params = useSearchParams();
  const router = useRouter();
  const [prefill, setPrefill] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) router.push("/");

    const p = params.get("prefill");
    if (p) setPrefill(p);
  }, [params, router]);

  return (
    <div className="max-w-3xl mx-auto p-4 page-transition">
      <VoiceCall prefill={prefill} />
    </div>
  );
}
