import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';

export default function HomeScreen() {
    const user = useAuthStore((s) => s.user);
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        Welcome back, {user?.firstName || 'User'} 👋
                    </Text>
                    <Text style={styles.modeLabel}>
                        {isJobSeeker ? 'Looking for work' : 'Hiring talent'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.notifButton}>
                    <Ionicons name="notifications-outline" size={24} color={Colors.gray600} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={Colors.gray400} />
                <Text style={styles.searchPlaceholder}>
                    {isJobSeeker ? 'Search jobs by country, title...' : 'Search candidates by skill, country...'}
                </Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                {(isJobSeeker
                    ? [
                        { icon: 'briefcase', label: 'Active Jobs', value: '0' },
                        { icon: 'document-text', label: 'Applications', value: '0' },
                        { icon: 'bookmark', label: 'Saved', value: '0' },
                    ]
                    : [
                        { icon: 'people', label: 'Candidates', value: '0' },
                        { icon: 'chatbubble', label: 'Inquiries', value: '0' },
                        { icon: 'bookmark', label: 'Saved', value: '0' },
                    ]
                ).map((stat) => (
                    <View key={stat.label} style={styles.statCard}>
                        <Ionicons name={stat.icon as any} size={22} color={Colors.accent} />
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Featured Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    {isJobSeeker ? 'Featured Vacancies' : 'Featured Candidates'}
                </Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            {/* Placeholder — populated in Sprint 4/6 */}
            <View style={styles.emptyState}>
                <Ionicons
                    name={isJobSeeker ? 'briefcase-outline' : 'people-outline'}
                    size={48}
                    color={Colors.gray300}
                />
                <Text style={styles.emptyText}>
                    {isJobSeeker
                        ? 'Featured vacancies will appear here'
                        : 'Featured candidates will appear here'}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.lg, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    greeting: { fontSize: 22, fontWeight: '800', color: Colors.gray900 },
    modeLabel: { fontSize: 14, color: Colors.accent, fontWeight: '600', marginTop: 4 },
    notifButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 52,
        gap: 12,
        marginBottom: Spacing.lg,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
    },
    searchPlaceholder: { color: Colors.gray400, fontSize: 15 },
    statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
    },
    statValue: { fontSize: 20, fontWeight: '800', color: Colors.gray900, marginTop: 6 },
    statLabel: { fontSize: 11, color: Colors.gray500, marginTop: 2, fontWeight: '600' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray900 },
    seeAll: { color: Colors.accent, fontSize: 14, fontWeight: '600' },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md,
    },
    emptyText: { color: Colors.gray400, fontSize: 15 },
});
