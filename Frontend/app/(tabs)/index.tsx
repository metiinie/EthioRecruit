import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { HeaderBar } from '../../components/HeaderBar';
import { useQuery } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';
import { useRouter } from 'expo-router';

const CATEGORIES = [
    { id: 'all', name: 'All' },
    { id: 'housemaid', name: 'Housemaid' },
    { id: 'nanny', name: 'Nanny' },
    { id: 'driver', name: 'Driver' },
    { id: 'cook', name: 'Cook' },
    { id: 'caregiver', name: 'Caregiver' },
    { id: 'cleaning', name: 'Cleaning' },
];

export default function HomeScreen() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Candidates preview for Employer
    const candidatesQuery = useQuery({
        queryKey: ['candidates', 'home', selectedCategory],
        queryFn: () =>
            candidateService.getCandidates({
                categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
                limit: 5,
            }),
        enabled: !isJobSeeker,
    });

    // Fetch Vacancies preview for Job Seeker
    const vacanciesQuery = useQuery({
        queryKey: ['vacancies', 'home', selectedCategory],
        queryFn: () =>
            vacancyService.getVacancies({
                categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
                limit: 5,
            }),
        enabled: isJobSeeker,
    });

    const candidates = candidatesQuery.data?.data || [];
    const vacancies = vacanciesQuery.data?.data || [];
    const isLoading = isJobSeeker ? vacanciesQuery.isLoading : candidatesQuery.isLoading;

    return (
        <View style={styles.container}>
            {/* Top Header with Notification Bell & Language Selector */}
            <HeaderBar
                title="EthioRecruit"
                showGreeting
                userName={user?.firstName}
                subtitle={isJobSeeker ? 'Job Seeker Portal' : 'Employer Portal • Overseas Talent'}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <TouchableOpacity
                    style={styles.searchBarContainer}
                    activeOpacity={0.9}
                    onPress={() => router.push('/(tabs)/browse' as any)}
                >
                    <Ionicons name="search" size={20} color={Colors.accent} />
                    <Text style={styles.searchPlaceholderText}>
                        {isJobSeeker
                            ? 'Search jobs by country, role...'
                            : 'Search candidates by skill, experience, country...'}
                    </Text>
                    <View style={styles.searchBadge}>
                        <Ionicons name="filter-outline" size={14} color={Colors.white} />
                    </View>
                </TouchableOpacity>

                {/* Quick Stats Banner */}
                <View style={styles.statsCardContainer}>
                    {(isJobSeeker
                        ? [
                            { icon: 'briefcase', label: 'Active Vacancies', value: '120+' },
                            { icon: 'document-text', label: 'Applications', value: 'My Activity' },
                            { icon: 'checkmark-circle', label: 'Verified Agencies', value: '25+' },
                        ]
                        : [
                            { icon: 'people', label: 'Verified Candidates', value: `${candidates.length || '50'}+` },
                            { icon: 'chatbubbles', label: 'Direct Inquiries', value: 'Instant' },
                            { icon: 'shield-checkmark', label: 'Medical Cleared', value: '100%' },
                        ]
                    ).map((stat, idx) => (
                        <View key={idx} style={styles.statCard}>
                            <View style={styles.statIconBadge}>
                                <Ionicons name={stat.icon as any} size={18} color={Colors.accent} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Category Pills */}
                <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Browse Categories</Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                                onPress={() => setSelectedCategory(cat.id)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[styles.categoryText, isActive && styles.categoryTextActive]}
                                >
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Featured Section */}
                <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>
                        {isJobSeeker ? 'Featured Vacancies' : 'Verified Candidates'}
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/browse' as any)}>
                        <Text style={styles.seeAllText}>Explore All →</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={Colors.accent} />
                    </View>
                ) : !isJobSeeker ? (
                    /* Employer: Featured Candidates */
                    candidates.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="people-outline" size={42} color={Colors.gray300} />
                            <Text style={styles.emptyText}>No candidate profiles match this category</Text>
                        </View>
                    ) : (
                        candidates.map((cand: any) => (
                            <TouchableOpacity
                                key={cand.id}
                                style={styles.candidateCard}
                                onPress={() => router.push('/(tabs)/browse' as any)}
                                activeOpacity={0.85}
                            >
                                <View style={styles.candidateTop}>
                                    <View style={styles.avatarCircle}>
                                        <Text style={styles.avatarText}>
                                            {cand.firstName?.[0] || 'C'}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={styles.candidateName}>
                                                {cand.firstName} {cand.lastName?.[0]}.
                                            </Text>
                                            {cand.agency?.isVerified && (
                                                <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                                            )}
                                        </View>
                                        <Text style={styles.candidateSub}>
                                            {cand.category?.name || 'Domestic Worker'} • {cand.yearsOfExperience} Yrs Exp
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.medicalBadge,
                                            cand.medicalStatus === 'cleared'
                                                ? styles.medicalCleared
                                                : styles.medicalPending,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.medicalBadgeText,
                                                cand.medicalStatus === 'cleared' && { color: Colors.success },
                                            ]}
                                        >
                                            {cand.medicalStatus === 'cleared' ? 'Medical Cleared' : 'Pending'}
                                        </Text>
                                    </View>
                                </View>

                                {cand.summary ? (
                                    <Text style={styles.summarySnippet} numberOfLines={2}>
                                        {cand.summary}
                                    </Text>
                                ) : null}

                                <View style={styles.cardFooter}>
                                    <View style={styles.agencyBadge}>
                                        <Ionicons name="business-outline" size={13} color={Colors.gray600} />
                                        <Text style={styles.agencyText}>
                                            {cand.agency?.name || 'Recruitment Agency'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.inquireBtn}
                                        onPress={() => router.push('/(tabs)/browse' as any)}
                                    >
                                        <Ionicons name="chatbubble" size={13} color={Colors.white} />
                                        <Text style={styles.inquireBtnText}>Inquire</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )
                ) : (
                    /* Job Seeker: Featured Vacancies */
                    vacancies.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="briefcase-outline" size={42} color={Colors.gray300} />
                            <Text style={styles.emptyText}>No vacancies match this filter</Text>
                        </View>
                    ) : (
                        vacancies.map((vac: any) => (
                            <TouchableOpacity
                                key={vac.id}
                                style={styles.candidateCard}
                                onPress={() => router.push('/(tabs)/browse' as any)}
                                activeOpacity={0.85}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.candidateName}>{vac.title}</Text>
                                    <Text style={styles.salaryText}>
                                        {vac.salaryCurrency} {vac.salaryMin || 'Negotiable'}
                                    </Text>
                                </View>
                                <Text style={styles.candidateSub}>
                                    {vac.country} • {vac.agency?.name || 'Verified Agency'}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.lg, paddingBottom: 40 },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        height: 52,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.gray200,
        gap: 10,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
    },
    searchPlaceholderText: {
        flex: 1,
        color: Colors.gray400,
        fontSize: 14,
        fontWeight: '500',
    },
    searchBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsCardContainer: {
        flexDirection: 'row',
        gap: Spacing.xs,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },
    statIconBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.gray900,
    },
    statLabel: {
        fontSize: 10,
        color: Colors.gray500,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 2,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.gray900,
        letterSpacing: -0.3,
    },
    seeAllText: {
        color: Colors.accent,
        fontSize: 13,
        fontWeight: '700',
    },
    categoriesContainer: {
        gap: 8,
        paddingBottom: Spacing.lg,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    categoryPillActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.gray600,
    },
    categoryTextActive: {
        color: Colors.white,
        fontWeight: '700',
    },
    loadingBox: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    emptyText: {
        color: Colors.gray400,
        fontSize: 14,
    },
    candidateCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
    },
    candidateTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '800',
    },
    candidateName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.gray900,
    },
    candidateSub: {
        fontSize: 12,
        color: Colors.gray500,
        marginTop: 2,
    },
    medicalBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: Colors.gray100,
    },
    medicalCleared: {
        backgroundColor: Colors.success + '15',
    },
    medicalPending: {
        backgroundColor: Colors.warning + '15',
    },
    medicalBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.gray600,
    },
    summarySnippet: {
        fontSize: 13,
        color: Colors.gray600,
        marginTop: 10,
        lineHeight: 18,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.gray100,
    },
    agencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    agencyText: {
        fontSize: 12,
        color: Colors.gray600,
        fontWeight: '500',
    },
    inquireBtn: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    inquireBtnText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '700',
    },
    salaryText: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.accentDark,
    },
});
