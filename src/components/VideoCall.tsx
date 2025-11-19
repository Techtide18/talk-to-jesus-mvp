'use client';
import Avatar from './Avatar';
import { useEffect, useState } from 'react';


export default function VideoCall() {
const [talking, setTalking] = useState(false);


useEffect(() => {
const synth = speechSynthesis;
const start = () => setTalking(true);
const end = () => setTalking(false);


synth.addEventListener('start', start);
synth.addEventListener('end', end);


return () => {
synth.removeEventListener('start', start);
synth.removeEventListener('end', end);
};
}, []);


return (
<section id="video" className="rounded-2xl p-6 bg-white/70 backdrop-blur shadow-lg border">
<h2 className="text-xl font-semibold mb-4">Video Call</h2>


<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
<div className="p-4 bg-white/60 rounded-xl shadow text-center h-56 flex items-center justify-center">
<span className="text-gray-500 text-sm">Camera preview (optional)</span>
</div>


<div className="flex flex-col items-center gap-3">
<div className="w-48 h-48 bg-white rounded-full shadow-lg overflow-hidden flex items-center justify-center">
<Avatar talking={talking} />
</div>
<p className="text-xs text-gray-600">Avatar animates when Jesus speaks</p>
</div>
</div>
</section>
);
}