import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { HeaderBar } from '../../components/HeaderBar';
import { useQuery } from '@tanstack/react-query';
import { activityService } from '../../services/pipelineService';

export default function ActivityScreen() {
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'responded'>('all');

    const applicationsQuery = useQuery({
        queryKey: ['activity', 'applications'],
        queryFn: () => activityService.getMyApplications(),
        enabled: isJobSeeker,
    });

    const inquiriesQuery = useQuery({
        queryKey: ['activity', 'inquiries'],
        queryFn: () => activityService.getMyInquiries(),
        enabled: !isJobSeeker,
    });

    const isLoading = isJobSeeker ? applicationsQuery.isLoading : inquiriesQuery.isLoading;

    let rawInquiries = inquiriesQuery.data?.data || [];
    if (statusFilter === 'pending') {
        rawInquiries = rawInquiries.filter((inq: any) => !inq.responseMessage && inq.status !== 'RESOLVED');
    } else if (statusFilter === 'responded') {
        rawInquiries = rawInquiries.filter((inq: any) => !!inq.responseMessage || inq.status === 'RESOLVED');
    }

    return (
        <View style={styles.container}>
            {/* Top Header */}
            <HeaderBar
                title={isJobSeeker ? 'My Applications' : 'My Inquiries'}
                subtitle={
                    isJobSeeker
                        ? 'Track overseas job applications'
                        : 'Track candidate inquiries sent to agencies'
                }
            />

            {/* Filter Tabs for Employer */}
            {!isJobSeeker && (
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'all' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('all')}
                    >
                        <Text style={[styles.tabText, statusFilter === 'all' && styles.tabTextActive]}>
                            All ({inquiriesQuery.data?.data?.length || 0})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'pending' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('pending')}
                    >
                        <Text style={[styles.tabText, statusFilter === 'pending' && styles.tabTextActive]}>
                            Pending Response
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabChip, statusFilter === 'responded' && styles.tabChipActive]}
                        onPress={() => setStatusFilter('responded')}
                    >
                        <Text style={[styles.tabText, statusFilter === 'responded' && styles.tabTextActive]}>
                            Agency Responded
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <View style={styles.loadingArea}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                </View>
            ) : isJobSeeker ? (
                /* Applications List */
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {applicationsQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="documents-outline" size={48} color={Colors.gray300} />
                            <Text style={styles.emptyTitle}>No applications submitted yet</Text>
                        </View>
                    ) : (
                        applicationsQuery.data?.data?.map((app: any) => (
                            <View key={app.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{app.vacancy?.title || 'Job Vacancy'}</Text>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{app.status.replace(/_/g, ' ')}</Text>
                                    </View>
                                </View>
                                <Text style={styles.agencyText}>{app.vacancy?.agency?.name || 'EthioRecruit Agency'}</Text>
                                <Text style={styles.dateText}>
                                    Applied on: {new Date(app.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            ) : (
                /* Inquiries List */
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {rawInquiries.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="chatbubbles-outline" size={48} color={Colors.gray300} />
                            <Text style={styles.emptyTitle}>No inquiries match this filter</Text>
                            <Text style={styles.emptySub}>
                                Inquiries sent to agencies for candidate hiring will appear here.
                            </Text>
                        </View>
                    ) : (
                        rawInquiries.map((inq: any) => {
                            const hasReply = !!inq.responseMessage;

                            return (
                                <View key={inq.id} style={styles.card}>
                                    {/* Header Row */}
                                    <View style={styles.cardHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.cardTitle}>
                                                Candidate: {inq.candidate?.firstName} {inq.candidate?.lastName}
                                            </Text>
                                            <Text style={styles.agencyText}>
                                                Agency: {inq.candidate?.agency?.name || 'Recruitment Agency'}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                hasReply ? styles.statusResponded : styles.statusPending,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    hasReply ? { color: Colors.accentDark } : { color: Colors.warning },
                                                ]}
                                            >
                                                {hasReply ? 'Agency Responded' : 'Pending Reply'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Sent Message */}
                                    <View style={styles.sentMessageBox}>
                                        <Text style={styles.sentLabel}>Your Inquiry:</Text>
                                        <Text style={styles.messageText}>"{inq.message}"</Text>
                                    </View>

                                    {/* Response Box */}
                                    {hasReply ? (
                                        <View style={styles.replyBox}>
                                            <View style={styles.replyHeader}>
                                                <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                                                <Text style={styles.replyTitle}>Agency Reply</Text>
                                            </View>
                                            <Text style={styles.replyText}>{inq.responseMessage}</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.awaitingBox}>
                                            <Ionicons name="time-outline" size={14} color={Colors.gray500} />
                                            <Text style={styles.awaitingText}>
                                                Awaiting agency feedback on candidate status
                                            </Text>
                                        </View>
                                    )}

                                    <Text style={styles.dateText}>
                                        Sent: {new Date(inq.createdAt).toLocaleDateString()} at{' '}
                                        {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
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
    listContent: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 40 },
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 8 },
    emptyTitle: { color: Colors.gray800, fontSize: 16, fontWeight: '700' },
    emptySub: { color: Colors.gray400, fontSize: 13, textAlign: 'center', maxWidth: 260 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.gray900 },
    agencyText: { color: Colors.gray500, fontSize: 12, marginTop: 2 },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statusResponded: {
        backgroundColor: Colors.accent + '20',
    },
    statusPending: {
        backgroundColor: Colors.warning + '20',
    },
    statusText: { fontSize: 11, fontWeight: '800' },
    sentMessageBox: {
        backgroundColor: Colors.gray50,
        padding: 10,
        borderRadius: BorderRadius.md,
        borderLeftWidth: 3,
        borderLeftColor: Colors.gray300,
    },
    sentLabel: { fontSize: 11, fontWeight: '700', color: Colors.gray500, marginBottom: 2 },
    messageText: { color: Colors.gray800, fontSize: 13, fontStyle: 'italic' },
    replyBox: {
        backgroundColor: Colors.accent + '10',
        padding: 12,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.accent + '30',
    },
    replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    replyTitle: { fontSize: 12, fontWeight: '800', color: Colors.accentDark },
    replyText: { fontSize: 13, color: Colors.gray800, lineHeight: 18 },
    awaitingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.gray50,
        padding: 8,
        borderRadius: BorderRadius.sm,
    },
    awaitingText: { fontSize: 12, color: Colors.gray500 },
    dateText: { color: Colors.gray400, fontSize: 11, alignSelf: 'flex-end', marginTop: 2 },
});
