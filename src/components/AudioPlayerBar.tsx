import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Modal,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import { quranApi } from '../services/quranApi';
import { COLORS, SIZES } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { setSeekingFlag } from '../store/useAudioStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AudioPlayerBarProps {
    surahName?: string;
    bottomOffset?: number;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ surahName, bottomOffset = 0 }) => {
    const {
        isPlaying, isLoading, pauseAudio, resumeAudio, stopAudio,
        duration, position, currentSurah, selectedReciter, playAudio, seekTo, sound
    } = useAudio();
    const { t, language } = useLanguage();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [surahList, setSurahList] = React.useState<any[]>([]);
    const [showPicker, setShowPicker] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [barWidth, setBarWidth] = React.useState(0);
    const [fullBarWidth, setFullBarWidth] = React.useState(0);

    // Smooth seeking state
    const [isSeeking, setIsSeeking] = React.useState(false);
    const [seekDisplayPos, setSeekDisplayPos] = React.useState(0);

    // Refs so PanResponder always has current values
    const fullBarWidthRef = React.useRef(0);
    const durationRef = React.useRef(0);
    const barPageXRef = React.useRef(0);
    React.useEffect(() => { fullBarWidthRef.current = fullBarWidth; }, [fullBarWidth]);
    React.useEffect(() => { durationRef.current = duration; }, [duration]);

    // Bottom sheet animation for surah list
    const sheetAnim = React.useRef(new Animated.Value(0)).current;

    const formatTime = (millis: number) => {
        if (!millis || millis < 0) return '0:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Mini player tap seek
    const handleSeek = (event: any) => {
        if (barWidth > 0 && duration > 0) {
            const touchX = event.nativeEvent.locationX;
            const percentage = Math.max(0, Math.min(1, touchX / barWidth));
            const seekPosition = percentage * duration;
            seekTo(seekPosition);
        }
    };

    // PanResponder for smooth dragging on full-screen progress bar
    // Uses refs so the closure always gets current values
    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const bw = fullBarWidthRef.current;
                const dur = durationRef.current;
                if (bw > 0 && dur > 0) {
                    setIsSeeking(true);
                    setSeekingFlag(true);
                    barPageXRef.current = evt.nativeEvent.pageX - evt.nativeEvent.locationX;
                    const touchX = evt.nativeEvent.locationX;
                    const pct = Math.max(0, Math.min(1, touchX / bw));
                    setSeekDisplayPos(pct * dur);
                }
            },
            onPanResponderMove: (evt) => {
                const bw = fullBarWidthRef.current;
                const dur = durationRef.current;
                if (bw > 0 && dur > 0) {
                    const touchX = evt.nativeEvent.pageX - barPageXRef.current;
                    const pct = Math.max(0, Math.min(1, touchX / bw));
                    setSeekDisplayPos(pct * dur);
                }
            },
            onPanResponderRelease: (evt) => {
                const bw = fullBarWidthRef.current;
                const dur = durationRef.current;
                if (bw > 0 && dur > 0) {
                    const touchX = evt.nativeEvent.pageX - barPageXRef.current;
                    const pct = Math.max(0, Math.min(1, touchX / bw));
                    const finalPos = pct * dur;
                    seekTo(finalPos);
                }
                setIsSeeking(false);
                setSeekingFlag(false);
            },
        })
    ).current;

    // Load surah list once on mount
    React.useEffect(() => {
        quranApi.getSurahList().then(list => setSurahList(list)).catch(() => { });
    }, []);

    // Animate bottom sheet
    React.useEffect(() => {
        Animated.spring(sheetAnim, {
            toValue: showPicker ? 1 : 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
    }, [showPicker]);

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

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const navigateToSurah = () => {
        setIsExpanded(false);
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

    const displayPosition = isSeeking ? seekDisplayPos : position;
    const progressWidth = duration > 0 ? (displayPosition / duration) * 100 : 0;

    // Bottom sheet translate
    const sheetTranslate = sheetAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [SCREEN_HEIGHT * 0.65, 0],
    });

    return (
        <View style={[styles.outerContainer, { bottom: bottomOffset + (bottomOffset > 0 ? 0 : 10) }]}>
            {/* MINI PLAYER */}
            <BlurView intensity={100} tint="dark" style={styles.container}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleSeek}
                    style={styles.progressBar}
                    onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
                >
                    <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
                </TouchableOpacity>

                <View style={styles.content}>
                    <TouchableOpacity style={styles.iconBox} onPress={() => setShowPicker(true)}>
                        <Ionicons name="book" size={20} color={COLORS.bgDark} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.info} onPress={toggleExpand} activeOpacity={0.7}>
                        <Text style={styles.label} numberOfLines={1}>
                            {displaySurahName}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.subtext}>
                                {isLoading ? t('reader.loading') : (isPlaying ? t('player.nowPlaying') : t('reader.playFull'))}
                            </Text>
                            {duration > 0 && (
                                <Text style={styles.timeText}>
                                    {formatTime(displayPosition)} / {formatTime(duration)}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <View style={styles.controls}>
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

                        <TouchableOpacity onPress={stopAudio} style={styles.stopButton} activeOpacity={0.7}>
                            <Ionicons name="stop" size={22} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>

            {/* FULL SCREEN PLAYER */}
            <Modal
                visible={isExpanded}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={toggleExpand}
            >
                <BlurView intensity={100} tint="dark" style={styles.fullPlayerContainer}>
                    {/* Header */}
                    <View style={[styles.fullHeader, { paddingTop: insets.top + 20 }]}>
                        <TouchableOpacity onPress={toggleExpand} style={styles.dismissBtn}>
                            <Ionicons name="chevron-down" size={28} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <View style={styles.fullHeaderTitle}>
                            <Text style={styles.fullHeaderSub}>{t('player.nowPlaying')}</Text>
                            <Text style={styles.fullHeaderMain}>{displaySurahName}</Text>
                        </View>
                        <TouchableOpacity onPress={navigateToSurah} style={styles.dismissBtn}>
                            <Ionicons name="book-outline" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Cover Art — Quran Book Icon */}
                    <View style={styles.fullCoverArea}>
                        <View style={styles.fullCoverArt}>
                            <Text style={styles.coverArabicText}>القرآن</Text>
                            <Ionicons name="book" size={80} color={COLORS.bgDark} />
                            <View style={styles.fullCoverOverlay} />
                        </View>
                    </View>

                    {/* Info + List Button */}
                    <View style={styles.fullInfoArea}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fullSurahName}>{displaySurahName}</Text>
                            <Text style={styles.fullReciterName}>{selectedReciter.charAt(0).toUpperCase() + selectedReciter.slice(1)}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={styles.queueBtn}>
                            <Ionicons name="list" size={22} color={COLORS.accent} />
                        </TouchableOpacity>
                    </View>

                    {/* Smooth Draggable Progress Bar */}
                    <View style={styles.fullProgressArea}>
                        <View
                            style={styles.fullProgressBar}
                            onLayout={(e) => setFullBarWidth(e.nativeEvent.layout.width)}
                            {...panResponder.panHandlers}
                        >
                            <View style={[styles.fullProgressTrack]}>
                                <View style={[styles.fullProgressFill, { width: `${progressWidth}%` }]}>
                                    <View style={styles.fullProgressKnob} />
                                </View>
                            </View>
                        </View>
                        <View style={styles.fullTimeRow}>
                            <Text style={styles.fullTimeText}>{formatTime(displayPosition)}</Text>
                            <Text style={styles.fullTimeText}>{formatTime(duration)}</Text>
                        </View>
                    </View>

                    {/* Playback Controls */}
                    <View style={styles.fullControls}>
                        <TouchableOpacity onPress={handlePrev} style={styles.fullControlBtnSecondary}>
                            <Ionicons name="play-skip-back" size={32} color={COLORS.textPrimary} />
                        </TouchableOpacity>

                        {isLoading ? (
                            <ActivityIndicator size="large" color={COLORS.accent} />
                        ) : (
                            <TouchableOpacity
                                onPress={isPlaying ? pauseAudio : resumeAudio}
                                style={styles.fullControlBtnMain}
                            >
                                <Ionicons
                                    name={isPlaying ? 'pause' : 'play'}
                                    size={40}
                                    color={COLORS.bgDark}
                                    style={{ marginLeft: isPlaying ? 0 : 4 }}
                                />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={handleNext} style={styles.fullControlBtnSecondary}>
                            <Ionicons name="play-skip-forward" size={32} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.fullFooter}>
                        <TouchableOpacity onPress={stopAudio} style={styles.fullStopBtn}>
                            <Ionicons name="stop" size={24} color={COLORS.textSecondary} />
                            <Text style={styles.fullStopText}>{t('reader.stopRecitation')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* BOTTOM SHEET — Spotify-style Surah Queue */}
                    {showPicker && (
                        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                            {/* Dimmed overlay */}
                            <TouchableOpacity
                                style={styles.sheetOverlay}
                                activeOpacity={1}
                                onPress={() => setShowPicker(false)}
                            />
                            {/* Sheet */}
                            <Animated.View
                                style={[
                                    styles.sheetContainer,
                                    { transform: [{ translateY: sheetTranslate }], paddingBottom: insets.bottom + 10 },
                                ]}
                            >
                                {/* Drag handle */}
                                <View style={styles.sheetHandle} />

                                {/* Sheet Header */}
                                <View style={styles.sheetHeader}>
                                    <Text style={styles.sheetTitle}>{t('player.selection')}</Text>
                                    <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.sheetCloseBtn}>
                                        <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                {/* Surah List */}
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    style={styles.sheetList}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                >
                                    {surahList.map((s, idx) => {
                                        const num = idx + 1;
                                        const isActive = num === currentSurah;
                                        return (
                                            <TouchableOpacity
                                                key={num}
                                                style={[styles.sheetItem, isActive && styles.sheetItemActive]}
                                                onPress={() => jumpToSurah(num)}
                                                activeOpacity={0.6}
                                            >
                                                <View style={[styles.sheetItemNumber, isActive && styles.sheetItemNumberActive]}>
                                                    {isActive ? (
                                                        <Ionicons name="volume-medium" size={14} color={COLORS.accent} />
                                                    ) : (
                                                        <Text style={styles.sheetItemNumText}>{num}</Text>
                                                    )}
                                                </View>
                                                <View style={{ flex: 1, marginLeft: 14 }}>
                                                    <Text style={[styles.sheetItemName, isActive && styles.sheetItemNameActive]} numberOfLines={1}>
                                                        {language === 'ar' ? s.surahNameArabic : s.surahName}
                                                    </Text>
                                                    <Text style={styles.sheetItemSub}>
                                                        {language === 'ar' ? s.surahName : s.surahNameArabic}
                                                    </Text>
                                                </View>
                                                {isActive && (
                                                    <View style={styles.sheetNowPlayingBadge}>
                                                        <View style={styles.equalizerBar} />
                                                        <View style={[styles.equalizerBar, { height: 10 }]} />
                                                        <View style={[styles.equalizerBar, { height: 6 }]} />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </Animated.View>
                        </View>
                    )}
                </BlurView>
            </Modal>

            {/* SURAH PICKER (For Mini Player only) */}
            {!isExpanded && (
                <Modal
                    visible={showPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowPicker(false)}
                >
                    <View style={styles.miniPickerOverlay}>
                        <TouchableOpacity
                            style={styles.miniPickerDismiss}
                            activeOpacity={1}
                            onPress={() => setShowPicker(false)}
                        />
                        <BlurView intensity={100} tint="dark" style={[styles.miniPickerSheet, { paddingBottom: insets.bottom + 10 }]}>
                            <View style={styles.sheetHandle} />
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>{t('player.selection')}</Text>
                                <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.sheetCloseBtn}>
                                    <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={styles.sheetList}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            >
                                {surahList.map((s, idx) => {
                                    const num = idx + 1;
                                    const isActive = num === currentSurah;
                                    return (
                                        <TouchableOpacity
                                            key={num}
                                            style={[styles.sheetItem, isActive && styles.sheetItemActive]}
                                            onPress={() => jumpToSurah(num)}
                                            activeOpacity={0.6}
                                        >
                                            <View style={[styles.sheetItemNumber, isActive && styles.sheetItemNumberActive]}>
                                                {isActive ? (
                                                    <Ionicons name="volume-medium" size={14} color={COLORS.accent} />
                                                ) : (
                                                    <Text style={styles.sheetItemNumText}>{num}</Text>
                                                )}
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 14 }}>
                                                <Text style={[styles.sheetItemName, isActive && styles.sheetItemNameActive]} numberOfLines={1}>
                                                    {language === 'ar' ? s.surahNameArabic : s.surahName}
                                                </Text>
                                                <Text style={styles.sheetItemSub}>
                                                    {language === 'ar' ? s.surahName : s.surahNameArabic}
                                                </Text>
                                            </View>
                                            {isActive && (
                                                <View style={styles.sheetNowPlayingBadge}>
                                                    <View style={styles.equalizerBar} />
                                                    <View style={[styles.equalizerBar, { height: 10 }]} />
                                                    <View style={[styles.equalizerBar, { height: 6 }]} />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </BlurView>
                    </View>
                </Modal>
            )}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 20,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
    },
    progressFill: {
        height: 4,
        backgroundColor: COLORS.accent,
        borderRadius: 2,
    },
    timeText: {
        color: COLORS.textSecondary,
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
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    subtext: {
        color: COLORS.textSecondary,
        fontSize: 11,
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
    stopButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ===== Full Player =====
    fullPlayerContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    fullHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    dismissBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullHeaderTitle: {
        alignItems: 'center',
    },
    fullHeaderSub: {
        color: COLORS.textSecondary,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    fullHeaderMain: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '700',
        marginTop: 2,
    },
    fullCoverArea: {
        flex: 1,
        maxHeight: 300,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    fullCoverArt: {
        width: 220,
        height: 220,
        borderRadius: 28,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
    },
    coverArabicText: {
        fontSize: 28,
        color: COLORS.bgDark,
        fontWeight: '800',
        marginBottom: 4,
        opacity: 0.7,
    },
    fullCoverOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 28,
    },
    fullInfoArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    queueBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(212,165,116,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullSurahName: {
        fontSize: 26,
        color: COLORS.textPrimary,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    fullReciterName: {
        fontSize: 15,
        color: COLORS.accent,
        marginTop: 3,
        fontWeight: '500',
    },
    fullProgressArea: {
        width: '100%',
        marginBottom: 28,
    },
    fullProgressBar: {
        height: 30,
        justifyContent: 'center',
    },
    fullProgressTrack: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 3,
        overflow: 'visible',
    },
    fullProgressFill: {
        height: 6,
        backgroundColor: COLORS.accent,
        borderRadius: 3,
        position: 'relative',
    },
    fullProgressKnob: {
        position: 'absolute',
        right: -10,
        top: -7,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.textPrimary,
        borderWidth: 3,
        borderColor: COLORS.accent,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    fullTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    fullTimeText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    fullControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginBottom: 36,
    },
    fullControlBtnMain: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    fullControlBtnSecondary: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullFooter: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    fullStopBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 10,
    },
    fullStopText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },

    // ===== Bottom Sheet (Spotify-style queue) =====
    sheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.65,
        backgroundColor: '#111827',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    sheetHandle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    sheetTitle: {
        color: COLORS.textPrimary,
        fontWeight: '800',
        fontSize: 18,
    },
    sheetCloseBtn: {
        padding: 4,
    },
    sheetList: {
        flex: 1,
        paddingHorizontal: 12,
    },
    sheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginVertical: 1,
    },
    sheetItemActive: {
        backgroundColor: 'rgba(212, 165, 116, 0.08)',
    },
    sheetItemNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetItemNumberActive: {
        backgroundColor: 'rgba(212,165,116,0.15)',
    },
    sheetItemNumText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    sheetItemName: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    sheetItemNameActive: {
        color: COLORS.accent,
    },
    sheetItemSub: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    sheetNowPlayingBadge: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        marginLeft: 8,
    },
    equalizerBar: {
        width: 3,
        height: 14,
        borderRadius: 2,
        backgroundColor: COLORS.accent,
    },

    // ===== Mini Player Bottom Sheet =====
    miniPickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    miniPickerDismiss: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    miniPickerSheet: {
        height: SCREEN_HEIGHT * 0.6,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
});
