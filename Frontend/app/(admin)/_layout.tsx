import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';

export default function AdminLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.primary,
                    borderTopWidth: 0,
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: Colors.accent,
                tabBarInactiveTintColor: Colors.gray500,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="candidates"
                options={{
                    title: 'Candidates',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="vacancies"
                options={{
                    title: 'Vacancies',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="briefcase" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pipeline"
                options={{
                    title: 'Pipeline',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="git-branch" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="staff"
                options={{
                    title: 'Staff',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-circle" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
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
