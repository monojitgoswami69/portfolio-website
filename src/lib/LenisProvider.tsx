"use client";

import React, { useEffect, useState } from 'react';
import { ReactLenis } from 'lenis/react';

interface LenisProviderProps {
    children: React.ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduceMotion(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    if (reduceMotion) {
        return <>{children}</>;
    }

    return (
        <ReactLenis root options={{ autoRaf: true, lerp: 0.1, duration: 1.2 }}>
            {children}
        </ReactLenis>
    );
}
