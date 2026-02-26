export interface SurahInfo {
    surahName: string;
    surahNameArabic: string;
    surahNameArabicLong: string;
    surahNameTranslation: string;
    revelationPlace: string;
    totalAyah: number;
}

export interface SurahDetail extends SurahInfo {
    surahNo: number;
    audio: Record<string, AudioReciter>;
    english: string[];
    arabic1: string[];
    arabic2: string[];
    bengali?: string[];
    urdu?: string[];
}

export interface AudioReciter {
    reciter: string;
    url: string;
    originalUrl: string;
}

export interface ReciterMap {
    [key: string]: string;
}

export interface AudioData {
    [key: string]: AudioReciter;
}

export type RootStackParamList = {
    Main: undefined;
    SurahDetail: { surahNo: number; surahName: string; surahNameArabic: string };
};

export type BottomTabParamList = {
    Mushaf: undefined;
    Bookmarks: undefined;
    Settings: undefined;
};
