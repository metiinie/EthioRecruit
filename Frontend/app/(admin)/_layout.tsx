import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminAuthStore } from '../../stores/adminAuthStore';

export default function AdminLayout() {
    const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);

    // Security Route Guard: If not authenticated as Admin, redirect immediately to Admin Login
    if (!isAdminAuthenticated) {
        return <Redirect href="/(auth)/admin-login" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0B2524', // Rich Deep Emerald-Navy Blue brand background
                    borderTopWidth: 2,
                    borderTopColor: '#10B981', // Brand Emerald Green top accent line
                    height: 66,
                    paddingBottom: 10,
                    paddingTop: 8,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                },
                tabBarActiveTintColor: '#10B981', // Vibrant Emerald Green active icon & text
                tabBarInactiveTintColor: '#94A3B8', // Clean slate inactive tab text
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '800',
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="candidates"
                options={{
                    title: 'Candidates',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="vacancies"
                options={{
                    title: 'Vacancies',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="briefcase-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pipeline"
                options={{
                    title: 'Pipeline',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="git-branch-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="staff"
                options={{
                    title: 'Staff',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="candidates/new"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="vacancies/new"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
