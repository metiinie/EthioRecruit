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
    Image,
    Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';

export default function AdminCandidatesScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Form state for candidate editing modal
    const [editForm, setEditForm] = useState({
        medicalStatus: 'PENDING',
        cocStatus: 'PENDING',
        visaStatus: 'NO_VISA',
        appliedPosition: '',
        expectedSalary: '',
    });

    const candidatesQuery = useQuery({
        queryKey: ['admin', 'candidates'],
        queryFn: () => candidateService.getAdminCandidates({ perPage: 100 }),
    });

    // Automatically refetch candidates list whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            candidatesQuery.refetch();
        }, [])
    );

    const handleRefresh = () => {
        candidatesQuery.refetch();
    };

    const handleDeleteCandidate = (cand: any) => {
        Alert.alert(
            'Delete Candidate',
            `Are you sure you want to remove ${cand.firstName} ${cand.lastName} from the agency roster?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await candidateService.softDeleteCandidate(cand.id);
                            Alert.alert('Success', 'Candidate removed successfully');
                            queryClient.invalidateQueries({ queryKey: ['admin', 'candidates'] });
                            candidatesQuery.refetch();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete candidate');
                        }
                    },
                },
            ]
        );
    };

    const openEditModal = (cand: any) => {
        setSelectedCandidate(cand);
        setEditForm({
            medicalStatus: cand.medicalStatus || 'PENDING',
            cocStatus: cand.cocStatus || 'PENDING',
            visaStatus: cand.visaStatus || 'NO_VISA',
            appliedPosition: cand.appliedPosition || '',
            expectedSalary: cand.expectedSalary ? String(cand.expectedSalary) : '',
        });
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedCandidate) return;
        setUpdating(true);
        try {
            await candidateService.updateCandidate(selectedCandidate.id, {
                medicalStatus: editForm.medicalStatus,
                cocStatus: editForm.cocStatus,
                visaStatus: editForm.visaStatus,
                appliedPosition: editForm.appliedPosition || undefined,
                expectedSalary: editForm.expectedSalary ? parseInt(editForm.expectedSalary, 10) : undefined,
            });
            Alert.alert('Success', 'Candidate record updated');
            setEditModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin', 'candidates'] });
            candidatesQuery.refetch();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update candidate');
        } finally {
            setUpdating(false);
        }
    };

    // Filter candidate items by search query and category
    const candidatesList = Array.isArray(candidatesQuery.data?.data)
        ? candidatesQuery.data.data
        : (candidatesQuery.data?.data?.data || []);

    const filteredCandidates = candidatesList.filter((cand: any) => {
        const fullName = `${cand.firstName || ''} ${cand.middleName || ''} ${cand.lastName || ''}`.toLowerCase();
        const amharicName = (cand.fullNameAmharic || '').toLowerCase();
        const passport = (cand.passportNumber || '').toLowerCase();
        const q = searchQuery.toLowerCase().trim();

        const matchesSearch = !q || fullName.includes(q) || amharicName.includes(q) || passport.includes(q);
        const matchesCategory = selectedCategory === 'ALL' || (cand.category?.name || cand.appliedPosition || '').toUpperCase().includes(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    const categoryChips = [
        { label: 'All Candidates', value: 'ALL' },
        { label: 'Housemaid', value: 'HOUSEMAID' },
        { label: 'Driver', value: 'DRIVER' },
        { label: 'Cook', value: 'COOK' },
        { label: 'Caregiver', value: 'CAREGIVER' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Agency Candidates</Text>
                    <Text style={styles.subTitle}>Ethiopian Overseas Recruitment Roster</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push('/(admin)/candidates/new')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.addBtnText}>Add Candidate</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search candidate by name, Amharic name, passport..."
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

            {/* Category Filter Chips */}
            <View style={{ height: 44, marginBottom: 12 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {categoryChips.map((chip) => (
                        <TouchableOpacity
                            key={chip.value}
                            style={[styles.chip, selectedCategory === chip.value && styles.chipActive]}
                            onPress={() => setSelectedCategory(chip.value)}
                        >
                            <Text style={[styles.chipText, selectedCategory === chip.value && styles.chipTextActive]}>
                                {chip.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Candidate List Container */}
            {candidatesQuery.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Loading agency roster...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={candidatesQuery.isRefetching}
                            onRefresh={handleRefresh}
                            colors={['#10B981', '#2563EB']}
                        />
                    }
                >
                    {filteredCandidates.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="people-outline" size={60} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No candidates found</Text>
                            <Text style={styles.emptySub}>
                                {searchQuery ? 'No match found for your search query.' : 'No candidates registered in agency roster yet.'}
                            </Text>
                            <TouchableOpacity
                                style={styles.createFirstBtn}
                                onPress={() => router.push('/(admin)/candidates/new')}
                            >
                                <Ionicons name="person-add" size={18} color="#FFFFFF" />
                                <Text style={styles.createFirstBtnText}>Add New Candidate</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filteredCandidates.map((cand: any) => (
                            <View key={cand.id} style={styles.card}>
                                {/* Top Candidate Row */}
                                <View style={styles.cardHeader}>
                                    {cand.photoUrl ? (
                                        <Image source={{ uri: cand.photoUrl }} style={styles.avatarImage} />
                                    ) : (
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>{cand.firstName?.[0] || 'C'}</Text>
                                        </View>
                                    )}

                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.candName}>
                                            {cand.firstName} {cand.middleName ? cand.middleName + ' ' : ''}{cand.lastName}
                                        </Text>
                                        {cand.fullNameAmharic ? (
                                            <Text style={styles.candAmharic}>{cand.fullNameAmharic}</Text>
                                        ) : null}
                                        <Text style={styles.candSub}>
                                            {cand.gender ? cand.gender.toUpperCase() : 'FEMALE'} • {cand.appliedPosition || 'Housemaid'} • {cand.yearsOfExperience || 0} yrs exp
                                        </Text>
                                    </View>

                                    {/* Top Right Actions Group (Medical Badge + Clear Edit & Trash Icons) */}
                                    <View style={styles.topRightHeaderGroup}>
                                        <View style={[
                                            styles.medBadge,
                                            cand.medicalStatus === 'PASSED' ? styles.medCleared : styles.medPending
                                        ]}>
                                            <Text style={[
                                                styles.medText,
                                                cand.medicalStatus === 'PASSED' ? { color: '#059669' } : { color: '#D97706' }
                                            ]}>
                                                Med: {cand.medicalStatus || 'PENDING'}
                                            </Text>
                                        </View>

                                        <View style={styles.iconActionsRow}>
                                            <TouchableOpacity
                                                style={styles.topActionIconBtn}
                                                onPress={() => openEditModal(cand)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="create-outline" size={18} color="#2563EB" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.topActionIconBtn, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}
                                                onPress={() => handleDeleteCandidate(cand)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Meta Tags */}
                                <View style={styles.metaRow}>
                                    {cand.passportNumber ? (
                                        <View style={styles.metaChip}>
                                            <Ionicons name="card-outline" size={12} color="#475569" />
                                            <Text style={styles.metaChipText}>Pass: {cand.passportNumber}</Text>
                                        </View>
                                    ) : null}
                                    {cand.cocStatus ? (
                                        <View style={styles.metaChip}>
                                            <Ionicons name="ribbon-outline" size={12} color="#475569" />
                                            <Text style={styles.metaChipText}>COC: {cand.cocStatus}</Text>
                                        </View>
                                    ) : null}
                                    {cand.originRegion ? (
                                        <View style={styles.metaChip}>
                                            <Ionicons name="location-outline" size={12} color="#475569" />
                                            <Text style={styles.metaChipText}>{cand.originRegion}</Text>
                                        </View>
                                    ) : null}
                                    {cand.hasOverseasExperience ? (
                                        <View style={[styles.metaChip, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                                            <Text style={[styles.metaChipText, { color: '#1D4ED8', fontWeight: '700' }]}>✈️ Gulf Exp</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Edit Candidate Status Modal */}
            <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Edit {selectedCandidate?.firstName} {selectedCandidate?.lastName}
                            </Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Medical Status</Text>
                        <View style={styles.optionRow}>
                            {['PENDING', 'PASSED', 'FAILED'].map((st) => (
                                <TouchableOpacity
                                    key={st}
                                    style={[styles.optionPill, editForm.medicalStatus === st && styles.optionPillActive]}
                                    onPress={() => setEditForm({ ...editForm, medicalStatus: st })}
                                >
                                    <Text style={[styles.optionText, editForm.medicalStatus === st && styles.optionTextActive]}>{st}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalLabel}>COC Status</Text>
                        <View style={styles.optionRow}>
                            {['PENDING', 'LEVEL_1', 'LEVEL_2', 'PASSED'].map((st) => (
                                <TouchableOpacity
                                    key={st}
                                    style={[styles.optionPill, editForm.cocStatus === st && styles.optionPillActive]}
                                    onPress={() => setEditForm({ ...editForm, cocStatus: st })}
                                >
                                    <Text style={[styles.optionText, editForm.cocStatus === st && styles.optionTextActive]}>{st}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalLabel}>Applied Position</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Housemaid, Driver"
                            value={editForm.appliedPosition}
                            onChangeText={(val) => setEditForm({ ...editForm, appliedPosition: val })}
                        />

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveBtn, updating && { opacity: 0.6 }]}
                                onPress={handleSaveEdit}
                                disabled={updating}
                            >
                                {updating ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    avatarImage: { width: 48, height: 48, borderRadius: 24 },
    avatarText: { color: '#059669', fontWeight: '900', fontSize: 18 },
    candName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    candAmharic: { fontSize: 13, color: '#10B981', fontWeight: '700', marginTop: 1 },
    candSub: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
    topRightHeaderGroup: { alignItems: 'flex-end', gap: 6 },
    iconActionsRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
    topActionIconBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    medBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    medCleared: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
    medPending: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
    medText: { fontSize: 11, fontWeight: '800' },
    metaRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
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
        gap: 12,
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    editBtnText: { color: '#2563EB', fontWeight: '700', fontSize: 12 },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    deleteBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 12 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, gap: 12 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    modalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
    modalLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginTop: 4 },
    optionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    optionPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
    optionPillActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    optionText: { fontSize: 12, fontWeight: '600', color: '#475569' },
    optionTextActive: { color: '#FFFFFF', fontWeight: '700' },
    modalInput: { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, height: 44, color: '#0F172A' },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 14 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F1F5F9' },
    cancelBtnText: { color: '#64748B', fontWeight: '700' },
    saveBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#10B981' },
    saveBtnText: { color: '#FFFFFF', fontWeight: '800' },
});
