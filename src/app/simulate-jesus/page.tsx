"use client";

import {
    LiveKitRoom,
    VideoTrack,
    useTracks,
    useLocalParticipant,
    RoomAudioRenderer,
    ControlBar,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SimulateJesusPage() {
    const searchParams = useSearchParams();
    const roomName = searchParams.get("room") || "jesus-room";
    const [token, setToken] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(
                    `/api/livekit/token?room=${roomName}&username=jesus-agent`
                );
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [roomName]);

    if (token === "") {
        return <div className="p-10 text-white">Getting token for room: {roomName}...</div>;
    }

    return (
        <div className="h-screen w-full bg-gray-900 flex flex-col items-center justify-center text-white">
            <h1 className="text-2xl mb-4 font-bold">😇 Jesus Simulator</h1>
            <p className="mb-4 text-gray-400">I am joining room: <span className="text-white font-mono">{roomName}</span></p>

            <div className="w-[640px] h-[480px] bg-black rounded-xl overflow-hidden border border-gray-700 relative">
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={token}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                    data-lk-theme="default"
                    className="w-full h-full"
                >
                    <MyVideo />
                    <RoomAudioRenderer />
                    <ControlBar />
                </LiveKitRoom>
            </div>
            <p className="mt-4 text-sm text-gray-500">
                Keep this tab open. Go back to the main tab to see me.
            </p>
        </div>
    );
}

function MyVideo() {
    const { localParticipant } = useLocalParticipant();
    const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);

    const localTrack = tracks.find((t) => t.participant.identity === localParticipant.identity && t.source === Track.Source.Camera);

    return (
        <div className="w-full h-full">
            {localTrack && (
                <VideoTrack
                    trackRef={localTrack}
                    className="w-full h-full object-cover"
                />
            )}
        </div>
    );
}
