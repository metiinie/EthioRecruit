import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { HeaderBar } from '../../components/HeaderBar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService } from '../../services/pipelineService';
import { candidateService } from '../../services/candidateService';

export default function ActivityScreen() {
    const router = useRouter();
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';
    const queryClient = useQueryClient();

    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'responded'>('all');
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [followUpMessage, setFollowUpMessage] = useState('');

    // Fetch Applications (Job Seeker mode)
    const applicationsQuery = useQuery({
        queryKey: ['activity', 'applications'],
        queryFn: () => activityService.getMyApplications(),
        enabled: isJobSeeker,
    });

    // Fetch Inquiries (Employer mode)
    const inquiriesQuery = useQuery({
        queryKey: ['activity', 'inquiries'],
        queryFn: () => activityService.getMyInquiries(),
        enabled: !isJobSeeker,
    });

    // Submit Inquiry Mutation
    const inquiryMutation = useMutation({
        mutationFn: (data: { candidateId: string; message: string }) =>
            candidateService.submitInquiry(data.candidateId, { message: data.message }),
        onSuccess: () => {
            Alert.alert('Inquiry Sent', 'Your follow-up inquiry has been submitted!');
            setSelectedCandidate(null);
            setFollowUpMessage('');
            queryClient.invalidateQueries({ queryKey: ['activity', 'inquiries'] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err.response?.data?.error?.message || 'Failed to send inquiry');
        },
    });

    const isLoading = isJobSeeker ? applicationsQuery.isLoading : inquiriesQuery.isLoading;
    const isRefetching = isJobSeeker ? applicationsQuery.isRefetching : inquiriesQuery.isRefetching;

    const handleRefresh = () => {
        if (isJobSeeker) applicationsQuery.refetch();
        else inquiriesQuery.refetch();
    };

    const allInquiries = inquiriesQuery.data?.data || [];
    const pendingCount = allInquiries.filter((inq: any) => !inq.responseMessage && inq.status !== 'RESOLVED').length;
    const respondedCount = allInquiries.filter((inq: any) => !!inq.responseMessage || inq.status === 'RESOLVED').length;

    let filteredInquiries = allInquiries;
    if (statusFilter === 'pending') {
        filteredInquiries = allInquiries.filter((inq: any) => !inq.responseMessage && inq.status !== 'RESOLVED');
    } else if (statusFilter === 'responded') {
        filteredInquiries = allInquiries.filter((inq: any) => !!inq.responseMessage || inq.status === 'RESOLVED');
    }

    return (
        <View style={styles.container}>
            {/* Top Header */}
            <HeaderBar
                title={isJobSeeker ? 'My Applications' : 'Inquiry Tracker'}
                subtitle={
                    isJobSeeker
                        ? 'Track overseas job applications'
                        : 'Track candidate inquiries sent to recruitment agencies'
                }
            />

            {/* Status Filter Chips for Employer */}
            {!isJobSeeker && (
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'all' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('all')}
                    >
                        <Text style={[styles.tabText, statusFilter === 'all' && styles.tabTextActive]}>
                            All ({allInquiries.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'pending' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('pending')}
                    >
                        <View style={styles.chipRow}>
                            {pendingCount > 0 && (
                                <View style={[styles.dotBadge, { backgroundColor: Colors.warning }]} />
                            )}
                            <Text style={[styles.tabText, statusFilter === 'pending' && styles.tabTextActive]}>
                                Pending ({pendingCount})
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'responded' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('responded')}
                    >
                        <View style={styles.chipRow}>
                            {respondedCount > 0 && (
                                <View style={[styles.dotBadge, { backgroundColor: Colors.accent }]} />
                            )}
                            <Text style={[styles.tabText, statusFilter === 'responded' && styles.tabTextActive]}>
                                Responded ({respondedCount})
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <View style={styles.loadingArea}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                    <Text style={styles.loadingText}>Loading inquiries...</Text>
                </View>
            ) : isJobSeeker ? (
                /* Job Seeker Applications List */
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={Colors.accent} />
                    }
                >
                    {applicationsQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="documents-outline" size={42} color={Colors.gray400} />
                            </View>
                            <Text style={styles.emptyTitle}>No Applications Submitted</Text>
                            <Text style={styles.emptySub}>Explore overseas vacancies and submit your application.</Text>
                            <TouchableOpacity
                                style={styles.browseBtn}
                                onPress={() => router.push('/(tabs)/browse' as any)}
                            >
                                <Text style={styles.browseBtnText}>Explore Vacancies</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        applicationsQuery.data?.data?.map((app: any) => (
                            <View key={app.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardTitle}>{app.vacancy?.title || 'Job Vacancy'}</Text>
                                        <Text style={styles.agencyText}>{app.vacancy?.agency?.name || 'EthioRecruit Agency'}</Text>
                                    </View>
                                    <View style={styles.statusBadgeTeal}>
                                        <Text style={styles.statusBadgeTealText}>{app.status.replace(/_/g, ' ')}</Text>
                                    </View>
                                </View>
                                <Text style={styles.dateText}>
                                    Applied on: {new Date(app.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            ) : (
                /* Employer Inquiries List */
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={Colors.accent} />
                    }
                >
                    {filteredInquiries.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="chatbubbles-outline" size={42} color={Colors.gray400} />
                            </View>
                            <Text style={styles.emptyTitle}>No Inquiries Found</Text>
                            <Text style={styles.emptySub}>
                                Inquiries submitted to agencies for domestic & skilled candidates will appear here.
                            </Text>
                            <TouchableOpacity
                                style={styles.browseBtn}
                                onPress={() => router.push('/(tabs)/browse' as any)}
                            >
                                <Text style={styles.browseBtnText}>Browse Candidates</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filteredInquiries.map((inq: any) => {
                            const hasReply = !!inq.responseMessage;
                            const cand = inq.candidate;

                            return (
                                <View key={inq.id} style={styles.card}>
                                    {/* Candidate & Agency Top Header Box */}
                                    <TouchableOpacity
                                        style={styles.candidateHeaderCard}
                                        onPress={() => cand?.id && router.push(`/candidate/${cand.id}` as any)}
                                        activeOpacity={0.8}
                                    >
                                        {cand?.photoUrl ? (
                                            <Image source={{ uri: cand.photoUrl }} style={styles.avatarImage} />
                                        ) : (
                                            <View style={styles.avatarCircle}>
                                                <Text style={styles.avatarInitial}>
                                                    {cand?.firstName?.[0] || 'C'}
                                                </Text>
                                            </View>
                                        )}

                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={styles.candidateName}>
                                                    {cand ? `${cand.firstName} ${cand.lastName}` : 'Candidate Profile'}
                                                </Text>
                                                {cand?.agency?.isVerified && (
                                                    <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                                                )}
                                            </View>
                                            <Text style={styles.candidateSub}>
                                                {cand?.category?.name || 'Domestic Worker'} • {cand?.agency?.name || 'Recruitment Agency'}
                                            </Text>
                                        </View>

                                        {/* Status Badge */}
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                hasReply ? styles.statusResponded : styles.statusPending,
                                            ]}
                                        >
                                            <Ionicons
                                                name={hasReply ? 'checkmark-circle' : 'time'}
                                                size={12}
                                                color={hasReply ? Colors.accentDark : Colors.warning}
                                            />
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    hasReply ? { color: Colors.accentDark } : { color: Colors.warning },
                                                ]}
                                            >
                                                {hasReply ? 'Responded' : 'Pending'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Inquiry Conversation Timeline */}
                                    <View style={styles.timelineContainer}>
                                        {/* Sent Message Bubble */}
                                        <View style={styles.sentMessageBox}>
                                            <View style={styles.bubbleHeader}>
                                                <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.gray600} />
                                                <Text style={styles.sentLabel}>Your Inquiry</Text>
                                                <Text style={styles.timestampText}>
                                                    {new Date(inq.createdAt).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <Text style={styles.messageText}>"{inq.message}"</Text>
                                        </View>

                                        {/* Agency Response Box / Pending Indicator */}
                                        {hasReply ? (
                                            <View style={styles.replyBox}>
                                                <View style={styles.replyHeader}>
                                                    <Ionicons name="business" size={15} color={Colors.accentDark} />
                                                    <Text style={styles.replyTitle}>
                                                        {cand?.agency?.name || 'Agency'} Response
                                                    </Text>
                                                    {inq.updatedAt && (
                                                        <Text style={styles.timestampText}>
                                                            {new Date(inq.updatedAt).toLocaleDateString()}
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text style={styles.replyText}>{inq.responseMessage}</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.awaitingBox}>
                                                <Ionicons name="time-outline" size={15} color={Colors.warning} />
                                                <Text style={styles.awaitingText}>
                                                    Awaiting agency feedback & availability confirmation...
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Action Bar Footer */}
                                    <View style={styles.cardFooter}>
                                        {cand?.id && (
                                            <TouchableOpacity
                                                style={styles.viewProfileBtn}
                                                onPress={() => router.push(`/candidate/${cand.id}` as any)}
                                                activeOpacity={0.8}
                                            >
                                                <Ionicons name="person" size={13} color={Colors.primary} />
                                                <Text style={styles.viewProfileBtnText}>View Full Profile</Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            style={styles.followUpBtn}
                                            onPress={() => setSelectedCandidate(cand)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="paper-plane" size={13} color={Colors.white} />
                                            <Text style={styles.followUpBtnText}>Inquire Again</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}

            {/* Follow-up Inquiry Modal */}
            {selectedCandidate && (
                <Modal visible transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Follow-up Inquiry</Text>
                                <TouchableOpacity onPress={() => setSelectedCandidate(null)}>
                                    <Ionicons name="close" size={24} color={Colors.gray500} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSub}>
                                Send follow-up note regarding {selectedCandidate.firstName} {selectedCandidate.lastName} to {selectedCandidate.agency?.name || 'the agency'}.
                            </Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Write your follow-up message or updated start date..."
                                placeholderTextColor={Colors.gray400}
                                multiline
                                numberOfLines={4}
                                value={followUpMessage}
                                onChangeText={setFollowUpMessage}
                            />
                            <TouchableOpacity
                                style={[styles.modalSubmit, inquiryMutation.isPending && { opacity: 0.6 }]}
                                onPress={() =>
                                    inquiryMutation.mutate({
                                        candidateId: selectedCandidate.id,
                                        message: followUpMessage,
                                    })
                                }
                                disabled={inquiryMutation.isPending}
                            >
                                <Text style={styles.modalSubmitText}>
                                    {inquiryMutation.isPending ? 'Sending...' : 'Submit Inquiry'}
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
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: 8,
    },
    tabChip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    tabChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dotBadge: { width: 6, height: 6, borderRadius: 3 },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.gray600,
    },
    tabTextActive: {
        color: Colors.white,
        fontWeight: '700',
    },
    loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: Colors.gray600, fontSize: 14, fontWeight: '600' },
    listContent: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 120 },
    emptyBox: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray200,
        marginTop: Spacing.md,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyTitle: { color: Colors.gray900, fontSize: 18, fontWeight: '800' },
    emptySub: { color: Colors.gray500, fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 18 },
    browseBtn: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: BorderRadius.xl,
        marginTop: 16,
    },
    browseBtnText: { color: Colors.white, fontWeight: '800', fontSize: 13 },

    /* Card */
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
    candidateHeaderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray100,
    },
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
    candidateName: { fontSize: 15, fontWeight: '800', color: Colors.gray900 },
    candidateSub: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statusResponded: { backgroundColor: Colors.accent + '15' },
    statusPending: { backgroundColor: Colors.warning + '15' },
    statusText: { fontSize: 11, fontWeight: '800' },

    /* Conversation Timeline */
    timelineContainer: {
        paddingVertical: 10,
        gap: 8,
    },
    sentMessageBox: {
        backgroundColor: Colors.gray50,
        padding: 10,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    bubbleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    sentLabel: { fontSize: 11, fontWeight: '800', color: Colors.gray600, flex: 1 },
    timestampText: { fontSize: 10, color: Colors.gray400, fontWeight: '600' },
    messageText: { color: Colors.gray800, fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
    replyBox: {
        backgroundColor: Colors.accent + '10',
        padding: 12,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.accent + '35',
    },
    replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    replyTitle: { fontSize: 12, fontWeight: '800', color: Colors.accentDark, flex: 1 },
    replyText: { fontSize: 13, color: Colors.gray900, lineHeight: 18, fontWeight: '500' },
    awaitingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.warning + '10',
        padding: 10,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.warning + '25',
    },
    awaitingText: { fontSize: 12, color: Colors.warning + 'E0', fontWeight: '600' },

    /* Action Footer */
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 8,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.gray100,
    },
    viewProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray100,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    viewProfileBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    followUpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.accent,
    },
    followUpBtnText: { fontSize: 12, fontWeight: '800', color: Colors.white },

    /* Job Seeker Application Card */
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.gray900 },
    agencyText: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
    statusBadgeTeal: { backgroundColor: Colors.accent + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusBadgeTealText: { fontSize: 11, fontWeight: '800', color: Colors.accentDark },
    dateText: { fontSize: 11, color: Colors.gray400, marginTop: 8 },

    /* Modal */
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
