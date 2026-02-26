import React, { ReactNode } from 'react';
import { useAudioStore } from '../store/useAudioStore';

// We provide an empty provider so App.tsx doesn't break. 
// With zustand, we technically don't need a provider anymore!
export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <>{children}</>;
};

// Re-export the store hook using the old hook name
export const useAudio = useAudioStore;

