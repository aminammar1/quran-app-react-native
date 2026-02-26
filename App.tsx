import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AudioProvider } from './src/context/AudioContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AudioPlayerBar } from './src/components/AudioPlayerBar';
import { COLORS, SIZES } from './src/constants/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const TAB_BAR_HEIGHT = 85;

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const fadeAnim = React.useRef(new Animated.Value(1)).current;
    const navigationRef = useNavigationContainerRef();
    const [currentRoute, setCurrentRoute] = useState<string | undefined>('Main');

    const handleStateChange = () => {
        const route = navigationRef.getCurrentRoute();
        setCurrentRoute(route?.name);
    };

    // Player sits above tab bar when tabs are visible, at bottom otherwise
    const playerBottomOffset = currentRoute === 'SurahDetail' ? 0 : TAB_BAR_HEIGHT;

    useEffect(() => {
        async function prepare() {
            try {
                // Load fonts
                await Font.loadAsync({
                    'Amiri': require('./assets/fonts/Amiri-Regular.ttf'),
                    'Amiri-Bold': require('./assets/fonts/Amiri-Bold.ttf'),
                });
            } catch (e) {
                console.warn('Font loading error:', e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
            // Animate splash away
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }).start(() => {
                    setShowSplash(false);
                });
            }, 800);
        }
    }, [appIsReady, fadeAnim]);

    if (!appIsReady) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <AudioProvider>
                <LanguageProvider>
                    <View style={styles.root} onLayout={onLayoutRootView}>
                        <NavigationContainer
                            ref={navigationRef}
                            onStateChange={handleStateChange}
                            theme={{
                                dark: true,
                                colors: {
                                    primary: COLORS.accent,
                                    background: COLORS.bgDark,
                                    card: COLORS.bgCard,
                                    text: COLORS.textPrimary,
                                    border: COLORS.border,
                                    notification: COLORS.accent,
                                },
                                fonts: {
                                    regular: { fontFamily: 'System', fontWeight: '400' },
                                    medium: { fontFamily: 'System', fontWeight: '500' },
                                    bold: { fontFamily: 'System', fontWeight: '700' },
                                    heavy: { fontFamily: 'System', fontWeight: '800' },
                                },
                            }}
                        >
                            <AppNavigator />
                            {/* Global floating audio player — persists across all screens */}
                            <AudioPlayerBar bottomOffset={playerBottomOffset} />
                        </NavigationContainer>

                        {/* Custom Splash Overlay */}
                        {showSplash && (
                            <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
                                <View style={styles.splashContent}>
                                    <View style={styles.splashIconContainer}>
                                        <Text style={styles.splashIcon}>📖</Text>
                                    </View>
                                    <Text style={styles.splashArabic}>القرآن الكريم</Text>
                                    <Text style={styles.splashEnglish}>Quran Mushaf</Text>
                                    <View style={styles.splashDivider} />
                                    <Text style={styles.splashSubtext}>
                                        Read • Listen • Reflect
                                    </Text>
                                </View>
                            </Animated.View>
                        )}

                        <StatusBar style="light" />
                    </View>
                </LanguageProvider>
            </AudioProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.bgDark,
    },
    splash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.bgDark,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    splashContent: {
        alignItems: 'center',
    },
    splashIconContainer: {
        width: 100,
        height: 100,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.bgElevated,
        borderWidth: 2,
        borderColor: COLORS.dividerGold,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.xl,
    },
    splashIcon: {
        fontSize: 48,
    },
    splashArabic: {
        fontSize: 42,
        color: COLORS.accent,
        fontFamily: 'Amiri',
        marginBottom: SIZES.xs,
    },
    splashEnglish: {
        fontSize: SIZES.fontLg,
        color: COLORS.textPrimary,
        fontWeight: '300',
        letterSpacing: 4,
        textTransform: 'uppercase',
        marginBottom: SIZES.lg,
    },
    splashDivider: {
        width: 60,
        height: 1,
        backgroundColor: COLORS.dividerGold,
        marginBottom: SIZES.lg,
    },
    splashSubtext: {
        fontSize: SIZES.fontSm,
        color: COLORS.textMuted,
        letterSpacing: 3,
    },
});
