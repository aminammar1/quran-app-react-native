import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import { quranApi } from '../services/quranApi';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AudioPlayerBarProps {
    surahName?: string;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ surahName }) => {
    const { isPlaying, isLoading, pauseAudio, resumeAudio, stopAudio, duration, position, currentSurah, selectedReciter, playAudio } = useAudio();
    const { t, language } = useLanguage();
    const insets = useSafeAreaInsets();

    const [displaySurahName, setDisplaySurahName] = React.useState(surahName || '');

    const [showPicker, setShowPicker] = React.useState(false);
    const [surahList, setSurahList] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (currentSurah) {
            // Fetch cached surah list to resolve the current surah's actual name and translate it
            quranApi.getSurahList().then(list => {
                setSurahList(list);
                const s = list[currentSurah - 1];
                if (s) {
                    setDisplaySurahName(language === 'ar' ? s.surahNameArabic : s.surahName);
                }
            }).catch(() => { });
        } else {
            setDisplaySurahName(surahName || '');
        }
    }, [currentSurah, language, surahName]);

    const handleNext = async () => {
        if (currentSurah && currentSurah < 114) {
            const next = currentSurah + 1;
            const url = quranApi.getChapterAudioUrl(next, selectedReciter);
            await playAudio(url, next);
        }
    };

    const handlePrev = async () => {
        if (currentSurah && currentSurah > 1) {
            const prev = currentSurah - 1;
            const url = quranApi.getChapterAudioUrl(prev, selectedReciter);
            await playAudio(url, prev);
        }
    };

    const jumpToSurah = async (surahNumber: number) => {
        setShowPicker(false);
        const url = quranApi.getChapterAudioUrl(surahNumber, selectedReciter);
        await playAudio(url, surahNumber);
    };

    if (!isPlaying && !isLoading) return null;

    const progressWidth = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View style={styles.outerContainer}>
            {showPicker && (
                <View style={styles.pickerOverlay}>
                    <BlurView intensity={80} tint="dark" style={styles.pickerContainer}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>{t('player.surah')} Selection</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Ionicons name="close-circle" size={24} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.scrollWrapper}>
                            <ScrollView style={{ flex: 1 }}>
                                {surahList.map((s, idx) => {
                                    const num = idx + 1;
                                    const isActive = num === currentSurah;
                                    return (
                                        <TouchableOpacity
                                            key={num}
                                            style={[styles.pickerItem, isActive && styles.pickerItemActive]}
                                            onPress={() => jumpToSurah(num)}
                                        >
                                            <Text style={[styles.pickerItemText, isActive && styles.pickerItemTextActive]}>
                                                {num}. {language === 'ar' ? s.surahNameArabic : s.surahName}
                                            </Text>
                                            {isActive && <Ionicons name="volume-high" size={16} color={COLORS.bgDark} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </BlurView>
                </View>
            )}

            <BlurView intensity={100} tint="dark" style={[styles.container, { paddingBottom: insets.bottom }]}>
                {/* Background Progress Fill */}
                <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />

                <View style={styles.content}>
                    <View style={styles.iconBox}>
                        <Ionicons name="musical-notes" size={20} color={COLORS.bgDark} />
                    </View>

                    {/* Making info clickable to open playlist */}
                    <TouchableOpacity style={styles.info} onPress={() => setShowPicker(!showPicker)} activeOpacity={0.7}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={styles.label} numberOfLines={1}>
                                {displaySurahName || t('player.surah')}
                            </Text>
                            <Ionicons name="chevron-up" size={14} color={COLORS.textMuted} />
                        </View>
                        <Text style={styles.subtext}>
                            {isLoading ? t('reader.loading') : t('reader.playFull')}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.controls}>
                        <TouchableOpacity onPress={handlePrev} style={styles.skipButton} activeOpacity={0.7}>
                            <Ionicons name="play-skip-back" size={20} color={COLORS.textPrimary} />
                        </TouchableOpacity>

                        {isLoading ? (
                            <View style={styles.controlButton}>
                                <ActivityIndicator size="small" color={COLORS.accent} />
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={isPlaying ? pauseAudio : resumeAudio}
                                style={styles.controlButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isPlaying ? 'pause' : 'play'}
                                    size={24}
                                    color={COLORS.textPrimary}
                                    style={{ marginLeft: isPlaying ? 0 : 3 }} // center the play icon visually
                                />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={handleNext} style={styles.skipButton} activeOpacity={0.7}>
                            <Ionicons name="play-skip-forward" size={20} color={COLORS.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={stopAudio}
                            style={styles.stopButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={24} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...SHADOWS.glow,
        elevation: 25,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    container: {
        backgroundColor: 'rgba(12, 22, 38, 0.45)', // very clear glassy dark
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 165, 116, 0.2)', // Thin gold border
        overflow: 'hidden',
    },
    progressFill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(212, 165, 116, 0.15)', // semi-transparent golden progress overlay
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5,
        paddingLeft: 10,
        paddingRight: 15,
        height: 70, // fixed sensible height before padding bottom added by insets
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SIZES.md,
        // glow for the icon box
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        letterSpacing: 0.3,
        marginBottom: 2,
    },
    subtext: {
        color: COLORS.textMuted,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)', // extremely subtle wrapper
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerOverlay: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: SIZES.sm,
    },
    pickerContainer: {
        width: '90%',
        height: 300,
        borderRadius: SIZES.radiusLg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 165, 116, 0.2)',
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    pickerTitle: {
        color: COLORS.accent,
        fontWeight: '700',
        fontSize: SIZES.fontMd,
    },
    scrollWrapper: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    pickerItemActive: {
        backgroundColor: COLORS.accentMuted,
    },
    pickerItemText: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontSm,
    },
    pickerItemTextActive: {
        color: COLORS.bgDark,
        fontWeight: 'bold',
    },
});
