import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const styles = StyleSheet.create({
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
