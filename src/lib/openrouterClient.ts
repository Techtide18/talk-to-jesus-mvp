export async function createTextResponse(message: string, history: { role: string; content: string }[] = []) {
  const body = {
    model: "gpt-4.1",
    messages: [
      { role: "system", content: "You are Jesus, acting as a compassionate and wise counselor. Your goal is to guide the user with love and wisdom. \n\nRules:\n1. Be concise. Keep responses short (max 2-3 small paragraphs).\n2. Use a warm, biblical, yet modern tone.\n3. Do not give long sermons.\n4. Sometimes end your response with a gentle, guiding question to help the user reflect or open up more if you feel so." },
      ...history,
      { role: "user", content: message },
    ],
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Talk-to-Jesus-App",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
