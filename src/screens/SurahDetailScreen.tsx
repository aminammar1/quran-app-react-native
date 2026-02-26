import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AyahCard } from '../components/AyahCard';
import { Bismillah } from '../components/Bismillah';
import { AudioPlayerBar } from '../components/AudioPlayerBar';
import { quranApi } from '../services/quranApi';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import { SurahDetail, RootStackParamList } from '../types';
import { COLORS, SIZES } from '../constants/theme';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'SurahDetail'>;
    route: RouteProp<RootStackParamList, 'SurahDetail'>;
};

type LanguageMode = 'both' | 'arabic' | 'english';

export const SurahDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { t, language } = useLanguage();
    const { surahNo, surahName, surahNameArabic } = route.params;
    const [surahData, setSurahData] = useState<SurahDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [languageMode, setLanguageMode] = useState<LanguageMode>(language === 'ar' ? 'arabic' : 'both');
    const { selectedReciter, playAudio, isPlaying, currentSurah, stopAudio } = useAudio();
    const insets = useSafeAreaInsets(); // Essential for modern iPhones

    // Use route params as initial fallback, but prefer the global audio state's currentSurah if it changes
    // This allows the screen to "follow" the audio player when hitting Next/Previous
    const [activeSurahNo, setActiveSurahNo] = useState(surahNo);

    // Update active surah if player skips to a different one via navigation
    useEffect(() => {
        if (currentSurah && currentSurah !== activeSurahNo && isPlaying) {
            setActiveSurahNo(currentSurah);
        }
    }, [currentSurah, isPlaying]);

    const loadSurah = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await quranApi.getSurah(activeSurahNo);
            setSurahData(data);
        } catch (err) {
            setError('Unable to load surah. Please try again.');
            console.error('Error loading surah:', err);
        } finally {
            setLoading(false);
        }
    }, [activeSurahNo]);

    useEffect(() => {
        loadSurah();
    }, [loadSurah]);

    const handlePlayFullSurah = async () => {
        if (isPlaying && currentSurah === activeSurahNo) {
            await stopAudio();
            return;
        }

        const url = quranApi.getChapterAudioUrl(activeSurahNo, selectedReciter);
        await playAudio(url, activeSurahNo);
    };

    const showBismillah = activeSurahNo !== 1 && activeSurahNo !== 9;

    const renderHeader = () => {
        // Fallback names if data is loading, else use the loaded data's actual name
        const displayName = surahData ? surahData.surahName : surahName;
        const displayNameAr = surahData ? surahData.surahNameArabic : surahNameArabic;

        return (
            <View style={styles.surahHeader}>
                {/* Header controls layout incorporating Back Button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: SIZES.lg, marginBottom: SIZES.md }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-down" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                </View>

                <View style={styles.surahHeaderContainer}>
                    {/* Glow drop behind header */}
                    <View style={styles.headerGlowTop} />

                    <LinearGradient
                        colors={['rgba(212, 165, 116, 0.1)', 'rgba(212, 165, 116, 0.0)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.pageHeaderGradientBorder}
                    >
                        <BlurView intensity={25} tint="dark" style={styles.pageHeader}>
                            <View style={[styles.cornerBox, styles.cbTopLeft]} />
                            <View style={[styles.cornerBox, styles.cbTopRight]} />

                            <Text style={styles.surahNameArabic}>{language === 'ar' ? displayNameAr : displayName}</Text>

                            <View style={styles.togglesContainer}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, languageMode === 'arabic' && styles.toggleBtnActive]}
                                    onPress={() => setLanguageMode('arabic')}
                                >
                                    <Text style={[styles.toggleText, languageMode === 'arabic' && styles.toggleTextActive]}>{t('settings.arabic')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, languageMode === 'both' && styles.toggleBtnActive]}
                                    onPress={() => setLanguageMode('both')}
                                >
                                    <Text style={[styles.toggleText, languageMode === 'both' && styles.toggleTextActive]}>Both</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, languageMode === 'english' && styles.toggleBtnActive]}
                                    onPress={() => setLanguageMode('english')}
                                >
                                    <Text style={[styles.toggleText, languageMode === 'english' && styles.toggleTextActive]}>EN</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity activeOpacity={0.8} onPress={handlePlayFullSurah}>
                                <LinearGradient
                                    colors={
                                        isPlaying && currentSurah === activeSurahNo
                                            ? ['#E76F51', '#E76F51']
                                            : [COLORS.accent, COLORS.accentMuted]
                                    }
                                    style={styles.playButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Ionicons name={isPlaying && currentSurah === activeSurahNo ? 'stop' : 'play'} size={18} color={COLORS.bgDark} />
                                    <Text style={styles.playButtonText}>
                                        {isPlaying && currentSurah === activeSurahNo ? t('reader.stopRecitation') : t('reader.playFull')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={[styles.cornerBox, styles.cbBottomLeft]} />
                            <View style={[styles.cornerBox, styles.cbBottomRight]} />
                        </BlurView>
                    </LinearGradient>
                </View>

                <Bismillah show={showBismillah} />
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSurah} />
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.loadingText}>{t('reader.loading')}</Text>
            </View>
        );
    }

    if (error || !surahData) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSurah} />
                <Ionicons name="alert-circle" size={48} color={COLORS.textMuted} />
                <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
                <Text style={styles.retryText} onPress={loadSurah}>{t('tapToRetry')}</Text>
            </View>
        );
    }

    const ayahs = surahData.arabic1.map((arabic, index) => ({
        ayahNumber: index + 1,
        arabicText: arabic,
        englishText: surahData.english[index] || '',
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A1628', '#132845', '#0A1628']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
            <View style={styles.glowBgLeft} />
            <View style={[styles.mushafPageBorder, { paddingBottom: insets.bottom }]}>
                <FlatList
                    data={ayahs}
                    keyExtractor={(item) => item.ayahNumber.toString()}
                    renderItem={({ item }) => {
                        // Using the EveryAyah fallback format for verse-specific audio since full chapters use mp3quran
                        // Pad numbers for URLs: "002001"
                        const pS = activeSurahNo.toString().padStart(3, '0');
                        const pA = item.ayahNumber.toString().padStart(3, '0');
                        let reciterUrlPath = 'Alafasy_128kbps';
                        // Special exceptions for Sudais/Bader if available on Everyayah
                        if (selectedReciter === 'yasser') reciterUrlPath = 'Yasser_Ad-Dussary_128kbps';
                        if (selectedReciter === 'fares') reciterUrlPath = 'Fares_Abbad_64kbps';
                        if (selectedReciter === 'sudais') reciterUrlPath = 'Abdurrahmaan_As-Sudais_192kbps';
                        // if bader, EveryAyah doesn't seem to have him, fallback Alafasy
                        if (selectedReciter === 'bader') reciterUrlPath = 'Alafasy_128kbps';

                        const verseAudioUrl = `https://everyayah.com/data/${reciterUrlPath}/${pS}${pA}.mp3`;

                        return (
                            <AyahCard
                                ayahNumber={item.ayahNumber}
                                arabicText={item.arabicText}
                                englishText={item.englishText}
                                surahNo={activeSurahNo}
                                languageMode={languageMode}
                                audioUrl={verseAudioUrl}
                            />
                        );
                    }}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            </View>
            <AudioPlayerBar surahName={surahName} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgSurah, // A dark navy/black background indicating behind the page
    },
    mushafPageBorder: {
        flex: 1,
        margin: 8,
        backgroundColor: 'transparent',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 165, 116, 0.1)',
        overflow: 'hidden',
    },
    centerContainer: {
        flex: 1,
        backgroundColor: COLORS.bgSurah,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SIZES.md,
    },
    loadingText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
    },
    errorText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
        textAlign: 'center',
        paddingHorizontal: SIZES.xl,
    },
    retryText: {
        color: COLORS.accent,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
    surahHeader: {
        paddingTop: SIZES.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    surahHeaderContainer: {
        position: 'relative',
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.md,
    },
    pageHeaderGradientBorder: {
        borderRadius: SIZES.radiusLg,
        padding: 1,
    },
    pageHeader: {
        borderRadius: SIZES.radiusLg,
        backgroundColor: 'rgba(22, 34, 54, 0.45)', // very glassy backdrop
        padding: SIZES.xl,
        position: 'relative',
        alignItems: 'center',
        overflow: 'hidden',
    },
    headerGlowTop: {
        position: 'absolute',
        top: -60,
        left: 20,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(212, 165, 116, 0.1)',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 100,
        elevation: 0,
        zIndex: -1,
    },
    glowBgLeft: {
        position: 'absolute',
        bottom: 100,
        left: -150,
        width: 350,
        height: 350,
        borderRadius: 175,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        shadowColor: COLORS.primaryLight,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 100,
        zIndex: -1,
    },
    surahNameArabic: {
        fontSize: 40,
        color: COLORS.accent,
        fontFamily: 'Amiri',
        marginBottom: SIZES.lg,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm + 4,
        borderRadius: SIZES.radiusFull,
        gap: SIZES.sm,
        // glow
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    playButtonText: {
        color: COLORS.bgDark,
        fontSize: SIZES.fontSm,
        fontWeight: '700',
    },
    togglesContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(22, 34, 54, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(212, 165, 116, 0.2)',
        borderRadius: SIZES.radiusFull,
        padding: 4,
        marginBottom: SIZES.xl,
    },
    toggleBtn: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: 8,
        borderRadius: SIZES.radiusFull,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.accent,
    },
    toggleText: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: COLORS.bgDark,
    },
    // Decorative corners
    cornerBox: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: COLORS.dividerGold,
    },
    cbTopLeft: { top: 4, left: 4, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 },
    cbTopRight: { top: 4, right: 4, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 },
    cbBottomLeft: { bottom: 4, left: 4, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 },
    cbBottomRight: { bottom: 4, right: 4, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 },
    listContent: {
        paddingBottom: 250, // Huge padding to freely scroll past floating player
    },
});
