import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useAudio } from '../context/AudioContext';

interface AyahCardProps {
    ayahNumber: number;
    arabicText: string;
    englishText: string;
    audioUrl?: string;
    surahNo: number;
    languageMode: 'both' | 'arabic' | 'english';
}

export const AyahCard: React.FC<AyahCardProps> = ({
    ayahNumber,
    arabicText,
    englishText,
    audioUrl,
    surahNo,
    languageMode,
}) => {
    const { playAudio, isPlaying, currentSurah, currentAyah, pauseAudio } = useAudio();
    const isThisAyahPlaying = isPlaying && currentSurah === surahNo && currentAyah === ayahNumber;

    const handlePlayPress = async () => {
        if (isThisAyahPlaying) {
            await pauseAudio();
        } else if (audioUrl) {
            await playAudio(audioUrl, surahNo, ayahNumber);
        }
    };

    return (
        <View style={styles.container}>
            {/* Ayah Header */}
            <View style={styles.header}>
                <View style={styles.ayahBadge}>
                    <Text style={styles.ayahNumber}>{ayahNumber}</Text>
                </View>
                <View style={styles.headerActions}>
                    {audioUrl && (
                        <TouchableOpacity
                            onPress={handlePlayPress}
                            style={[styles.actionButton, isThisAyahPlaying && styles.actionButtonActive]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isThisAyahPlaying ? 'pause' : 'play'}
                                size={14}
                                color={isThisAyahPlaying ? COLORS.accent : COLORS.textSecondary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Arabic Text */}
            {languageMode !== 'english' && (
                <Text style={styles.arabicText}>{arabicText}</Text>
            )}

            {/* Divider */}
            {languageMode === 'both' && <View style={styles.divider} />}

            {/* English Translation */}
            {languageMode !== 'arabic' && (
                <Text style={styles.englishText}>{englishText}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SIZES.md,
    },
    ayahBadge: {
        width: 32,
        height: 32,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.bgElevated,
        borderWidth: 1,
        borderColor: COLORS.dividerGold,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ayahNumber: {
        fontSize: SIZES.fontXs,
        color: COLORS.accent,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        gap: SIZES.xs,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.bgElevated,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonActive: {
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(212, 165, 116, 0.1)',
    },
    arabicText: {
        fontSize: SIZES.fontArabic,
        color: COLORS.textArabic,
        fontFamily: 'Amiri',
        textAlign: 'right',
        lineHeight: 52,
        marginBottom: SIZES.md,
        writingDirection: 'rtl',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginBottom: SIZES.md,
    },
    englishText: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        lineHeight: 24,
        textAlign: 'left',
    },
});
