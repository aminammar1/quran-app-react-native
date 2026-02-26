import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

interface BismillahProps {
    show?: boolean;
}

export const Bismillah: React.FC<BismillahProps> = ({ show = true }) => {
    if (!show) return null;

    return (
        <View style={styles.container}>
            <View style={styles.ornamentLeft} />
            <Text style={styles.text}>{BISMILLAH}</Text>
            <View style={styles.ornamentRight} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: SIZES.lg,
        paddingHorizontal: SIZES.md,
        marginBottom: SIZES.md,
    },
    text: {
        fontSize: SIZES.fontBismillah,
        color: COLORS.accent,
        fontFamily: 'Amiri',
        textAlign: 'center',
        lineHeight: 52,
        letterSpacing: 1,
    },
    ornamentLeft: {
        width: 120,
        height: 1,
        backgroundColor: COLORS.dividerGold,
        marginBottom: SIZES.sm,
    },
    ornamentRight: {
        width: 120,
        height: 1,
        backgroundColor: COLORS.dividerGold,
        marginTop: SIZES.sm,
    },
});
