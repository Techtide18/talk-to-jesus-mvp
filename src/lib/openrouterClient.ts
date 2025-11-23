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

export async function* createStreamingResponse(message: string, history: { role: string; content: string }[] = []) {
  const body = {
    model: "gpt-4.1", // Or a faster model like "meta-llama/llama-3-8b-instruct:free" for speed
    messages: [
      { role: "system", content: "You are Jesus, acting as a compassionate and wise counselor. Your goal is to guide the user with love and wisdom. \n\nRules:\n1. Be concise. Keep responses short (max 2-3 small paragraphs).\n2. Use a warm, biblical, yet modern tone.\n3. Do not give long sermons.\n4. Sometimes end your response with a gentle, guiding question to help the user reflect or open up more if you feel so." },
      ...history,
      { role: "user", content: message },
    ],
    stream: true,
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

  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (line === "data: [DONE]") return;
      if (line.startsWith("data: ")) {
        try {
          const json = JSON.parse(line.replace("data: ", ""));
          const content = json.choices[0]?.delta?.content;
          if (content) yield content;
        } catch (e) {
          console.error("Error parsing stream chunk", e);
        }
      }
    }
  }
}
