// client-side tiny wrapper using fetch to OpenAI Responses API
// NOTE: for demo only — requires NEXT_PUBLIC_OPENAI_API_KEY in .env.local


export async function createTextResponse(message: string, history = []) {
const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
if (!key) throw new Error('Set NEXT_PUBLIC_OPENAI_API_KEY in .env.local');


const inputMessages = [
{ role: 'system', content: "You are Jesus: calm, compassionate, wise. Use modern language, be comforting and brief when asked. No preaching; give actionable comfort and reflection." },
...history,
{ role: 'user', content: message }
];


const body = {
model: 'gpt-4o-mini',
messages: inputMessages
};


const res = await fetch('https://api.openai.com/v1/chat/completions', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${key}`,
},
body: JSON.stringify(body),
});


if (!res.ok) {
const text = await res.text();
throw new Error('OpenAI error: ' + text);
}


const data = await res.json();
// adapt to standard shape (chat/completions)
const content = data.choices?.[0]?.message?.content ?? '';
return content.trim();
}