"use client";

import React from 'react';
import { ReactLenis } from 'lenis/react';

interface LenisProviderProps {
    children: React.ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
    return (
        <ReactLenis root options={{ autoRaf: true, lerp: 0.1, duration: 1.2 }}>
            {children}
        </ReactLenis>
    );
}
