import { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';

const CATEGORIES = [
    { id: 'all', name: 'All' },
    { id: 'housemaid', name: 'Housemaid' },
    { id: 'nanny', name: 'Nanny' },
    { id: 'driver', name: 'Driver' },
    { id: 'cook', name: 'Cook' },
    { id: 'caregiver', name: 'Caregiver' },
    { id: 'cleaning', name: 'Cleaning' },
];

export default function BrowseScreen() {
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';
    const queryClient = useQueryClient();

    const [selectedCategory, setSelectedCategory] = useState('all');
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
            Alert.alert('Success', 'Your inquiry has been submitted to the agency!');
            setSelectedCandidate(null);
            setInquiryMessage('');
        },
        onError: (err: any) => {
            Alert.alert('Error', err.response?.data?.error?.message || 'Failed to send inquiry');
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
            queryClient.invalidateQueries({ queryKey: ['activity'] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err.response?.data?.error?.message || 'Failed to submit application');
        },
    });

    const isLoading = isJobSeeker ? vacanciesQuery.isLoading : candidatesQuery.isLoading;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isJobSeeker ? 'Overseas Vacancies' : 'Verified Candidates'}
                </Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={Colors.gray400} />
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
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContent}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.categoryPill,
                            selectedCategory === cat.id && styles.categoryPillActive,
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === cat.id && styles.categoryTextActive,
                            ]}
                        >
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Main List Area */}
            {isLoading ? (
                <View style={styles.loadingArea}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                </View>
            ) : isJobSeeker ? (
                /* Vacancies List */
                <ScrollView contentContainerStyle={styles.listContent}>
                    {vacanciesQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="briefcase-outline" size={48} color={Colors.gray300} />
                            <Text style={styles.emptyText}>No vacancies found</Text>
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
                <ScrollView contentContainerStyle={styles.listContent}>
                    {candidatesQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="people-outline" size={48} color={Colors.gray300} />
                            <Text style={styles.emptyText}>No candidates found</Text>
                        </View>
                    ) : (
                        candidatesQuery.data?.data?.map((cand: any) => (
                            <View key={cand.id} style={styles.card}>
                                <View style={styles.candidateHeader}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarInitial}>{cand.firstName?.[0]}</Text>
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
                                            {cand.category?.name || 'Worker'} • {cand.yearsOfExperience} yrs exp
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
                                            {cand.medicalStatus === 'cleared' ? 'Medical Cleared' : 'Medical Pending'}
                                        </Text>
                                    </View>
                                </View>

                                {cand.summary && <Text style={styles.summaryText}>{cand.summary}</Text>}

                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => setSelectedCandidate(cand)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="chatbubble" size={16} color={Colors.white} />
                                    <Text style={styles.actionBtnText}>Inquire with Agency</Text>
                                </TouchableOpacity>
                            </View>
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
                                Sending message regarding {selectedCandidate.firstName} {selectedCandidate.lastName} to {selectedCandidate.agency?.name || 'the agency'}.
                            </Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Specify requirements, start date, or questions..."
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
                                    {inquiryMutation.isPending ? 'Submitting...' : 'Send Inquiry'}
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
    header: { paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    title: { fontSize: 24, fontWeight: '800', color: Colors.gray900 },
    searchContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 48,
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    searchInput: { flex: 1, color: Colors.gray900, fontSize: 15 },
    categoryScroll: { maxHeight: 44, marginBottom: Spacing.sm },
    categoryContent: { paddingHorizontal: Spacing.lg, gap: 8, alignItems: 'center' },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    categoryPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    categoryText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
    categoryTextActive: { color: Colors.white },
    loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 40 },
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: Colors.gray400, fontSize: 16 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray900 },
    agencyName: { fontSize: 13, color: Colors.gray500, marginTop: 2 },
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
        paddingVertical: 12,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
    },
    actionBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
    candidateHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: { color: Colors.white, fontWeight: '700', fontSize: 18 },
    statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: Colors.gray100 },
    statusCleared: { backgroundColor: Colors.success + '15' },
    statusPending: { backgroundColor: Colors.warning + '15' },
    statusTagText: { fontSize: 10, fontWeight: '700', color: Colors.gray600 },
    summaryText: { fontSize: 13, color: Colors.gray600, marginTop: 10, marginBottom: 10, lineHeight: 18 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, gap: Spacing.md },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray900 },
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
