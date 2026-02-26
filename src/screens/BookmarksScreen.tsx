import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

export const BookmarksScreen: React.FC = () => {
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="bookmark-outline" size={56} color={COLORS.textMuted} />
                </View>
                <Text style={styles.title}>{t('bookmarks.title')}</Text>
                <Text style={styles.subtitle}>
                    {t('bookmarks.description')}
                </Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t('bookmarks.comingSoon')}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgDark,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.xl,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.lg,
    },
    title: {
        fontSize: SIZES.fontXxl,
        color: COLORS.textPrimary,
        fontWeight: '700',
        marginBottom: SIZES.sm,
    },
    subtitle: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SIZES.lg,
    },
    badge: {
        backgroundColor: COLORS.bgElevated,
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
        borderWidth: 1,
        borderColor: COLORS.dividerGold,
    },
    badgeText: {
        color: COLORS.accent,
        fontSize: SIZES.fontSm,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});
