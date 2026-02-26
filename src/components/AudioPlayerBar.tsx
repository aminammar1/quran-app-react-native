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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

interface AudioPlayerBarProps {
    surahName?: string;
    bottomOffset?: number;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ surahName, bottomOffset = 0 }) => {
    const { isPlaying, isLoading, pauseAudio, resumeAudio, stopAudio, duration, position, currentSurah, selectedReciter, playAudio, seekTo } = useAudio();
    const { t, language } = useLanguage();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [surahList, setSurahList] = React.useState<any[]>([]);
    const [showPicker, setShowPicker] = React.useState(false);
    const [barWidth, setBarWidth] = React.useState(0);

    const formatTime = (millis: number) => {
        if (!millis || millis < 0) return '0:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (event: any) => {
        if (barWidth > 0 && duration > 0) {
            const touchX = event.nativeEvent.locationX;
            const percentage = Math.max(0, Math.min(1, touchX / barWidth));
            const seekPosition = percentage * duration;
            seekTo(seekPosition);
        }
    };

    // Load surah list once on mount (cached by API service)
    React.useEffect(() => {
        quranApi.getSurahList().then(list => setSurahList(list)).catch(() => { });
    }, []);

    // Derive display name directly from current state — no async delay
    const displaySurahName = React.useMemo(() => {
        if (currentSurah && surahList.length > 0) {
            const s = surahList[currentSurah - 1];
            if (s) {
                return language === 'ar' ? s.surahNameArabic : s.surahName;
            }
        }
        return surahName || t('player.surah');
    }, [currentSurah, surahList, language, surahName, t]);

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

    const navigateToSurah = () => {
        if (currentSurah) {
            const s = surahList[currentSurah - 1];
            navigation.navigate('SurahDetail', {
                surahNo: currentSurah,
                surahName: s?.surahName || '',
                surahNameArabic: s?.surahNameArabic || '',
            });
        }
    };

    if (!currentSurah && !isLoading) return null;

    const progressWidth = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View style={[styles.outerContainer, { bottom: bottomOffset + (bottomOffset > 0 ? 0 : 10) }]}>
            {showPicker && (
                <View style={styles.pickerOverlay}>
                    <BlurView intensity={80} tint="dark" style={styles.pickerContainer}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>{t('player.selection')}</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.scrollWrapper}>
                            <ScrollView showsVerticalScrollIndicator={false}>
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
                                            {isActive && <Ionicons name="volume-medium" size={16} color={COLORS.accent} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </BlurView>
                </View>
            )}

            <BlurView intensity={100} tint="dark" style={styles.container}>
                {/* Interactive Progress Bar at Top */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleSeek}
                    style={styles.progressBar}
                    onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
                >
                    <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
                </TouchableOpacity>

                <View style={[styles.content]}>
                    <TouchableOpacity style={styles.iconBox} onPress={() => setShowPicker(!showPicker)}>
                        <Ionicons name="musical-notes" size={20} color={COLORS.bgDark} />
                    </TouchableOpacity>

                    {/* Clicking info now navigates to Surah Detail */}
                    <TouchableOpacity style={styles.info} onPress={navigateToSurah} activeOpacity={0.7}>
                        <Text style={styles.label} numberOfLines={1}>
                            {displaySurahName}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.subtext}>
                                {isLoading ? t('reader.loading') : (isPlaying ? t('player.nowPlaying') : t('reader.playFull'))}
                            </Text>
                            {duration > 0 && (
                                <Text style={styles.timeText}>
                                    {formatTime(position)} / {formatTime(duration)}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <View style={styles.controls}>
                        {!isLoading && (
                            <TouchableOpacity onPress={handlePrev} style={styles.skipButton} activeOpacity={0.7}>
                                <Ionicons name="play-skip-back" size={20} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        )}

                        {isLoading ? (
                            <ActivityIndicator size="small" color={COLORS.accent} style={{ marginHorizontal: 10 }} />
                        ) : (
                            <TouchableOpacity
                                onPress={isPlaying ? pauseAudio : resumeAudio}
                                style={styles.controlButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isPlaying ? 'pause' : 'play'}
                                    size={20}
                                    color={COLORS.textPrimary}
                                    style={{ marginLeft: isPlaying ? 0 : 2 }}
                                />
                            </TouchableOpacity>
                        )}

                        {!isLoading && (
                            <TouchableOpacity onPress={handleNext} style={styles.skipButton} activeOpacity={0.7}>
                                <Ionicons name="play-skip-forward" size={20} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={stopAudio}
                            style={styles.stopButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="stop" size={22} color={COLORS.textMuted} />
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
        left: 10,
        right: 10,
        zIndex: 999,
    },
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 165, 116, 0.15)',
        // Shadow for floating effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 20,
    },
    progressBar: {
        height: 8, // Increased for easier touch
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
    },
    progressFill: {
        height: 4, // Inner fill slightly thinner
        backgroundColor: COLORS.accent,
        borderRadius: 2,
    },
    timeText: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: '500',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        gap: 12,
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 12,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        // glow for the icon box
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    subtext: {
        color: COLORS.textMuted,
        fontSize: 11,
        letterSpacing: 0.5,
        fontWeight: '500',
        marginTop: 2,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    controlButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(212, 165, 116, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
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
        width: '100%',
        height: 320,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 165, 116, 0.15)',
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
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
        paddingVertical: 12,
        paddingHorizontal: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    pickerItemActive: {
        backgroundColor: 'rgba(212, 165, 116, 0.12)',
    },
    pickerItemText: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontSm,
    },
    pickerItemTextActive: {
        color: COLORS.accent,
        fontWeight: 'bold',
    },
});
