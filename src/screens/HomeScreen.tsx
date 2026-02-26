import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SurahCard } from '../components/SurahCard';
import { ReciterPicker } from '../components/ReciterPicker';
import { quranApi } from '../services/quranApi';
import { SurahInfo, ReciterMap, RootStackParamList } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { t, language } = useLanguage();
    const insets = useSafeAreaInsets();
    const [surahs, setSurahs] = useState<SurahInfo[]>([]);
    const [reciters, setReciters] = useState<ReciterMap>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = useCallback(async () => {
        try {
            setError(null);
            const [surahData, reciterData] = await Promise.all([
                quranApi.getSurahList(),
                quranApi.getReciters(language as 'en' | 'ar'),
            ]);
            setSurahs(surahData);
            setReciters(reciterData);
        } catch (err) {
            setError('Unable to load Quran data. Please check your connection.');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [language]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        quranApi.clearCache();
        loadData();
    }, [loadData]);

    const filteredSurahs = surahs.filter((surah, index) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();

        const normalizeArabic = (text: string) => {
            return text
                .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Remove all possible Quranic tashkeel/diacritics
                .replace(/[إأآاٱ]/g, 'ا') // Normalize Alif forms
                .replace(/ة/g, 'ه') // Normalize Teh Marbuta to Heh
                .replace(/ى/g, 'ي'); // Normalize Alef Maksura to Yeh
        };

        const qAr = normalizeArabic(searchQuery);
        const nameAr = normalizeArabic(surah.surahNameArabic);

        return (
            surah.surahName.toLowerCase().includes(q) ||
            surah.surahNameTranslation.toLowerCase().includes(q) ||
            nameAr.includes(qAr) ||
            (index + 1).toString() === q
        );
    });

    const handleSurahPress = (surah: SurahInfo, index: number) => {
        const surahNo = index + 1;
        // We need the original index for surahNo
        const originalIndex = surahs.indexOf(surah);
        navigation.navigate('SurahDetail', {
            surahNo: originalIndex + 1,
            surahName: surah.surahName,
            surahNameArabic: surah.surahNameArabic,
        });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Title Area */}
            <View style={styles.titleArea}>
                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.titleArabic}>{t('appTitleArabic')}</Text>
                        <Text style={styles.titleEnglish}>{t('appTitle')}</Text>
                    </View>
                    <ReciterPicker reciters={reciters} />
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color={COLORS.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('searchPlaceholder')}
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                />
                {searchQuery.length > 0 ? (
                    <Ionicons
                        name="close-circle"
                        size={18}
                        color={COLORS.textMuted}
                        onPress={() => setSearchQuery('')}
                    />
                ) : (
                    <Ionicons
                        name="mic"
                        size={18}
                        color={COLORS.textPrimary}
                        style={{ opacity: 0.8 }}
                    />
                )}
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionTitle}>
                    {searchQuery ? `${t('results')} (${filteredSurahs.length})` : t('surahsCount')}
                </Text>
                <View style={styles.sectionLine} />
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.loadingText}>{t('loading')}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
                <Ionicons name="cloud-offline" size={48} color={COLORS.textMuted} />
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.retryText} onPress={loadData}>
                    Tap to retry
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
            <LinearGradient
                colors={['#0A1628', '#132845', '#0A1628']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* Soft decorative glow behind the list */}
            <View style={styles.glowTop} />
            <View style={styles.glowBottom} />

            <FlatList
                contentContainerStyle={[styles.listContent, { paddingTop: insets.top }]}
                data={filteredSurahs}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <SurahCard
                        surah={item}
                        index={surahs.indexOf(item)}
                        onPress={() => handleSurahPress(item, index)}
                    />
                )}
                ListHeaderComponent={renderHeader()}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.accent}
                        colors={[COLORS.accent]}
                        progressBackgroundColor={COLORS.bgCard}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search" size={40} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>No surahs found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgDark,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: COLORS.bgDark,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SIZES.md,
    },
    loadingText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
        marginTop: SIZES.sm,
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
    header: {
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.sm,
    },
    titleArea: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleArabic: {
        fontSize: 32,
        color: COLORS.accent,
        fontFamily: 'Amiri',
        marginBottom: 2,
    },
    titleEnglish: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(22, 34, 54, 0.4)',
        marginHorizontal: SIZES.lg,
        borderRadius: SIZES.radiusLg,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.md,
        borderWidth: 1,
        borderColor: 'rgba(212, 165, 116, 0.2)',
        gap: SIZES.sm,
        marginBottom: SIZES.lg,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: SIZES.fontMd,
        paddingVertical: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.sm,
        gap: SIZES.md,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.divider,
    },
    sectionTitle: {
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    listContent: {
        paddingBottom: 250, // Huge padding to freely scroll past floating elements
    },
    glowTop: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(212, 165, 116, 0.08)',
        // Shadow/glow properties
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 100,
        elevation: 0,
    },
    glowBottom: {
        position: 'absolute',
        bottom: -150,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        shadowColor: COLORS.primaryLight,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.xxl * 2,
        gap: SIZES.md,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontMd,
    },
});
