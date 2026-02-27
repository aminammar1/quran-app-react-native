import { create } from 'zustand';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

// External seeking flag — checked by playback listener to skip position updates
let _isSeeking = false;
export const setSeekingFlag = (v: boolean) => { _isSeeking = v; };

interface AudioState {
    isPlaying: boolean;
    isLoading: boolean;
    currentSurah: number | null;
    currentAyah: number | null;
    selectedReciter: string;
    duration: number;
    position: number;
    sound: AudioPlayer | null;

    setSelectedReciter: (reciterId: string) => void;
    playAudio: (url: string, surahNo: number, ayahNo?: number) => Promise<void>;
    pauseAudio: () => Promise<void>;
    resumeAudio: () => Promise<void>;
    stopAudio: () => Promise<void>;
    seekTo: (position: number) => Promise<void>;
    cleanupSound: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    isPlaying: false,
    isLoading: false,
    currentSurah: null,
    currentAyah: null,
    selectedReciter: 'yasser',
    duration: 0,
    position: 0,
    sound: null,

    setSelectedReciter: (reciterId: string) => set({ selectedReciter: reciterId }),

    cleanupSound: async () => {
        const { sound } = get();
        if (sound) {
            try {
                sound.pause();
                sound.remove();
            } catch (e) { }
            set({ sound: null });
        }
    },

    playAudio: async (url: string, surahNo: number, ayahNo?: number) => {
        const store = get();
        set({ isLoading: true });

        await store.cleanupSound();

        try {
            await setAudioModeAsync({
                playsInSilentMode: true,
                shouldPlayInBackground: true,
            });

            const player = createAudioPlayer(url);

            player.addListener('playbackStatusUpdate', (status: any) => {
                const isLoaded = status.isLoaded ?? true;
                if (!isLoaded) return;

                // Skip position updates while user is dragging the seek bar
                if (_isSeeking) {
                    set({
                        isPlaying: player.playing,
                        duration: player.duration * 1000,
                    });
                    return;
                }

                set({
                    isPlaying: player.playing,
                    duration: player.duration * 1000,
                    position: player.currentTime * 1000,
                });

                // End of playback
                if (status.status === 'idle' || (player.duration > 0 && player.currentTime >= player.duration)) {
                    set({
                        isPlaying: false,
                        position: 0,
                    });
                }
            });

            player.play();

            set({
                sound: player,
                isPlaying: true,
                isLoading: false,
                currentSurah: surahNo,
                currentAyah: ayahNo ?? null,
                position: 0,
                duration: 0,
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            set({ isLoading: false, isPlaying: false });
        }
    },

    pauseAudio: async () => {
        const { sound } = get();
        if (sound) {
            sound.pause();
            set({ isPlaying: false });
        }
    },

    resumeAudio: async () => {
        const { sound, currentSurah, selectedReciter, playAudio } = get();
        if (sound) {
            sound.play();
            set({ isPlaying: true });
        } else if (currentSurah) {
            const { quranApi } = await import('../services/quranApi');
            const url = quranApi.getChapterAudioUrl(currentSurah, selectedReciter);
            await playAudio(url, currentSurah);
        }
    },

    stopAudio: async () => {
        const store = get();
        await store.cleanupSound();
        set({
            isPlaying: false,
            isLoading: false,
            currentAyah: null,
            position: 0,
            duration: 0,
        });
    },

    seekTo: async (millis: number) => {
        const { sound } = get();
        if (sound) {
            // Immediately update position for instant feedback
            set({ position: millis });
            await sound.seekTo(millis / 1000);
        }
    },
}));
