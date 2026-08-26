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

const CATEGORIES = [
    { id: 'all', name: 'All Categories' },
    { id: 'housemaid', name: 'Housemaid' },
    { id: 'nanny', name: 'Nanny' },
    { id: 'driver', name: 'Driver' },
    { id: 'cook', name: 'Cook' },
    { id: 'caregiver', name: 'Caregiver' },
    { id: 'cleaning', name: 'Cleaning' },
];

export default function BrowseScreen() {
    const router = useRouter();
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';
    const queryClient = useQueryClient();

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [medicalFilter, setMedicalFilter] = useState<'all' | 'cleared'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [selectedVacancy, setSelectedVacancy] = useState<any>(null);
    const [coverLetter, setCoverLetter] = useState('');

    // Fetch Candidates (Employer mode)
    const candidatesQuery = useQuery({
        queryKey: ['candidates', selectedCategory, searchQuery],
        queryFn: () =>
            candidateService.getCandidates({
                categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
                search: searchQuery || undefined,
            }),
        enabled: !isJobSeeker,
    });

    // Fetch Vacancies (Job Seeker mode)
    const vacanciesQuery = useQuery({
        queryKey: ['vacancies', selectedCategory, searchQuery],
        queryFn: () =>
            vacancyService.getVacancies({
                categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
                search: searchQuery || undefined,
            }),
        enabled: isJobSeeker,
    });

    // Submit Inquiry Mutation
    const inquiryMutation = useMutation({
        mutationFn: (data: { candidateId: string; message: string }) =>
            candidateService.submitInquiry(data.candidateId, { message: data.message }),
        onSuccess: () => {
            Alert.alert('Inquiry Sent', 'Your inquiry has been submitted to the recruitment agency!');
            setSelectedCandidate(null);
            setInquiryMessage('');
            queryClient.invalidateQueries({ queryKey: ['activity', 'inquiries'] });
        },
        onError: (err: any) => {
            Alert.alert('Submission Error', err.response?.data?.error?.message || 'Failed to send inquiry');
        },
    });

    // Apply to Vacancy Mutation
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

    const isLoading = isJobSeeker ? vacanciesQuery.isLoading : candidatesQuery.isLoading;

    let rawCandidates = candidatesQuery.data?.data || [];
    if (medicalFilter === 'cleared') {
        rawCandidates = rawCandidates.filter((c: any) => c.medicalStatus === 'cleared');
    }

    return (
        <View style={styles.container}>
            {/* HeaderBar */}
            <HeaderBar
                title={isJobSeeker ? 'Overseas Vacancies' : 'Verified Candidates'}
                subtitle={
                    isJobSeeker
                        ? 'Explore & apply to abroad job openings'
                        : 'Browse certified domestic & skilled workers'
                }
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={Colors.accent} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={isJobSeeker ? 'Search title, country...' : 'Search skills, location...'}
                        placeholderTextColor={Colors.gray400}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={Colors.gray400} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Category Pills */}
            <View style={{ height: 44, marginBottom: 8 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryContent}
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
            </View>

            {/* Extra Filter Row for Employers: Medical Cleared Toggle */}
            {!isJobSeeker && (
                <View style={styles.filterRow}>
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            medicalFilter === 'all' && styles.filterChipActive,
                        ]}
                        onPress={() => setMedicalFilter('all')}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                medicalFilter === 'all' && styles.filterChipTextActive,
                            ]}
                        >
                            All Candidates
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            medicalFilter === 'cleared' && styles.filterChipActive,
                        ]}
                        onPress={() => setMedicalFilter('cleared')}
                    >
                        <Ionicons name="shield-checkmark" size={14} color={medicalFilter === 'cleared' ? Colors.white : Colors.success} />
                        <Text
                            style={[
                                styles.filterChipText,
                                medicalFilter === 'cleared' && styles.filterChipTextActive,
                            ]}
                        >
                            Medical Cleared Only
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Main List Area */}
            {isLoading ? (
                <View style={styles.loadingArea}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                </View>
            ) : isJobSeeker ? (
                /* Vacancies List */
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {vacanciesQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="briefcase-outline" size={48} color={Colors.gray300} />
                            <Text style={styles.emptyText}>No vacancies found matching your search</Text>
                        </View>
                    ) : (
                        vacanciesQuery.data?.data?.map((vac: any) => (
                            <View key={vac.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardTitle}>{vac.title}</Text>
                                        <Text style={styles.agencyName}>{vac.agency?.name || 'Verified Agency'}</Text>
                                    </View>
                                    <View style={styles.badgeTeal}>
                                        <Text style={styles.badgeTealText}>
                                            {vac.salaryCurrency} {vac.salaryMin || 'Negotiable'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.metaRow}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="location" size={14} color={Colors.accent} />
                                        <Text style={styles.metaText}>{vac.country}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="calendar" size={14} color={Colors.gray500} />
                                        <Text style={styles.metaText}>{vac.contractPeriodYears} Year Contract</Text>
                                    </View>
                                    {vac.visaSponsorship && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="card" size={14} color={Colors.success} />
                                            <Text style={[styles.metaText, { color: Colors.success }]}>Visa Included</Text>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => setSelectedVacancy(vac)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.actionBtnText}>Apply Now</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            ) : (
                /* Candidates List */
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {rawCandidates.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="people-outline" size={48} color={Colors.gray300} />
                            <Text style={styles.emptyText}>No candidates found matching your filters</Text>
                        </View>
                    ) : (
                        rawCandidates.map((cand: any) => (
                            <TouchableOpacity
                                key={cand.id}
                                style={styles.card}
                                onPress={() => router.push(`/candidate/${cand.id}` as any)}
                                activeOpacity={0.88}
                            >
                                <View style={styles.candidateHeader}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarInitial}>{cand.firstName?.[0] || 'C'}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={styles.cardTitle}>
                                                {cand.firstName} {cand.lastName?.[0]}.
                                            </Text>
                                            {cand.agency?.isVerified && (
                                                <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                                            )}
                                        </View>
                                        <Text style={styles.agencyName}>
                                            {cand.category?.name || 'Worker'} • {cand.yearsOfExperience || cand.experienceYears || '1+'} yrs exp
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.statusTag,
                                            cand.medicalStatus === 'cleared'
                                                ? styles.statusCleared
                                                : styles.statusPending,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusTagText,
                                                cand.medicalStatus === 'cleared' && { color: Colors.success },
                                            ]}
                                        >
                                            {cand.medicalStatus === 'cleared' ? 'Medical Cleared' : 'Pending'}
                                        </Text>
                                    </View>
                                </View>

                                {cand.summary ? (
                                    <Text style={styles.summaryText} numberOfLines={2}>
                                        {cand.summary}
                                    </Text>
                                ) : null}

                                <View style={styles.cardFooterRow}>
                                    <View style={styles.agencyInfo}>
                                        <Ionicons name="business-outline" size={14} color={Colors.gray500} />
                                        <Text style={styles.agencyInfoText}>
                                            {cand.agency?.name || 'EthioRecruit Agency'}
                                        </Text>
                                    </View>

                                    {/* Prominent "Inquire" button */}
                                    <TouchableOpacity
                                        style={styles.inquireShortBtn}
                                        onPress={() => setSelectedCandidate(cand)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={14} color={Colors.white} />
                                        <Text style={styles.inquireShortBtnText}>Inquire</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}

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
                                Send direct inquiry regarding {selectedCandidate.firstName} {selectedCandidate.lastName} to {selectedCandidate.agency?.name || 'the agency'}.
                            </Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Specify requirements, start date, salary budget, or questions..."
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

            {/* Apply Modal */}
            {selectedVacancy && (
                <Modal visible transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Apply for {selectedVacancy.title}</Text>
                                <TouchableOpacity onPress={() => setSelectedVacancy(null)}>
                                    <Ionicons name="close" size={24} color={Colors.gray500} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSub}>
                                Location: {selectedVacancy.country} • Agency: {selectedVacancy.agency?.name}
                            </Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Optional cover letter or note to recruitment agency..."
                                placeholderTextColor={Colors.gray400}
                                multiline
                                numberOfLines={4}
                                value={coverLetter}
                                onChangeText={setCoverLetter}
                            />
                            <TouchableOpacity
                                style={[styles.modalSubmit, applyMutation.isPending && { opacity: 0.6 }]}
                                onPress={() =>
                                    applyMutation.mutate({
                                        vacancyId: selectedVacancy.id,
                                        coverLetter,
                                    })
                                }
                                disabled={applyMutation.isPending}
                            >
                                <Text style={styles.modalSubmitText}>
                                    {applyMutation.isPending ? 'Submitting...' : 'Confirm Application'}
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
    searchContainer: { paddingHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.xs },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        height: 48,
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },
    searchInput: { flex: 1, color: Colors.gray900, fontSize: 14, fontWeight: '500' },
    categoryContent: { paddingHorizontal: Spacing.lg, gap: 8, alignItems: 'center' },
    categoryPill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    categoryPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    categoryText: { fontSize: 12, fontWeight: '600', color: Colors.gray600 },
    categoryTextActive: { color: Colors.white, fontWeight: '700' },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: 8,
        marginBottom: Spacing.xs,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray100,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    filterChipActive: {
        backgroundColor: Colors.accent,
        borderColor: Colors.accent,
    },
    filterChipText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.gray700,
    },
    filterChipTextActive: {
        color: Colors.white,
    },
    loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 40 },
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: Colors.gray400, fontSize: 15 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.gray900 },
    agencyName: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
    badgeTeal: {
        backgroundColor: Colors.accent + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    badgeTealText: { color: Colors.accentDark, fontSize: 12, fontWeight: '700' },
    metaRow: { flexDirection: 'row', gap: 16, marginTop: 12, marginBottom: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: Colors.gray600, fontWeight: '500' },
    actionBtn: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    actionBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
    candidateHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: { color: Colors.white, fontWeight: '800', fontSize: 18 },
    statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: Colors.gray100 },
    statusCleared: { backgroundColor: Colors.success + '15' },
    statusPending: { backgroundColor: Colors.warning + '15' },
    statusTagText: { fontSize: 10, fontWeight: '800', color: Colors.gray600 },
    summaryText: { fontSize: 13, color: Colors.gray600, marginTop: 10, marginBottom: 6, lineHeight: 18 },
    cardFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.gray100,
    },
    agencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    agencyInfoText: {
        fontSize: 12,
        color: Colors.gray600,
        fontWeight: '500',
    },
    inquireShortBtn: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        elevation: 1,
    },
    inquireShortBtnText: {
        color: Colors.white,
        fontWeight: '800',
        fontSize: 13,
    },
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
