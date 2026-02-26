import { create } from 'zustand';

type AppLanguage = 'en' | 'ar';

interface SettingsState {
    language: AppLanguage;
    setLanguage: (lang: AppLanguage) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    language: 'ar', // default to Arabic as requested by their latest preferences
    setLanguage: (lang) => set({ language: lang }),
}));
