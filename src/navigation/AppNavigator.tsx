import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SurahDetailScreen } from '../screens/SurahDetailScreen';
import { RootStackParamList, BottomTabParamList } from '../types';
import { COLORS, SIZES } from '../constants/theme';

import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
    const { t } = useLanguage();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    elevation: 0, // removed elevation so it doesn't cast weird shadows from bottom
                    height: 85,
                    paddingTop: 10,
                },
                tabBarBackground: () => (
                    <BlurView
                        tint="dark"
                        intensity={100} // High intensity for liquid glass feel
                        style={[StyleSheet.absoluteFill, { borderTopWidth: 1, borderTopColor: 'rgba(212, 165, 116, 0.2)' }]}
                    />
                ),
                tabBarActiveTintColor: COLORS.accent,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                    marginTop: 4,
                },
            }}
        >
            <Tab.Screen
                name="Mushaf"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: focused ? 'rgba(212, 165, 116, 0.15)' : 'transparent',
                            borderRadius: 20,
                            padding: focused ? 6 : 0,
                            top: focused ? -2 : 0,
                        }}>
                            <Ionicons name={focused ? "book" : "book-outline"} size={focused ? size + 4 : size} color={color} />
                        </View>
                    ),
                    tabBarLabel: t('tabs.mushaf'),
                }}
            />
            <Tab.Screen
                name="Bookmarks"
                component={BookmarksScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: focused ? 'rgba(212, 165, 116, 0.15)' : 'transparent',
                            borderRadius: 20,
                            padding: focused ? 6 : 0,
                            top: focused ? -2 : 0,
                        }}>
                            <Ionicons name={focused ? "bookmark" : "bookmark-outline"} size={focused ? size + 4 : size} color={color} />
                        </View>
                    ),
                    tabBarLabel: t('tabs.bookmarks'),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: focused ? 'rgba(212, 165, 116, 0.15)' : 'transparent',
                            borderRadius: 20,
                            padding: focused ? 6 : 0,
                            top: focused ? -2 : 0,
                        }}>
                            <Ionicons name={focused ? "settings" : "settings-outline"} size={focused ? size + 4 : size} color={color} />
                        </View>
                    ),
                    tabBarLabel: t('tabs.settings'),
                }}
            />
        </Tab.Navigator>
    );
};

export const AppNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.bgDark,
                },
                headerTintColor: COLORS.textPrimary,
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: SIZES.fontLg,
                },
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: COLORS.bgDark,
                },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="Main"
                component={TabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SurahDetail"
                component={SurahDetailScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal', // Modal slides up like opening a book
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack.Navigator>
    );
};
