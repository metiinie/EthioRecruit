import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';

export default function AdminDashboard() {
    const router = useRouter();
    const admin = useAdminAuthStore((s) => s.admin);
    const logout = useAdminAuthStore((s) => s.logout);

    const [candidateCount, setCandidateCount] = useState<number>(0);
    const [vacancyCount, setVacancyCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const loadDashboardStats = async () => {
        setLoading(true);
        try {
            const [candidatesRes, vacanciesRes] = await Promise.allSettled([
                candidateService.getAdminCandidates({ perPage: 1 }),
                vacancyService.getAdminVacancies({ perPage: 1 }),
            ]);

            if (candidatesRes.status === 'fulfilled' && candidatesRes.value) {
                const meta = candidatesRes.value.meta || candidatesRes.value.data?.meta;
                setCandidateCount(meta?.total ?? (Array.isArray(candidatesRes.value.data) ? candidatesRes.value.data.length : 0));
            }

            if (vacanciesRes.status === 'fulfilled' && vacanciesRes.value) {
                const meta = vacanciesRes.value.meta || vacanciesRes.value.data?.meta;
                setVacancyCount(meta?.total ?? (Array.isArray(vacanciesRes.value.data) ? vacanciesRes.value.data.length : 0));
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadDashboardStats();
    };

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/welcome');
    };

    // Metric Cards matching the user's reference image styling
    const stats = [
        {
            label: 'Total Candidates',
            value: loading ? '...' : String(candidateCount),
            icon: 'people',
            accentColor: '#10B981', // Emerald Green
            bgColor: '#ECFDF5',
            iconColor: '#059669',
        },
        {
            label: 'Active Vacancies',
            value: loading ? '...' : String(vacancyCount),
            icon: 'briefcase',
            accentColor: '#2563EB', // Royal Blue
            bgColor: '#EFF6FF',
            iconColor: '#1D4ED8',
        },
        {
            label: 'Pipeline Apps',
            value: '14',
            icon: 'git-branch',
            accentColor: '#F59E0B', // Amber
            bgColor: '#FEF3C7',
            iconColor: '#D97706',
        },
        {
            label: 'Agency Staff',
            value: '5',
            icon: 'people-circle',
            accentColor: '#059669', // Deep Green
            bgColor: '#F0FDF4',
            iconColor: '#166534',
        },
    ];

    // Quick Actions with functional navigation
    const actions = [
        {
            icon: 'person-add',
            label: 'Add Candidate',
            sublabel: 'Register candidate',
            route: '/(admin)/candidates/new',
            color: '#10B981',
            bgColor: '#ECFDF5',
        },
        {
            icon: 'add-circle',
            label: 'Post Vacancy',
            sublabel: 'Create job opening',
            route: '/(admin)/vacancies/new',
            color: '#2563EB',
            bgColor: '#EFF6FF',
        },
        {
            icon: 'people',
            label: 'Candidates',
            sublabel: 'View directory',
            route: '/(admin)/candidates',
            color: '#0D3B66',
            bgColor: '#F0F4F8',
        },
        {
            icon: 'briefcase',
            label: 'Vacancies',
            sublabel: 'Manage postings',
            route: '/(admin)/vacancies',
            color: '#059669',
            bgColor: '#ECFDF5',
        },
        {
            icon: 'git-branch',
            label: 'Pipeline',
            sublabel: 'Track applications',
            route: '/(admin)/pipeline',
            color: '#D97706',
            bgColor: '#FEF3C7',
        },
        {
            icon: 'people-circle',
            label: 'Staff Members',
            sublabel: 'Manage team',
            route: '/(admin)/staff',
            color: '#2563EB',
            bgColor: '#EFF6FF',
        },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#10B981', '#2563EB']} />
            }
        >
            {/* Top Brand Banner & Agency Header */}
            <View style={styles.headerCard}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatarBadge}>
                        <Ionicons name="business" size={24} color="#10B981" />
                    </View>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.adminName}>{admin?.firstName ? `${admin.firstName} ${admin.lastName || ''}` : 'Agency Administrator'}</Text>
                        <Text style={styles.orgName}>{admin?.organization?.name || 'EthioRecruit Authorized Agency'}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutPill} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Agency Dashboard Overview</Text>
                <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live Data</Text>
                </View>
            </View>

            {/* Metric Cards Grid (Matching Reference Design) */}
            <View style={styles.statsGrid}>
                {stats.map((stat) => (
                    <View key={stat.label} style={[styles.statCard, { borderTopColor: stat.accentColor }]}>
                        <View style={styles.statCardHeader}>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                            <View style={[styles.statIconBadge, { backgroundColor: stat.bgColor }]}>
                                <Ionicons name={stat.icon as any} size={20} color={stat.iconColor} />
                            </View>
                        </View>
                        <Text style={styles.statValue}>{stat.value}</Text>
                    </View>
                ))}
            </View>

            {/* Quick Actions Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Management Actions</Text>
                <Text style={styles.sectionSubtitle}>Tap to open page</Text>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.actionsGrid}>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.label}
                        style={styles.actionCard}
                        activeOpacity={0.7}
                        onPress={() => router.push(action.route as any)}
                    >
                        <View style={[styles.actionIconBadge, { backgroundColor: action.bgColor }]}>
                            <Ionicons name={action.icon as any} size={24} color={action.color} />
                        </View>
                        <Text style={styles.actionLabel}>{action.label}</Text>
                        <Text style={styles.actionSublabel}>{action.sublabel}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Light, bright background ("Right mood")
    },
    content: {
        padding: 18,
        paddingTop: 56,
        paddingBottom: 40,
    },

    // Header Card
    headerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatarBadge: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    greeting: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    adminName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#0F172A', // Deep primary blue/slate
        marginTop: 1,
    },
    orgName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981', // Brand green
        marginTop: 2,
    },
    logoutPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    logoutText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#EF4444',
    },

    // Section Titles
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#0F172A',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
    },
    liveText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669',
    },

    // Stats Cards (Reference Design: White card with top accent bar, label top left, icon box top right, value bottom left)
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderTopWidth: 4, // Top accent line like reference image
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    statCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        flex: 1,
        marginRight: 6,
    },
    statIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0D3B66', // Deep navy brand blue
    },

    // Quick Actions Grid
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
    },
    actionIconBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 2,
    },
    actionSublabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
});
