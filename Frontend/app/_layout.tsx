import { useEffect, useState } from 'react';
import { Stack, Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Suppress unhandled FontFaceObserver 6000ms timeouts on React Native Web
if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        const msg = event.reason?.message || event.reason?.toString() || '';
        if (msg.includes('6000ms timeout') || msg.includes('FontFaceObserver')) {
            event.preventDefault();
            console.warn('[Expo Web] Font observer timeout suppressed cleanly.');
        }
    });
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
        },
    },
});

function AppNavigator() {
    const [isReady, setIsReady] = useState(false);
    const hydrateUser = useAuthStore((s) => s.hydrate);
    const hydrateAdmin = useAdminAuthStore((s) => s.hydrate);

    useEffect(() => {
        async function prepareApp() {
            try {
                // Safely load Ionicons font assets
                await Font.loadAsync(Ionicons.font).catch(() => { });
            } catch (e) {
                // Ignore font loading timeouts
            } finally {
                await Promise.all([hydrateUser(), hydrateAdmin()]).finally(() => {
                    setIsReady(true);
                });
            }
        }
        prepareApp();
    }, []);

    if (!isReady) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#14B8A6" />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F8FAFC' },
                    animation: 'none',
                }}
            >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppNavigator />
        </QueryClientProvider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
