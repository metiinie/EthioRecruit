import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { HeaderBar } from '../../components/HeaderBar';
import { savedService } from '../../services/savedService';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CandidatePostCard } from '../../components/CandidatePostCard';
import { VacancyPostCard } from '../../components/VacancyPostCard';
import { JobApplicationModal } from '../../components/JobApplicationModal';

export default function SavedTabScreen() {
    const router = useRouter();
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';
    const queryClient = useQueryClient();

    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [selectedVacancy, setSelectedVacancy] = useState<any>(null);
    const [coverLetter, setCoverLetter] = useState('');

    // Fetch Saved Candidates (Employer mode)
    const savedCandidatesQuery = useQuery({
        queryKey: ['saved-candidates'],
        queryFn: async () => {
            const res = await savedService.getSavedCandidates();
            return res.data || [];
        },
        enabled: !isJobSeeker,
    });

    // Fetch Saved Vacancies (Job Seeker mode)
    const savedVacanciesQuery = useQuery({
        queryKey: ['saved-vacancies'],
        queryFn: async () => {
            const res = await savedService.getSavedVacancies();
            return res.data || [];
        },
        enabled: isJobSeeker,
    });

    // Unsave Candidate Mutation
    const unsaveCandidateMutation = useMutation({
        mutationFn: (candidateId: string) => savedService.unsaveCandidate(candidateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-candidates'] });
        },
        onError: () => {
            Alert.alert('Error', 'Failed to remove candidate from saved list');
        },
    });

    // Unsave Vacancy Mutation
    const unsaveVacancyMutation = useMutation({
        mutationFn: (vacancyId: string) => savedService.unsaveVacancy(vacancyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-vacancies'] });
        },
        onError: () => {
            Alert.alert('Error', 'Failed to remove vacancy from saved list');
        },
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

    // Apply Mutation
    const applyMutation = useMutation({
        mutationFn: (data: { vacancyId: string; coverLetter: string }) =>
            vacancyService.applyToVacancy(data.vacancyId, { coverLetter: data.coverLetter }),
        onSuccess: () => {
            Alert.alert('Application Submitted', 'Your application has been received!');
            setSelectedVacancy(null);
            setCoverLetter('');
            queryClient.invalidateQueries({ queryKey: ['activity', 'applications'] });
        },
        onError: (err: any) => {
            Alert.alert('Submission Error', err.response?.data?.error?.message || 'Failed to submit application');
        },
    });

    const isLoading = isJobSeeker ? savedVacanciesQuery.isLoading : savedCandidatesQuery.isLoading;
    const isRefetching = isJobSeeker ? savedVacanciesQuery.isRefetching : savedCandidatesQuery.isRefetching;
    const handleRefresh = () => {
        if (isJobSeeker) savedVacanciesQuery.refetch();
        else savedCandidatesQuery.refetch();
    };

    const savedCandidates = savedCandidatesQuery.data || [];
    const savedVacancies = savedVacanciesQuery.data || [];

    return (
        <View style={styles.container}>
            {/* Top Header */}
            <HeaderBar
                title="Saved Items"
                subtitle={
                    isJobSeeker
                        ? 'Bookmarked overseas job listings'
                        : 'Bookmarked candidates roster for hire'
                }
            />

            {isLoading ? (
                <View style={styles.loadingArea}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                    <Text style={styles.loadingText}>Loading saved items...</Text>
                </View>
            ) : !isJobSeeker ? (
                /* Employer Mode: Saved Candidates */
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={Colors.accent} />
                    }
                >
                    {savedCandidates.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="bookmark-outline" size={48} color={Colors.gray400} />
                            </View>
                            <Text style={styles.emptyTitle}>No Saved Candidates Yet</Text>
                            <Text style={styles.emptySub}>
                                Bookmark profiles while browsing candidates to easily review and inquire later.
                            </Text>
                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() => router.push('/(tabs)/browse' as any)}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="search" size={16} color={Colors.white} />
                                <Text style={styles.browseButtonText}>Browse Candidates</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        savedCandidates.map((item: any) => {
                            const cand = item.candidate;
                            if (!cand) return null;
                            return (
                                <CandidatePostCard
                                    key={item.id}
                                    candidate={cand}
                                    onPress={() => router.push(`/candidate/${cand.id}` as any)}
                                    onInquire={() => setSelectedCandidate(cand)}
                                    onToggleBookmark={() => unsaveCandidateMutation.mutate(cand.id)}
                                    isBookmarked={true}
                                />
                            );
                        })
                    )}
                </ScrollView>
            ) : (
                /* Job Seeker Mode: Saved Vacancies */
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={Colors.accent} />
                    }
                >
                    {savedVacancies.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="bookmark-outline" size={48} color={Colors.gray400} />
                            </View>
                            <Text style={styles.emptyTitle}>No Saved Job Vacancies</Text>
                            <Text style={styles.emptySub}>
                                Save foreign job opportunities while browsing to review and apply when you are ready.
                            </Text>
                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() => router.push('/(tabs)/browse' as any)}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="search" size={16} color={Colors.white} />
                                <Text style={styles.browseButtonText}>Explore Vacancies</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        savedVacancies.map((item: any) => {
                            const vac = item.vacancy;
                            if (!vac) return null;
                            return (
                                <VacancyPostCard
                                    key={item.id}
                                    vacancy={vac}
                                    onPress={() => setSelectedVacancy(vac)}
                                    onApply={() => setSelectedVacancy(vac)}
                                    onToggleBookmark={() => unsaveVacancyMutation.mutate(vac.id)}
                                    isBookmarked={true}
                                />
                            );
                        })
                    )}
                </ScrollView>
            )}

            {/* Candidate Inquiry Modal */}
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

            {/* Vacancy Application Modal */}
            {/* Apply Modal */}
            <JobApplicationModal
                visible={!!selectedVacancy}
                vacancy={selectedVacancy}
                onClose={() => setSelectedVacancy(null)}
                onSubmit={(payload) =>
                    applyMutation.mutate({
                        vacancyId: selectedVacancy.id,
                        coverLetter: payload.coverLetter,
                    })
                }
                isSubmitting={applyMutation.isPending}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 14, color: Colors.gray600, fontWeight: '600' },
    listContent: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 120 },
    emptyContainer: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray200,
        marginTop: Spacing.md,
    },
    emptyIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.gray900 },
    emptySub: { fontSize: 13, color: Colors.gray500, textAlign: 'center', marginTop: 6, lineHeight: 18 },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.accent,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: BorderRadius.xl,
        marginTop: 18,
    },
    browseButtonText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },
    candidateHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarImage: { width: 44, height: 44, borderRadius: 22 },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: { color: Colors.white, fontWeight: '800', fontSize: 18 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.gray900 },
    subText: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
    removeBookmarkBtn: { padding: 6 },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 6,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusCleared: { backgroundColor: Colors.success + '15' },
    statusPending: { backgroundColor: Colors.warning + '15' },
    statusText: { fontSize: 10, fontWeight: '800' },
    locationText: { fontSize: 12, color: Colors.gray600, fontWeight: '600' },
    cardFooter: {
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
    inquireBtn: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    inquireBtnText: { color: Colors.white, fontWeight: '800', fontSize: 12 },
    badgeTeal: {
        backgroundColor: Colors.accent + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    badgeTealText: { color: Colors.accentDark, fontSize: 12, fontWeight: '700' },
    actionBtnFull: {
        backgroundColor: Colors.accent,
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: 10,
    },
    actionBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
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
