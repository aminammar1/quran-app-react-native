export const COLORS = {
    // Primary palette — deep Islamic-inspired tones
    primary: '#1B4332',        // Deep emerald green
    primaryLight: '#2D6A4F',   // Medium green
    primarySoft: '#40916C',    // Softer green
    accent: '#D4A574',         // Warm gold/sand
    accentLight: '#E8C9A0',    // Light gold
    accentMuted: '#C9A96E',    // Muted gold

    // Backgrounds
    bgDark: '#0A1628',         // Deep navy
    bgCard: '#111D2E',         // Card background
    bgElevated: '#162236',     // Elevated surface
    bgSurah: '#0F1A2B',       // Surah reading background
    bgOverlay: 'rgba(10, 22, 40, 0.95)',

    // Text
    textPrimary: '#F0E6D3',   // Warm off-white
    textSecondary: '#A0B4C8',  // Muted blue-gray
    textArabic: '#F5EDE0',     // Warm white for Arabic
    textMuted: '#5A7089',      // Muted text
    textGold: '#D4A574',       // Gold text

    // Borders & Dividers
    border: '#1E3248',
    borderLight: '#243A52',
    divider: 'rgba(212, 165, 116, 0.15)',
    dividerGold: 'rgba(212, 165, 116, 0.3)',

    // States
    success: '#52B788',
    error: '#E76F51',
    warning: '#E9C46A',

    // Transparent
    transparent: 'transparent',
    white: '#FFFFFF',
    black: '#000000',
};

export const FONTS = {
    arabicTitle: 'Amiri',
    arabicBody: 'Amiri',
    heading: 'System',
    body: 'System',
};

export const SIZES = {
    // Spacing
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,

    // Font sizes
    fontXs: 11,
    fontSm: 13,
    fontMd: 15,
    fontLg: 18,
    fontXl: 22,
    fontXxl: 28,
    fontArabic: 26,
    fontArabicLg: 32,
    fontBismillah: 28,

    // Border radius
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 24,
    radiusFull: 999,

    // Misc
    headerHeight: 56,
    tabBarHeight: 70,
    iconSm: 18,
    iconMd: 24,
    iconLg: 32,
};

export const SHADOWS = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    subtle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    glow: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
};
