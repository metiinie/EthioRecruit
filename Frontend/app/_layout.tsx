import { useEffect, useState } from 'react';
import { Stack, Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';

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
        Promise.all([hydrateUser(), hydrateAdmin()]).finally(() => {
            setIsReady(true);
        });
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
