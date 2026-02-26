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
import { styles } from '../styles/SurahDetailScreen.styles';

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

    // Use route params as initial value
    const [activeSurahNo, setActiveSurahNo] = useState(surahNo);

    // Track previous currentSurah to distinguish "player skipped" from "component mounted while something was playing"
    const prevCurrentSurahRef = React.useRef(currentSurah);

    // Reset activeSurahNo when route params change (user navigated to a different surah from list)
    useEffect(() => {
        setActiveSurahNo(surahNo);
    }, [surahNo]);

    // Only sync with player when currentSurah actually CHANGES (user hit skip next/prev)
    // NOT on initial mount when an old surah might still be playing
    useEffect(() => {
        if (
            currentSurah &&
            currentSurah !== prevCurrentSurahRef.current &&
            currentSurah !== activeSurahNo
        ) {
            setActiveSurahNo(currentSurah);
        }
        prevCurrentSurahRef.current = currentSurah;
    }, [currentSurah]);

    const loadSurah = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await quranApi.getSurah(activeSurahNo);
            setSurahData(data);
        } catch (err) {
            setError(t('connectionError'));
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
                                    <Text style={[styles.toggleText, languageMode === 'both' && styles.toggleTextActive]}>{t('reader.both')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, languageMode === 'english' && styles.toggleBtnActive]}
                                    onPress={() => setLanguageMode('english')}
                                >
                                    <Text style={[styles.toggleText, languageMode === 'english' && styles.toggleTextActive]}>{t('reader.english')}</Text>
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
                <Text style={styles.errorText}>{error || t('somethingWrong')}</Text>
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
            <AudioPlayerBar />
        </View>
    );
};


