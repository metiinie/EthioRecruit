import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { useAuthStore } from '../../stores/authStore';

export default function TabLayout() {
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0F172A', // Deep Slate Navy brand background
                    borderTopWidth: 2,
                    borderTopColor: '#14B8A6', // Brand Teal top accent line
                    height: 66,
                    paddingBottom: 10,
                    paddingTop: 8,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                },
                tabBarActiveTintColor: '#14B8A6', // Vibrant Teal active icon & text
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
