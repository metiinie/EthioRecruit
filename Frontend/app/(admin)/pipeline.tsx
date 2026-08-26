import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService } from '../../services/pipelineService';

const STAGES = [
    { key: 'APPLIED', title: 'Applied', color: '#2563EB', bgColor: '#EFF6FF' },
    { key: 'SHORTLISTED', title: 'Shortlisted', color: '#8B5CF6', bgColor: '#F3E8FF' },
    { key: 'INTERVIEW', title: 'Interview', color: '#D97706', bgColor: '#FEF3C7' },
    { key: 'SELECTED', title: 'Selected', color: '#10B981', bgColor: '#ECFDF5' },
    { key: 'DEPLOYED', title: 'Deployed', color: '#0891B2', bgColor: '#E0F2FE' },
];

export default function AdminPipelineScreen() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('APPLIED');

    const kanbanQuery = useQuery({
        queryKey: ['admin', 'kanban'],
        queryFn: () => pipelineService.getKanbanBoard(),
    });

    // Automatically refetch on focus
    useFocusEffect(
        useCallback(() => {
            kanbanQuery.refetch();
        }, [])
    );

    const handleRefresh = () => {
        kanbanQuery.refetch();
    };

    const moveStageMutation = useMutation({
        mutationFn: (data: { appId: string; nextStage: string }) =>
            pipelineService.moveStage(data.appId, data.nextStage),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'kanban'] });
            kanbanQuery.refetch();
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

    const getPrevStage = (current: string) => {
        const idx = STAGES.findIndex((s) => s.key === current);
        if (idx > 0) {
            return STAGES[idx - 1].key;
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Recruitment Pipeline</Text>
                <Text style={styles.subTitle}>5-Stage Applicant Tracking System (ATS)</Text>
            </View>

            {/* Stage Column Selector Bar */}
            <View style={{ height: 48, marginBottom: 10, marginTop: 12 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.stageContent}
                >
                    {STAGES.map((stg) => {
                        const count = kanbanData[stg.key]?.length || 0;
                        const isActive = activeTab === stg.key;
                        return (
                            <TouchableOpacity
                                key={stg.key}
                                style={[
                                    styles.stagePill,
                                    isActive && { backgroundColor: stg.color, borderColor: stg.color },
                                ]}
                                onPress={() => setActiveTab(stg.key)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.stagePillText, isActive && { color: '#FFFFFF' }]}>
                                    {stg.title}
                                </Text>
                                <View style={[
                                    styles.badge,
                                    isActive ? { backgroundColor: 'rgba(255,255,255,0.3)' } : { backgroundColor: '#F1F5F9' }
                                ]}>
                                    <Text style={[styles.badgeText, isActive ? { color: '#FFFFFF' } : { color: '#475569' }]}>
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Kanban Items List */}
            {kanbanQuery.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Loading recruitment pipeline...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={kanbanQuery.isRefetching}
                            onRefresh={handleRefresh}
                            colors={['#10B981', '#2563EB']}
                        />
                    }
                >
                    {currentStageApps.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="git-branch-outline" size={60} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No candidates in {activeTab}</Text>
                            <Text style={styles.emptySub}>
                                As applications advance through recruitment, candidates will move into this stage.
                            </Text>
                        </View>
                    ) : (
                        currentStageApps.map((app: any) => {
                            const nextStage = getNextStage(app.status);
                            const prevStage = getPrevStage(app.status);
                            const currentStageObj = STAGES.find((s) => s.key === app.status);

                            return (
                                <View key={app.id} style={styles.card}>
                                    {/* Top Info */}
                                    <View style={styles.cardHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.applicantName}>
                                                {app.user?.firstName || 'Applicant'} {app.user?.lastName || ''}
                                            </Text>
                                            <Text style={styles.vacancyTitle}>
                                                💼 {app.vacancy?.title || 'General Application'} {app.vacancy?.country ? `(${app.vacancy.country})` : ''}
                                            </Text>
                                            {app.user?.phone ? (
                                                <Text style={styles.phoneText}>📞 {app.user.phone}</Text>
                                            ) : null}
                                        </View>

                                        <View style={[styles.stageBadge, { backgroundColor: currentStageObj?.bgColor || '#EFF6FF' }]}>
                                            <Text style={[styles.stageBadgeText, { color: currentStageObj?.color || '#2563EB' }]}>
                                                {currentStageObj?.title || app.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Action Buttons Row */}
                                    <View style={styles.cardFooter}>
                                        {prevStage && (
                                            <TouchableOpacity
                                                style={styles.backBtn}
                                                onPress={() => moveStageMutation.mutate({ appId: app.id, nextStage: prevStage })}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="arrow-back" size={14} color="#64748B" />
                                                <Text style={styles.backBtnText}>
                                                    Move Back
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {nextStage && (
                                            <TouchableOpacity
                                                style={styles.advanceBtn}
                                                onPress={() => moveStageMutation.mutate({ appId: app.id, nextStage })}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.advanceBtnText}>
                                                    Advance to {STAGES.find((s) => s.key === nextStage)?.title}
                                                </Text>
                                                <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
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
    container: { flex: 1, backgroundColor: '#F8FAFC' }, // Light default theme
    header: {
        paddingTop: 56,
        paddingHorizontal: 18,
        paddingBottom: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    title: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
    subTitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
    stageContent: { paddingHorizontal: 18, gap: 8, alignItems: 'center' },
    stagePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    stagePillText: { fontSize: 12, fontWeight: '700', color: '#475569' },
    badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
    badgeText: { fontSize: 11, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 18, gap: 14, paddingBottom: 40 },
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 30 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        gap: 12,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    applicantName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    vacancyTitle: { fontSize: 13, color: '#2563EB', marginTop: 3, fontWeight: '600' },
    phoneText: { fontSize: 12, color: '#64748B', marginTop: 4 },
    stageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    stageBadgeText: { fontSize: 11, fontWeight: '800' },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
    },
    backBtnText: { color: '#64748B', fontWeight: '700', fontSize: 12 },
    advanceBtn: {
        backgroundColor: '#10B981', // Brand Emerald Green
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    advanceBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
});
