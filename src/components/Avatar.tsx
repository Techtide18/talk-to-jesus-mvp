'use client';
import Lottie from 'lottie-react';
import simpleFace from './lotties/simple-face.json';


export default function Avatar({ talking }: { talking: boolean }) {
return (
<div className="w-full h-full avatar-aura holy-rays">
<Lottie animationData={simpleFace} loop speed={talking ? 1.4 : 0.7} />
</div>
);
}