'use client';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import simpleFace from './lotties/simple-face.json';
import { useRef, useEffect } from 'react';


export default function Avatar({ talking }: { talking: boolean }) {
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        lottieRef.current?.setSpeed(talking ? 1.4 : 0.7);
    }, [talking]);

    return (
        <div className="w-full h-full avatar-aura holy-rays">
            <Lottie lottieRef={lottieRef} animationData={simpleFace} loop />
        </div>
    );
}