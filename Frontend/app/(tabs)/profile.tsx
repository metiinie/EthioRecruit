import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';

export default function ProfileScreen() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const mode = useAuthStore((s) => s.mode);
    const setAuth = useAuthStore((s) => s.setAuth);
    const logout = useAuthStore((s) => s.logout);

    const isJobSeeker = mode === 'JOB_SEEKER';

    const handleModeSwitch = async () => {
        const newMode = isJobSeeker ? 'EMPLOYER' : 'JOB_SEEKER';
        try {
            const response = await authService.switchMode(newMode as any);
            setAuth(response.data.user, response.data.token);
        } catch {
            // Fallback: switch locally
            useAuthStore.getState().setMode(newMode as any);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/(auth)/welcome');
                },
            },
        ]);
    };

    const menuItems = [
        { icon: 'bookmark-outline', label: 'Saved', onPress: () => { } },
        { icon: 'chatbubbles-outline', label: 'Messages', onPress: () => { } },
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => { } },
        { icon: 'business-outline', label: 'Agencies', onPress: () => { } },
        { icon: 'settings-outline', label: 'Settings', onPress: () => { } },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                        {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                    </Text>
                </View>
                <Text style={styles.name}>
                    {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.phone}>{user?.phone}</Text>

                {/* Mode Toggle */}
                <TouchableOpacity style={styles.modeToggle} onPress={handleModeSwitch}>
                    <Ionicons
                        name={isJobSeeker ? 'search' : 'people'}
                        size={16}
                        color={Colors.accent}
                    />
                    <Text style={styles.modeText}>
                        {isJobSeeker ? 'Job Seeker' : 'Employer'}
                    </Text>
                    <Ionicons name="swap-horizontal" size={16} color={Colors.accent} />
                </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuCard}>
                {menuItems.map((item, i) => (
                    <TouchableOpacity
                        key={item.label}
                        style={[styles.menuItem, i < menuItems.length - 1 && styles.menuBorder]}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuLeft}>
                            <Ionicons name={item.icon as any} size={22} color={Colors.gray600} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color={Colors.error} />
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.lg, paddingTop: 60 },
    profileHeader: { alignItems: 'center', marginBottom: Spacing.xl },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: Colors.white },
    name: { fontSize: 22, fontWeight: '800', color: Colors.gray900 },
    phone: { fontSize: 14, color: Colors.gray500, marginTop: 4 },
    modeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BorderRadius.full,
        marginTop: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    modeText: { fontSize: 14, fontWeight: '600', color: Colors.accent },
    menuCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 18,
    },
    menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    menuLabel: { fontSize: 16, color: Colors.gray700, fontWeight: '500' },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    logoutText: { fontSize: 16, fontWeight: '600', color: Colors.error },
});
