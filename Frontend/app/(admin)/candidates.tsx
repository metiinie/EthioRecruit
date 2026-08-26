import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useQuery } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';

export default function AdminCandidatesScreen() {
    const router = useRouter();

    const candidatesQuery = useQuery({
        queryKey: ['admin', 'candidates'],
        queryFn: () => candidateService.getAdminCandidates(),
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Agency Roster</Text>
                    <Text style={styles.subTitle}>Ethiopian Agency Candidates & Medical Clearances</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push('/(admin)/candidates/new')}
                >
                    <Ionicons name="add" size={26} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {candidatesQuery.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent}>
                    {candidatesQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="people-outline" size={56} color={Colors.gray600} />
                            <Text style={styles.emptyText}>No candidates in agency roster</Text>
                            <TouchableOpacity
                                style={styles.createFirstBtn}
                                onPress={() => router.push('/(admin)/candidates/new')}
                            >
                                <Text style={styles.createFirstBtnText}>+ Add First Candidate</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        candidatesQuery.data?.data?.map((cand: any) => (
                            <View key={cand.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{cand.firstName?.[0]}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.candName}>
                                            {cand.firstName} {cand.middleName ? cand.middleName + ' ' : ''}{cand.lastName}
                                        </Text>
                                        {cand.fullNameAmharic ? (
                                            <Text style={styles.candAmharic}>{cand.fullNameAmharic}</Text>
                                        ) : null}
                                        <Text style={styles.candSub}>
                                            {cand.gender} • {cand.yearsOfExperience || 0} yrs exp • {cand.religion || 'N/A'}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.medBadge,
                                            cand.medicalStatus?.includes('PASSED')
                                                ? styles.medCleared
                                                : styles.medPending,
                                        ]}
                                    >
                                        <Text style={styles.medText}>{cand.medicalStatus || 'PENDING'}</Text>
                                    </View>
                                </View>

                                {/* Agency Meta Badges */}
                                <View style={styles.metaRow}>
                                    {cand.cocStatus ? (
                                        <View style={styles.metaChip}>
                                            <Text style={styles.chipText}>COC: {cand.cocStatus}</Text>
                                        </View>
                                    ) : null}
                                    {cand.passportNumber ? (
                                        <View style={styles.metaChip}>
                                            <Text style={styles.chipText}>Pass: {cand.passportNumber}</Text>
                                        </View>
                                    ) : null}
                                    {cand.hasOverseasExperience ? (
                                        <View style={[styles.metaChip, { backgroundColor: '#2B6CB020' }]}>
                                            <Text style={[styles.chipText, { color: '#2B6CB0' }]}>Gulf Experienced</Text>
                                        </View>
                                    ) : null}
                                </View>

                                {cand.summary ? (
                                    <Text style={styles.summaryText} numberOfLines={2}>
                                        {cand.summary}
                                    </Text>
                                ) : null}
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
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { color: Colors.white, fontWeight: '800', fontSize: 18 },
    candName: { fontSize: 16, fontWeight: '700', color: Colors.white },
    candAmharic: { fontSize: 13, color: Colors.accent, marginVertical: 1 },
    candSub: { fontSize: 12, color: Colors.gray400, marginTop: 2 },
    medBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
    medCleared: { backgroundColor: Colors.success + '20' },
    medPending: { backgroundColor: Colors.warning + '20' },
    medText: { fontSize: 11, fontWeight: '700', color: Colors.accent },
    metaRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
    metaChip: { backgroundColor: Colors.gray800, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
    chipText: { fontSize: 11, color: Colors.gray300, fontWeight: '600' },
    summaryText: { fontSize: 12, color: Colors.gray400, marginTop: 8, fontStyle: 'italic' },
});
