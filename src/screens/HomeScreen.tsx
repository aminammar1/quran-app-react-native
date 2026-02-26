import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    StatusBar,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SurahCard } from '../components/SurahCard';
import { ReciterPicker } from '../components/ReciterPicker';
import { quranApi } from '../services/quranApi';
import { SurahInfo, ReciterMap, RootStackParamList } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../styles/HomeScreen.styles';
import { normalizeArabic } from '../hooks/useArabicUtils';

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
            setError(t('connectionError'));
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

        // Normalize query: remove "سورة" if it exists at the start
        const cleanQuery = searchQuery.replace(/^سورة\s+/g, '').replace(/\s+سورة$/g, '').trim();
        const qAr = normalizeArabic(cleanQuery);
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
            <BlurView intensity={20} tint="light" style={styles.searchContainer}>
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
            </BlurView>

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
                    {t('tapToRetry')}
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
                        <Text style={styles.emptyText}>{t('noSurahsFound')}</Text>
                    </View>
                }
            />
        </View>
    );
};


