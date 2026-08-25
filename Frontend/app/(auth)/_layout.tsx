import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0F172A' },
                animation: 'none',
            }}
        >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="mode-select" />
            <Stack.Screen name="admin-login" />
        </Stack>
    );
}
