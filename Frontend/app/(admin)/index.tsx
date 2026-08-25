import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAdminAuthStore } from '../../stores/adminAuthStore';

export default function AdminDashboard() {
    const router = useRouter();
    const admin = useAdminAuthStore((s) => s.admin);
    const logout = useAdminAuthStore((s) => s.logout);

    const stats = [
        { icon: 'people', label: 'Candidates', value: '0', color: '#3B82F6' },
        { icon: 'briefcase', label: 'Vacancies', value: '0', color: '#22C55E' },
        { icon: 'git-branch', label: 'Pipeline', value: '0', color: '#F59E0B' },
        { icon: 'chatbubble', label: 'Inquiries', value: '0', color: '#EF4444' },
    ];

    const actions = [
        { icon: 'person-add', label: 'Add Candidate', route: '/(admin)/candidates' },
        { icon: 'add-circle', label: 'Post Vacancy', route: '/(admin)/vacancies' },
        { icon: 'document-text', label: 'Applications', route: '/(admin)/pipeline' },
        { icon: 'mail', label: 'Inquiries', route: '/(admin)/pipeline' },
        { icon: 'people-circle', label: 'Staff', route: '/(admin)/pipeline' },
        { icon: 'settings', label: 'Settings', route: '/(admin)/pipeline' },
    ];

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/welcome');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {admin?.firstName || 'Admin'}</Text>
                    <Text style={styles.orgName}>
                        {admin?.organization?.name || 'Agency Dashboard'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={Colors.gray400} />
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {stats.map((stat) => (
                    <View key={stat.label} style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                            <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                        </View>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.label}
                        style={styles.actionCard}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={action.icon as any} size={26} color={Colors.accent} />
                        <Text style={styles.actionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.primary },
    content: { padding: Spacing.lg, paddingTop: 60 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    greeting: { fontSize: 16, color: Colors.gray400 },
    orgName: { fontSize: 22, fontWeight: '800', color: Colors.white, marginTop: 4 },
    logoutBtn: { padding: 8 },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    statCard: {
        width: '48%',
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray700,
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statValue: { fontSize: 24, fontWeight: '800', color: Colors.white },
    statLabel: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.white,
        marginBottom: Spacing.md,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    actionCard: {
        width: '31%',
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.gray700,
    },
    actionLabel: {
        fontSize: 11,
        color: Colors.gray300,
        fontWeight: '600',
        textAlign: 'center',
    },
});
