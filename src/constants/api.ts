export const API_BASE_URL = 'https://api.alquran.cloud/v1';

export const ENDPOINTS = {
    surahList: `${API_BASE_URL}/surah`,
    surah: (surahNo: number) => `${API_BASE_URL}/surah/${surahNo}/editions/quran-uthmani,en.asad`,
    reciters: ``,
    audioVerse: (surahNo: number, ayahNo: number) => ``,
    audioChapter: (surahNo: number) => ``,
};
