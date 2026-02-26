import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { SurahInfo } from '../types';

interface SurahCardProps {
    surah: SurahInfo;
    index: number;
    onPress: () => void;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, index, onPress }) => {
    const { t, language } = useLanguage();
    const surahNumber = index + 1;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.touchable}
        >
            <LinearGradient
                colors={['rgba(212, 165, 116, 0.1)', 'rgba(212, 165, 116, 0.0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
            >
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                    <View style={styles.numberContainer}>
                        <LinearGradient
                            colors={[COLORS.accent, COLORS.accentMuted]}
                            style={styles.numberDiamond}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.numberDiamondInner}>
                                <Text style={styles.number}>{surahNumber}</Text>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.leftSection}>
                            <Text style={styles.nameEnglish}>
                                {language === 'ar' ? surah.surahNameArabic : surah.surahName}
                            </Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.translation}>
                                    {language === 'ar' ? '' : surah.surahNameTranslation}
                                </Text>
                                {language !== 'ar' && <View style={styles.dot} />}
                                <Text style={styles.meta}>{surah.totalAyah} {t('surahInfo.verses')}</Text>
                                <View style={styles.dot} />
                                <Text style={styles.meta}>{t(`surahInfo.${surah.revelationPlace}`)}</Text>
                            </View>
                        </View>

                        <View style={styles.rightSection}>
                            <Text style={styles.nameArabic}>{surah.surahNameArabic}</Text>
                        </View>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={COLORS.accentMuted}
                        style={styles.chevron}
                    />
                </BlurView>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        marginHorizontal: SIZES.md,
        marginBottom: SIZES.sm,
        borderRadius: SIZES.radiusLg,
        ...SHADOWS.glow,
    },
    gradientBorder: {
        borderRadius: SIZES.radiusLg,
        padding: 1, // acts as border width
    },
    blurContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(17, 29, 46, 0.65)', // Glass effect bg
        borderRadius: SIZES.radiusLg - 1, // Slightly less than border to fit inside
        paddingVertical: SIZES.md + 4,
        paddingHorizontal: SIZES.md,
        overflow: 'hidden',
    },
    numberContainer: {
        marginRight: SIZES.md + 4,
    },
    numberDiamond: {
        width: 44,
        height: 44,
        borderRadius: 12,
        transform: [{ rotate: '45deg' }],
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.glow,
    },
    numberDiamondInner: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.bgDark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    number: {
        fontSize: SIZES.fontMd,
        color: COLORS.accent,
        fontWeight: '700',
        transform: [{ rotate: '-45deg' }],
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flex: 1,
        marginRight: SIZES.sm,
    },
    nameEnglish: {
        fontSize: SIZES.fontMd,
        color: COLORS.textPrimary,
        fontWeight: '600',
        marginBottom: 3,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    translation: {
        fontSize: SIZES.fontXs,
        color: COLORS.textSecondary,
    },
    meta: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: COLORS.textMuted,
        marginHorizontal: 6,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    nameArabic: {
        fontSize: SIZES.fontXl,
        color: COLORS.accent,
        fontFamily: 'Amiri',
    },
    chevron: {
        marginLeft: SIZES.xs,
    },
});
