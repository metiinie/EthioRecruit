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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vacancyService } from '../../services/vacancyService';

export default function AdminVacanciesScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const vacanciesQuery = useQuery({
        queryKey: ['admin', 'vacancies'],
        queryFn: () => vacancyService.getAdminVacancies(),
    });

    const statusMutation = useMutation({
        mutationFn: (data: { id: string; status: string }) =>
            vacancyService.updateVacancyStatus(data.id, data.status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'vacancies'] });
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Agency Job Vacancies</Text>
                    <Text style={styles.subTitle}>Manage Overseas Job Postings & Terms</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push('/(admin)/vacancies/new')}
                >
                    <Ionicons name="add" size={26} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {vacanciesQuery.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent}>
                    {vacanciesQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="briefcase-outline" size={56} color={Colors.gray600} />
                            <Text style={styles.emptyText}>No job vacancies posted yet</Text>
                            <TouchableOpacity
                                style={styles.createFirstBtn}
                                onPress={() => router.push('/(admin)/vacancies/new')}
                            >
                                <Text style={styles.createFirstBtnText}>+ Post Agency Vacancy</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        vacanciesQuery.data?.data?.map((vac: any) => (
                            <View key={vac.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            {vac.jobCode ? (
                                                <Text style={styles.jobCodeBadge}>{vac.jobCode}</Text>
                                            ) : null}
                                            <Text style={styles.vacTitle}>{vac.title}</Text>
                                        </View>
                                        <Text style={styles.vacSub}>
                                            {vac.country} {vac.city ? `(${vac.city})` : ''} • {vac.salaryCurrency || 'SAR'} {vac.salaryMin} - {vac.salaryMax || vac.salaryMin}
                                        </Text>
                                    </View>
                                    <View style={styles.statusPill}>
                                        <Text style={styles.statusPillText}>{vac.status}</Text>
                                    </View>
                                </View>

                                {/* Foreign Partner & Agency Badges */}
                                {vac.foreignAgencyPartner ? (
                                    <Text style={styles.partnerText}>
                                        Foreign Partner: <Text style={{ color: Colors.white }}>{vac.foreignAgencyPartner}</Text>
                                    </Text>
                                ) : null}

                                <View style={styles.chipRow}>
                                    {vac.contractPeriodYears ? (
                                        <View style={styles.chip}>
                                            <Text style={styles.chipText}>{vac.contractPeriodYears} Yrs Contract</Text>
                                        </View>
                                    ) : null}
                                    {vac.flightTicketProvided ? (
                                        <View style={[styles.chip, { backgroundColor: '#31979520' }]}>
                                            <Text style={[styles.chipText, { color: '#319795' }]}>Flight Ticket Incl.</Text>
                                        </View>
                                    ) : null}
                                    {vac.accommodationProvided ? (
                                        <View style={[styles.chip, { backgroundColor: '#D69E2E20' }]}>
                                            <Text style={[styles.chipText, { color: '#D69E2E' }]}>Free Housing</Text>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Status Toggle Actions */}
                                <View style={styles.actionRow}>
                                    {vac.status !== 'ACTIVE' && (
                                        <TouchableOpacity
                                            style={styles.statusBtnActive}
                                            onPress={() => statusMutation.mutate({ id: vac.id, status: 'ACTIVE' })}
                                        >
                                            <Text style={styles.statusBtnText}>Publish</Text>
                                        </TouchableOpacity>
                                    )}
                                    {vac.status === 'ACTIVE' && (
                                        <TouchableOpacity
                                            style={styles.statusBtnPause}
                                            onPress={() => statusMutation.mutate({ id: vac.id, status: 'PAUSED' })}
                                        >
                                            <Text style={styles.statusBtnText}>Pause</Text>
                                        </TouchableOpacity>
                                    )}
                                    {vac.status !== 'CLOSED' && (
                                        <TouchableOpacity
                                            style={styles.statusBtnClose}
                                            onPress={() => statusMutation.mutate({ id: vac.id, status: 'CLOSED' })}
                                        >
                                            <Text style={styles.statusBtnText}>Close</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.primary },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    title: { fontSize: 24, fontWeight: '800', color: Colors.white },
    subTitle: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.lg, gap: Spacing.md },
    emptyBox: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { color: Colors.gray400, fontSize: 16 },
    createFirstBtn: { marginTop: 12, backgroundColor: Colors.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: BorderRadius.md },
    createFirstBtnText: { color: Colors.white, fontWeight: '700' },
    card: {
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray700,
        gap: 10,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    jobCodeBadge: { backgroundColor: Colors.accent, color: Colors.white, fontSize: 10, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    vacTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, flex: 1 },
    vacSub: { fontSize: 13, color: Colors.gray400, marginTop: 3 },
    partnerText: { fontSize: 12, color: Colors.gray400, fontStyle: 'italic' },
    statusPill: {
        backgroundColor: Colors.accent + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statusPillText: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
    chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    chip: { backgroundColor: Colors.gray800, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
    chipText: { fontSize: 11, color: Colors.gray300, fontWeight: '600' },
    actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    statusBtnActive: { backgroundColor: Colors.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    statusBtnPause: { backgroundColor: Colors.warning, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    statusBtnClose: { backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    statusBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
});
