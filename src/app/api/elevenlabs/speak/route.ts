import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();
        const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
        const JESUS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

        if (!ELEVENLABS_API_KEY) {
            return NextResponse.json(
                { error: "Missing ELEVENLABS_API_KEY" },
                { status: 500 }
            );
        }

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
                    model_id: "eleven_turbo_v2_5",
                    voice_settings: {
                        stability: 0.65,
                        similarity_boost: 0.85,
                        style: 0.4,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("ElevenLabs API Error:", errorText);
            return NextResponse.json(
                { error: "ElevenLabs API failed", details: errorText },
                { status: response.status }
            );
        }

        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
            },
        });
    } catch (error) {
        console.error("Error in /api/elevenlabs/speak:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
