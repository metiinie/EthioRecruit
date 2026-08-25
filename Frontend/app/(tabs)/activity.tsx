import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { activityService } from '../../services/pipelineService';

export default function ActivityScreen() {
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isJobSeeker ? 'My Applications' : 'My Inquiries'}
                </Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingArea}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                </View>
            ) : isJobSeeker ? (
                /* Applications List */
                <ScrollView contentContainerStyle={styles.listContent}>
                    {applicationsQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="documents-outline" size={48} color={Colors.gray300} />
                            <Text style={styles.emptyTitle}>No applications submitted yet</Text>
                        </View>
                    ) : (
                        applicationsQuery.data?.data?.map((app: any) => (
                            <View key={app.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{app.vacancy?.title}</Text>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{app.status.replace(/_/g, ' ')}</Text>
                                    </View>
                                </View>
                                <Text style={styles.agencyText}>{app.vacancy?.agency?.name}</Text>
                                <Text style={styles.dateText}>
                                    Applied on: {new Date(app.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            ) : (
                /* Inquiries List */
                <ScrollView contentContainerStyle={styles.listContent}>
                    {inquiriesQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="chatbubbles-outline" size={48} color={Colors.gray300} />
                            <Text style={styles.emptyTitle}>No inquiries submitted yet</Text>
                        </View>
                    ) : (
                        inquiriesQuery.data?.data?.map((inq: any) => (
                            <View key={inq.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>
                                        {inq.candidate?.firstName} {inq.candidate?.lastName}
                                    </Text>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{inq.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.messageText}>"{inq.message}"</Text>
                                {inq.responseMessage && (
                                    <View style={styles.replyBox}>
                                        <Text style={styles.replyTitle}>Agency Response:</Text>
                                        <Text style={styles.replyText}>{inq.responseMessage}</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
    title: { fontSize: 24, fontWeight: '800', color: Colors.gray900 },
    loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.lg, gap: Spacing.md },
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyTitle: { color: Colors.gray400, fontSize: 16 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray900 },
    statusBadge: { backgroundColor: Colors.accent + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
    statusText: { color: Colors.accentDark, fontSize: 12, fontWeight: '700' },
    agencyText: { color: Colors.gray600, fontSize: 13 },
    dateText: { color: Colors.gray400, fontSize: 12 },
    messageText: { color: Colors.gray700, fontSize: 14, fontStyle: 'italic' },
    replyBox: { backgroundColor: Colors.gray50, padding: 10, borderRadius: 8, marginTop: 4 },
    replyTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray700 },
    replyText: { fontSize: 13, color: Colors.gray600, marginTop: 2 },
});
