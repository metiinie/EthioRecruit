import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { HeaderBar } from '../../components/HeaderBar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';
import { CandidatePostCard } from '../../components/CandidatePostCard';
import { VacancyPostCard } from '../../components/VacancyPostCard';

const CATEGORIES = [
    { id: 'all', name: 'All Categories' },
    { id: 'housemaid', name: 'Housemaid' },
    { id: 'nanny', name: 'Nanny' },
    { id: 'driver', name: 'Driver' },
    { id: 'cook', name: 'Cook' },
    { id: 'caregiver', name: 'Caregiver' },
    { id: 'cleaner', name: 'Cleaner' },
];

export default function HomeScreen() {
    const router = useRouter();
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';
    const queryClient = useQueryClient();

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [inquiryMessage, setInquiryMessage] = useState('');

    // Fetch Candidates (Employer mode)
    const candidatesQuery = useQuery({
        queryKey: ['home-candidates', selectedCategory],
        queryFn: () =>
            candidateService.getCandidates({
                categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
                limit: 5,
            }),
        enabled: !isJobSeeker,
    });

    // Fetch Vacancies (Job Seeker mode)
    const vacanciesQuery = useQuery({
        queryKey: ['home-vacancies', selectedCategory],
        queryFn: () =>
            vacancyService.getVacancies({
                categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
                limit: 5,
            }),
        enabled: isJobSeeker,
    });

    // Submit Inquiry Mutation
    const inquiryMutation = useMutation({
        mutationFn: (data: { candidateId: string; message: string }) =>
            candidateService.submitInquiry(data.candidateId, { message: data.message }),
        onSuccess: () => {
            Alert.alert('Inquiry Sent', 'Your inquiry has been submitted to the agency!');
            setSelectedCandidate(null);
            setInquiryMessage('');
            queryClient.invalidateQueries({ queryKey: ['activity', 'inquiries'] });
        },
        onError: (err: any) => {
            Alert.alert('Submission Error', err.response?.data?.error?.message || 'Failed to send inquiry');
        },
    });

    const isLoading = isJobSeeker ? vacanciesQuery.isLoading : candidatesQuery.isLoading;
    const candidates = candidatesQuery.data?.data || [];
    const vacancies = vacanciesQuery.data?.data || [];

    return (
        <View style={styles.container}>
            {/* Top Bar Header */}
            <HeaderBar
                title={isJobSeeker ? 'Overseas Vacancies' : 'Employer Portal'}
                subtitle={
                    isJobSeeker
                        ? 'Find & apply to foreign job opportunities'
                        : 'Hire verified domestic & skilled professionals'
                }
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick Search Card */}
                <TouchableOpacity
                    style={styles.searchCard}
                    onPress={() => router.push('/(tabs)/browse' as any)}
                    activeOpacity={0.9}
                >
                    <Ionicons name="search" size={20} color={Colors.accent} />
                    <Text style={styles.searchPlaceholder}>
                        {isJobSeeker ? 'Search overseas vacancies...' : 'Search certified candidates by skill, experience...'}
                    </Text>
                </TouchableOpacity>

                {/* Stat Highlights (Employer Mode) */}
                {!isJobSeeker && (
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: Colors.accent + '20' }]}>
                                <Ionicons name="people" size={18} color={Colors.accentDark} />
                            </View>
                            <Text style={styles.statValue}>1,250+</Text>
                            <Text style={styles.statLabel}>Verified Workers</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: Colors.success + '20' }]}>
                                <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
                            </View>
                            <Text style={styles.statValue}>100%</Text>
                            <Text style={styles.statLabel}>Medical Cleared</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: Colors.warning + '20' }]}>
                                <Ionicons name="time" size={18} color={Colors.warning} />
                            </View>
                            <Text style={styles.statValue}>24 Hrs</Text>
                            <Text style={styles.statLabel}>Avg Response</Text>
                        </View>
                    </View>
                )}

                {/* Categories Horizontal Scroll */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    {CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Featured Candidates / Vacancies Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {isJobSeeker ? 'Featured Overseas Vacancies' : 'Featured Verified Candidates'}
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/browse' as any)}>
                        <Text style={styles.seeAllText}>See All ({candidates.length})</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={Colors.accent} />
                    </View>
                ) : !isJobSeeker ? (
                    candidates.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="people-outline" size={42} color={Colors.gray300} />
                            <Text style={styles.emptyText}>No candidates match this category</Text>
                        </View>
                    ) : (
                        candidates.map((cand: any) => (
                            <CandidatePostCard
                                key={cand.id}
                                candidate={cand}
                                onPress={() => router.push(`/candidate/${cand.id}` as any)}
                                onInquire={() => setSelectedCandidate(cand)}
                            />
                        ))
                    )
                ) : vacancies.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="briefcase-outline" size={42} color={Colors.gray300} />
                        <Text style={styles.emptyText}>No vacancies match this filter</Text>
                    </View>
                ) : (
                    vacancies.map((vac: any) => (
                        <VacancyPostCard
                            key={vac.id}
                            vacancy={vac}
                            onPress={() => router.push('/(tabs)/browse' as any)}
                            onApply={() => router.push('/(tabs)/browse' as any)}
                        />
                    ))
                )}
            </ScrollView>

            {/* Inquiry Modal */}
            {selectedCandidate && (
                <Modal visible transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Inquire Candidate</Text>
                                <TouchableOpacity onPress={() => setSelectedCandidate(null)}>
                                    <Ionicons name="close" size={24} color={Colors.gray500} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSub}>
                                Direct inquiry for {selectedCandidate.firstName} {selectedCandidate.lastName} to {selectedCandidate.agency?.name || 'the agency'}.
                            </Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Specify requirements, start date, budget, or questions..."
                                placeholderTextColor={Colors.gray400}
                                multiline
                                numberOfLines={4}
                                value={inquiryMessage}
                                onChangeText={setInquiryMessage}
                            />
                            <TouchableOpacity
                                style={[styles.modalSubmit, inquiryMutation.isPending && { opacity: 0.6 }]}
                                onPress={() =>
                                    inquiryMutation.mutate({
                                        candidateId: selectedCandidate.id,
                                        message: inquiryMessage,
                                    })
                                }
                                disabled={inquiryMutation.isPending}
                            >
                                <Text style={styles.modalSubmitText}>
                                    {inquiryMutation.isPending ? 'Submitting...' : 'Send Inquiry to Agency'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.lg, paddingBottom: 120 },
    searchCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        marginBottom: Spacing.lg,
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },
    searchPlaceholder: { color: Colors.gray400, fontSize: 14, fontWeight: '500' },
    statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray200,
        gap: 4,
    },
    statIconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    statValue: { fontSize: 16, fontWeight: '800', color: Colors.gray900 },
    statLabel: { fontSize: 10, color: Colors.gray500, fontWeight: '600', textAlign: 'center' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        marginTop: Spacing.xs,
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.gray900 },
    seeAllText: { fontSize: 13, fontWeight: '700', color: Colors.accent },
    categoryScroll: { gap: 8, marginBottom: Spacing.lg, paddingRight: Spacing.lg },
    categoryPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    categoryPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    categoryText: { fontSize: 12, fontWeight: '600', color: Colors.gray600 },
    categoryTextActive: { color: Colors.white, fontWeight: '700' },
    loadingBox: { paddingVertical: 40, alignItems: 'center' },
    emptyCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        gap: 10,
    },
    emptyText: { color: Colors.gray400, fontSize: 14 },
    candidateCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },
    candidateTopRow: { flexDirection: 'row', alignItems: 'center' },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: { color: Colors.white, fontWeight: '800', fontSize: 18 },
    candidateName: { fontSize: 15, fontWeight: '800', color: Colors.gray900 },
    candidateSub: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
    clearedBadge: {
        backgroundColor: Colors.success + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    clearedText: { fontSize: 10, fontWeight: '800', color: Colors.success },
    candidateBio: { fontSize: 13, color: Colors.gray600, marginTop: 10, lineHeight: 18 },
    candidateFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.gray100,
    },
    agencyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
    agencyText: { fontSize: 12, color: Colors.gray600, fontWeight: '500' },
    inquireShortBtn: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    inquireShortBtnText: {
        color: Colors.white,
        fontWeight: '800',
        fontSize: 12,
    },
    salaryText: { fontSize: 14, fontWeight: '800', color: Colors.accentDark },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, gap: Spacing.md },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.gray900 },
    modalSub: { fontSize: 13, color: Colors.gray500 },
    modalInput: {
        backgroundColor: Colors.gray50,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.gray900,
        height: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    modalSubmit: { backgroundColor: Colors.accent, paddingVertical: 14, borderRadius: BorderRadius.md, alignItems: 'center' },
    modalSubmitText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
