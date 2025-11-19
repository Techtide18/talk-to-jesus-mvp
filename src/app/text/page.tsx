"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import TextChat from "../../components/TextChat";

export default function TextPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) router.push("/");
  }, [router]);

  return (
    <div className="page-wrap fade-in p-6">
      <div className="max-w-3xl mx-auto">
        <TextChat />
      </div>
    </div>
  );
}
