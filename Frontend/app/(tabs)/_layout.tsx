import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { useAuthStore } from '../../stores/authStore';

import { CustomTabBar } from '../../components/CustomTabBar';

export default function TabLayout() {
    const mode = useAuthStore((s) => s.mode);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isJobSeeker = mode === 'JOB_SEEKER';

    // Route guard: redirect unauthenticated users to Welcome/Login
    if (!isAuthenticated) {
        return <Redirect href="/(auth)/welcome" />;
    }

    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="browse"
                options={{
                    title: isJobSeeker ? 'Jobs' : 'Candidates',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name={isJobSeeker ? 'briefcase-outline' : 'people-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: 'Saved',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bookmark-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="activity"
                options={{
                    title: isJobSeeker ? 'Applications' : 'Inquiries',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubbles-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-circle-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
