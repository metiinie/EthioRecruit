import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vacancyService } from '../../services/vacancyService';

export default function AdminVacanciesScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

    const vacanciesQuery = useQuery({
        queryKey: ['admin', 'vacancies'],
        queryFn: () => vacancyService.getAdminVacancies({ perPage: 100 }),
    });

    // Refetch automatically on screen focus
    useFocusEffect(
        useCallback(() => {
            vacanciesQuery.refetch();
        }, [])
    );

    const handleRefresh = () => {
        vacanciesQuery.refetch();
    };

    const statusMutation = useMutation({
        mutationFn: (data: { id: string; status: string }) =>
            vacancyService.updateVacancyStatus(data.id, data.status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'vacancies'] });
            vacanciesQuery.refetch();
        },
        onError: (err: any) => {
            Alert.alert('Error', err.message || 'Failed to update vacancy status');
        },
    });

    const vacanciesList = Array.isArray(vacanciesQuery.data?.data)
        ? vacanciesQuery.data.data
        : (vacanciesQuery.data?.data?.data || []);

    const filteredVacancies = vacanciesList.filter((vac: any) => {
        const title = (vac.title || '').toLowerCase();
        const code = (vac.jobCode || '').toLowerCase();
        const country = (vac.country || '').toLowerCase();
        const partner = (vac.foreignAgencyPartner || '').toLowerCase();
        const q = searchQuery.toLowerCase().trim();

        const matchesSearch = !q || title.includes(q) || code.includes(q) || country.includes(q) || partner.includes(q);
        const matchesStatus = selectedStatusFilter === 'ALL' || (vac.status || '').toUpperCase() === selectedStatusFilter;

        return matchesSearch && matchesStatus;
    });

    const statusFilterChips = [
        { label: 'All Postings', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Paused', value: 'PAUSED' },
        { label: 'Closed', value: 'CLOSED' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Agency Vacancies</Text>
                    <Text style={styles.subTitle}>Overseas Job Listings & Employer Demand</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push('/(admin)/vacancies/new')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.addBtnText}>Post Vacancy</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search vacancy by title, job code, country, partner..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#64748B" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Status Filter Chips */}
            <View style={{ height: 44, marginBottom: 12 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {statusFilterChips.map((chip) => (
                        <TouchableOpacity
                            key={chip.value}
                            style={[styles.chip, selectedStatusFilter === chip.value && styles.chipActive]}
                            onPress={() => setSelectedStatusFilter(chip.value)}
                        >
                            <Text style={[styles.chipText, selectedStatusFilter === chip.value && styles.chipTextActive]}>
                                {chip.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Vacancies List Container */}
            {vacanciesQuery.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Loading job postings...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={vacanciesQuery.isRefetching}
                            onRefresh={handleRefresh}
                            colors={['#10B981', '#2563EB']}
                        />
                    }
                >
                    {filteredVacancies.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="briefcase-outline" size={60} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No job vacancies found</Text>
                            <Text style={styles.emptySub}>
                                {searchQuery ? 'No match found for your search query.' : 'No active or draft job vacancies posted yet.'}
                            </Text>
                            <TouchableOpacity
                                style={styles.createFirstBtn}
                                onPress={() => router.push('/(admin)/vacancies/new')}
                            >
                                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                                <Text style={styles.createFirstBtnText}>Post First Vacancy</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filteredVacancies.map((vac: any) => (
                            <View key={vac.id} style={styles.card}>
                                {/* Top Card Header */}
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                            {vac.jobCode ? (
                                                <Text style={styles.jobCodeBadge}>{vac.jobCode}</Text>
                                            ) : null}
                                            <Text style={styles.vacTitle}>{vac.title}</Text>
                                        </View>
                                        <Text style={styles.vacSub}>
                                            📍 {vac.country || 'Saudi Arabia'} {vac.city ? `(${vac.city})` : ''} • 💰 {vac.salaryCurrency || 'SAR'} {vac.salaryMin || 0} {vac.salaryMax ? `- ${vac.salaryMax}` : ''}
                                        </Text>
                                    </View>

                                    <View style={[
                                        styles.statusPill,
                                        vac.status === 'ACTIVE' ? styles.statusActive :
                                            vac.status === 'PAUSED' ? styles.statusPaused : styles.statusClosed
                                    ]}>
                                        <Text style={[
                                            styles.statusPillText,
                                            vac.status === 'ACTIVE' ? { color: '#059669' } :
                                                vac.status === 'PAUSED' ? { color: '#D97706' } : { color: '#DC2626' }
                                        ]}>
                                            {vac.status || 'ACTIVE'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Foreign Partner Agency */}
                                {vac.foreignAgencyPartner ? (
                                    <View style={styles.partnerRow}>
                                        <Ionicons name="business-outline" size={14} color="#64748B" />
                                        <Text style={styles.partnerText}>
                                            Foreign Partner: <Text style={{ color: '#0F172A', fontWeight: '700' }}>{vac.foreignAgencyPartner}</Text>
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Meta Benefits Chips */}
                                <View style={styles.metaRow}>
                                    {vac.contractPeriodYears ? (
                                        <View style={styles.metaChip}>
                                            <Ionicons name="calendar-outline" size={12} color="#475569" />
                                            <Text style={styles.metaChipText}>{vac.contractPeriodYears} Yrs Contract</Text>
                                        </View>
                                    ) : null}
                                    {vac.flightTicketProvided ? (
                                        <View style={[styles.metaChip, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                                            <Text style={[styles.metaChipText, { color: '#059669', fontWeight: '700' }]}>✈️ Flight Ticket</Text>
                                        </View>
                                    ) : null}
                                    {vac.accommodationProvided ? (
                                        <View style={[styles.metaChip, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                                            <Text style={[styles.metaChipText, { color: '#D97706', fontWeight: '700' }]}>🏠 Housing Incl.</Text>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Action Bar */}
                                <View style={styles.cardFooter}>
                                    {vac.status !== 'ACTIVE' && (
                                        <TouchableOpacity
                                            style={styles.btnPublish}
                                            onPress={() => statusMutation.mutate({ id: vac.id, status: 'ACTIVE' })}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="checkmark-circle-outline" size={15} color="#059669" />
                                            <Text style={styles.btnPublishText}>Publish</Text>
                                        </TouchableOpacity>
                                    )}

                                    {vac.status === 'ACTIVE' && (
                                        <TouchableOpacity
                                            style={styles.btnPause}
                                            onPress={() => statusMutation.mutate({ id: vac.id, status: 'PAUSED' })}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="pause-circle-outline" size={15} color="#D97706" />
                                            <Text style={styles.btnPauseText}>Pause</Text>
                                        </TouchableOpacity>
                                    )}

                                    {vac.status !== 'CLOSED' && (
                                        <TouchableOpacity
                                            style={styles.btnClose}
                                            onPress={() => statusMutation.mutate({ id: vac.id, status: 'CLOSED' })}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="close-circle-outline" size={15} color="#DC2626" />
                                            <Text style={styles.btnCloseText}>Close</Text>
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
    container: { flex: 1, backgroundColor: '#F8FAFC' }, // Light default theme
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 56,
        paddingHorizontal: 18,
        paddingBottom: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    title: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
    subTitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#10B981', // Brand Emerald Green
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        elevation: 1,
    },
    addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 18,
        marginTop: 14,
        marginBottom: 10,
        paddingHorizontal: 14,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: '#0F172A', fontSize: 14 },
    chipRow: { paddingHorizontal: 18, gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
    chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 18, gap: 14, paddingBottom: 40 },
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 30 },
    createFirstBtn: {
        marginTop: 14,
        backgroundColor: '#10B981',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    createFirstBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
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
        gap: 10,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    jobCodeBadge: {
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    vacTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    vacSub: { fontSize: 13, color: '#475569', marginTop: 4, fontWeight: '600' },
    partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    partnerText: { fontSize: 12, color: '#64748B' },
    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    statusActive: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
    statusPaused: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
    statusClosed: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
    statusPillText: { fontSize: 11, fontWeight: '800' },
    metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    metaChipText: { fontSize: 11, color: '#475569', fontWeight: '600' },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 4,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    btnPublish: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    btnPublishText: { color: '#059669', fontWeight: '800', fontSize: 12 },
    btnPause: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    btnPauseText: { color: '#D97706', fontWeight: '800', fontSize: 12 },
    btnClose: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    btnCloseText: { color: '#DC2626', fontWeight: '800', fontSize: 12 },
});
