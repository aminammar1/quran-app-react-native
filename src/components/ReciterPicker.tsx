import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';

interface ReciterPickerProps {
    reciters: Record<string, string>;
}

export const ReciterPicker: React.FC<ReciterPickerProps> = ({ reciters }) => {
    const [visible, setVisible] = useState(false);
    const { selectedReciter, setSelectedReciter, currentSurah, playAudio } = useAudio();
    const { t } = useLanguage();

    const reciterEntries = Object.entries(reciters);
    const currentReciterName = reciters[selectedReciter] || t('reciter.select');

    const handleSelect = async (id: string) => {
        setSelectedReciter(id);
        setVisible(false);

        // AUTO-RESET: if a surah is already selected, restart with the new reciter
        if (currentSurah) {
            const { quranApi } = await import('../services/quranApi');
            const url = quranApi.getChapterAudioUrl(currentSurah, id);
            await playAudio(url, currentSurah);
        }
    };

    return (
        <>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Ionicons name="mic-outline" size={16} color={COLORS.accent} />
                <Text style={styles.triggerText} numberOfLines={1}>
                    {currentReciterName}
                </Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('reciter.choose')}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={reciterEntries}
                            keyExtractor={([id]) => id}
                            renderItem={({ item: [id, name] }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.reciterItem,
                                        selectedReciter === id && styles.reciterItemActive,
                                    ]}
                                    onPress={() => handleSelect(id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.reciterInfo}>
                                        <Ionicons
                                            name={selectedReciter === id ? 'radio-button-on' : 'radio-button-off'}
                                            size={20}
                                            color={selectedReciter === id ? COLORS.accent : COLORS.textMuted}
                                        />
                                        <Text
                                            style={[
                                                styles.reciterName,
                                                selectedReciter === id && styles.reciterNameActive,
                                            ]}
                                        >
                                            {name}
                                        </Text>
                                    </View>
                                    {selectedReciter === id && (
                                        <Ionicons name="checkmark" size={18} color={COLORS.accent} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgElevated,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SIZES.xs,
        maxWidth: 200,
    },
    triggerText: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontSm,
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.xl,
    },
    modal: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        width: '100%',
        maxWidth: 360,
        maxHeight: 400,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    modalTitle: {
        fontSize: SIZES.fontLg,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    reciterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    reciterItemActive: {
        backgroundColor: 'rgba(212, 165, 116, 0.08)',
    },
    reciterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.md,
    },
    reciterName: {
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
    },
    reciterNameActive: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
});
