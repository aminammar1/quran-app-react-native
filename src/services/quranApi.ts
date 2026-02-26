import { ENDPOINTS } from '../constants/api';
import { SurahInfo, SurahDetail, ReciterMap, AudioData } from '../types';

class QuranApiService {
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    private async fetchWithCache<T>(url: string): Promise<T> {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data as T;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        const data = json.data || json; // Handle Al Quran Cloud format
        this.cache.set(url, { data, timestamp: Date.now() });
        return data as T;
    }

    async getSurahList(): Promise<SurahInfo[]> {
        const data = await this.fetchWithCache<any[]>(ENDPOINTS.surahList);
        return data.map((item: any) => ({
            surahName: item.englishName,
            surahNameArabic: item.name,
            surahNameArabicLong: item.name,
            surahNameTranslation: item.englishNameTranslation,
            revelationPlace: item.revelationType,
            totalAyah: item.numberOfAyahs,
        }));
    }

    async getSurah(surahNo: number): Promise<SurahDetail> {
        const data = await this.fetchWithCache<any[]>(ENDPOINTS.surah(surahNo));
        const arabicEdition = data[0];
        const englishEdition = data[1];

        return {
            surahNo: arabicEdition.number,
            surahName: arabicEdition.englishName,
            surahNameArabic: arabicEdition.name,
            surahNameArabicLong: arabicEdition.name,
            surahNameTranslation: arabicEdition.englishNameTranslation,
            revelationPlace: arabicEdition.revelationType,
            totalAyah: arabicEdition.numberOfAyahs,
            audio: {},
            arabic1: arabicEdition.ayahs.map((a: any) => a.text),
            arabic2: [],
            english: englishEdition.ayahs.map((a: any) => a.text),
        };
    }

    async getReciters(lang: 'en' | 'ar' = 'en'): Promise<ReciterMap> {
        if (lang === 'ar') {
            return {
                'yasser': 'ياسر الدوسري',
                'maher': 'ماهر المعيقلي',
                'fares': 'فارس عباد',
                'sudais': 'عبدالرحمن السديس',
                'bader': 'بدر التركي'
            };
        }
        return {
            'yasser': 'Yasser Al-Dosari',
            'maher': 'Maher Al-Muaiqly',
            'fares': 'Fares Abbad',
            'sudais': 'Abdur-Rahman As-Sudais',
            'bader': 'Bader Al-Turki'
        };
    }

    getChapterAudioUrl(surahNo: number, reciterId: string): string {
        const pS = surahNo.toString().padStart(3, '0');
        switch (reciterId) {
            case 'maher':
                return `https://server12.mp3quran.net/maher/${pS}.mp3`;
            case 'fares':
                return `https://server8.mp3quran.net/frs_a/${pS}.mp3`;
            case 'sudais':
                return `https://server11.mp3quran.net/sds/${pS}.mp3`;
            case 'bader':
                return `https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem/${pS}.mp3`;
            case 'yasser':
            default:
                return `https://server11.mp3quran.net/yasser/${pS}.mp3`;
        }
    }

    async getVerseAudio(surahNo: number, ayahNo: number): Promise<AudioData> {
        return {};
    }

    async getChapterAudio(surahNo: number): Promise<AudioData> {
        return {};
    }

    clearCache(): void {
        this.cache.clear();
    }
}

export const quranApi = new QuranApiService();
