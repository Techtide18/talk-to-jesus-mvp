'use client';
import Link from 'next/link';
import { useState } from 'react';


export default function NavBar() {
const [active, setActive] = useState('text');


const tabs = [
{ id: 'text', label: 'Text Chat' },
{ id: 'voice', label: 'Voice Call' },
{ id: 'video', label: 'Video Call' }
];


return (
<nav className="w-full py-4 flex flex-col items-center mb-6">
<h1 className="text-3xl font-bold text-gray-800 mb-4">Talk to Jesus</h1>
<div className="flex gap-4">
{tabs.map(t => (
<a
key={t.id}
href={`#${t.id}`}
onClick={() => setActive(t.id)}
className={`px-4 py-2 rounded-full text-sm font-medium transition backdrop-blur border shadow-sm
${active === t.id ? 'bg-white text-gray-900' : 'bg-white/60 text-gray-600 hover:bg-white'}
`}
>
{t.label}
</a>
))}
</div>
</nav>
);
}