import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.HEYGEN_API_KEY;

        if (!apiKey) {
            console.error("HEYGEN_API_KEY is missing in server env");
            return NextResponse.json(
                { error: "HEYGEN_API_KEY is missing" },
                { status: 500 }
            );
        }
        console.log("HEYGEN_API_KEY found:", apiKey.slice(0, 5) + "...");

        const response = await fetch(
            "https://api.heygen.com/v1/streaming.create_token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Api-Key": apiKey,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("HeyGen API Error:", response.status, errorText);
            return NextResponse.json(
                { error: `HeyGen API error: ${response.status} ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data.data); // Returns { token, session_id, ... }

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
