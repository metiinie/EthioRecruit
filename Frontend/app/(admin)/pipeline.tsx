import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService } from '../../services/pipelineService';

const STAGES = [
    { key: 'APPLIED', title: 'Applied', color: '#3B82F6' },
    { key: 'SHORTLISTED', title: 'Shortlisted', color: '#8B5CF6' },
    { key: 'INTERVIEW', title: 'Interview', color: '#F59E0B' },
    { key: 'SELECTED', title: 'Selected', color: '#10B981' },
    { key: 'DEPLOYED', title: 'Deployed', color: '#06B6D4' },
];

export default function AdminPipelineScreen() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('APPLIED');

    const kanbanQuery = useQuery({
        queryKey: ['admin', 'kanban'],
        queryFn: () => pipelineService.getKanbanBoard(),
    });

    const moveStageMutation = useMutation({
        mutationFn: (data: { appId: string; nextStage: string }) =>
            pipelineService.moveStage(data.appId, data.nextStage),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'kanban'] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err.response?.data?.error?.message || 'Failed to move candidate');
        },
    });

    const kanbanData = kanbanQuery.data?.data || {};
    const currentStageApps = kanbanData[activeTab] || [];

    const getNextStage = (current: string) => {
        const idx = STAGES.findIndex((s) => s.key === current);
        if (idx !== -1 && idx < STAGES.length - 1) {
            return STAGES[idx + 1].key;
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recruitment Pipeline</Text>
                <Text style={styles.subTitle}>5-stage ATS Kanban Board</Text>
            </View>

            {/* Stage Column Selector Bar */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.stageBar}
                contentContainerStyle={styles.stageContent}
            >
                {STAGES.map((stg) => {
                    const count = kanbanData[stg.key]?.length || 0;
                    return (
                        <TouchableOpacity
                            key={stg.key}
                            style={[
                                styles.stagePill,
                                activeTab === stg.key && { backgroundColor: stg.color },
                            ]}
                            onPress={() => setActiveTab(stg.key)}
                        >
                            <Text
                                style={[
                                    styles.stagePillText,
                                    activeTab === stg.key && { color: Colors.white },
                                ]}
                            >
                                {stg.title} ({count})
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Kanban Items List */}
            {kanbanQuery.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent}>
                    {currentStageApps.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="git-branch-outline" size={48} color={Colors.gray600} />
                            <Text style={styles.emptyText}>No candidates in {activeTab}</Text>
                        </View>
                    ) : (
                        currentStageApps.map((app: any) => {
                            const nextStage = getNextStage(app.status);
                            return (
                                <View key={app.id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.applicantName}>
                                                {app.user?.firstName} {app.user?.lastName}
                                            </Text>
                                            <Text style={styles.vacancyTitle}>
                                                Applied for: {app.vacancy?.title} ({app.vacancy?.country})
                                            </Text>
                                            <Text style={styles.phoneText}>Phone: {app.user?.phone}</Text>
                                        </View>
                                    </View>

                                    {nextStage && (
                                        <TouchableOpacity
                                            style={styles.advanceBtn}
                                            onPress={() =>
                                                moveStageMutation.mutate({ appId: app.id, nextStage })
                                            }
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.advanceBtnText}>
                                                Advance to {STAGES.find((s) => s.key === nextStage)?.title}
                                            </Text>
                                            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                                        </TouchableOpacity>
                                    )}
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
    container: { flex: 1, backgroundColor: Colors.primary },
    header: {
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    title: { fontSize: 24, fontWeight: '800', color: Colors.white },
    subTitle: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
    stageBar: { maxHeight: 44, marginBottom: Spacing.sm },
    stageContent: { paddingHorizontal: Spacing.lg, gap: 8, alignItems: 'center' },
    stagePill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primaryLight,
        borderWidth: 1,
        borderColor: Colors.gray700,
    },
    stagePillText: { fontSize: 13, fontWeight: '700', color: Colors.gray400 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.lg, gap: Spacing.md },
    emptyBox: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { color: Colors.gray400, fontSize: 16 },
    card: {
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray700,
        gap: 12,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    applicantName: { fontSize: 16, fontWeight: '700', color: Colors.white },
    vacancyTitle: { fontSize: 13, color: Colors.accent, marginTop: 2 },
    phoneText: { fontSize: 12, color: Colors.gray400, marginTop: 4 },
    advanceBtn: {
        backgroundColor: Colors.accent,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    advanceBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
});
