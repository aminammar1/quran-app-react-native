/**
 * Utility functions for normalizing Arabic text.
 * Used across search and display logic throughout the app.
 */

/**
 * Normalize Arabic text by removing diacritics and standardizing character forms.
 * This allows fuzzy matching without requiring exact tashkeel input.
 */
export const normalizeArabic = (text: string): string => {
    return text
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Remove diacritics
        .replace(/[إأآاٱ]/g, 'ا') // Normalize Alif forms
        .replace(/ة/g, 'ه') // Normalize Teh Marbuta to Heh
        .replace(/ى/g, 'ي'); // Normalize Alef Maksura to Yeh
};
