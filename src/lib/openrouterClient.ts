export async function createTextResponse(message: string, history = []) {
  const body = {
    model: "gpt-4.1",
    messages: [
      { role: "system", content: "You are Jesus: calm, wise, loving." },
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
