import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

export const SettingsScreen: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
            <Text style={styles.headerTitle}>{t('settings.title')}</Text>

            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>{t('settings.language')}</Text>

                <View style={styles.optionsRow}>
                    <TouchableOpacity
                        style={[styles.optionBtn, language === 'ar' && styles.optionBtnActive]}
                        onPress={() => setLanguage('ar')}
                    >
                        <Text style={[styles.optionText, language === 'ar' && styles.optionTextActive]}>
                            {t('settings.arabic')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionBtn, language === 'en' && styles.optionBtnActive]}
                        onPress={() => setLanguage('en')}
                    >
                        <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>
                            {t('settings.english')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgDark,
        paddingTop: SIZES.xxl,
        paddingHorizontal: SIZES.lg,
    },
    headerTitle: {
        fontSize: SIZES.fontXxl,
        color: COLORS.textPrimary,
        fontWeight: '700',
        marginBottom: SIZES.xl,
        marginTop: SIZES.lg,
    },
    settingsSection: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SIZES.lg,
    },
    sectionTitle: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
        marginBottom: SIZES.md,
        fontWeight: '600',
    },
    optionsRow: {
        flexDirection: 'row',
        gap: SIZES.md,
    },
    optionBtn: {
        flex: 1,
        paddingVertical: SIZES.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.divider,
        backgroundColor: COLORS.bgDark,
    },
    optionBtnActive: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    optionText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: SIZES.fontSm,
    },
    optionTextActive: {
        color: COLORS.bgDark,
    },
});
