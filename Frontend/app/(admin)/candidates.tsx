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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../../services/candidateService';

export default function AdminCandidatesScreen() {
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [categoryId, setCategoryId] = useState('housemaid');
    const [gender, setGender] = useState('female');
    const [yearsOfExperience, setYearsOfExperience] = useState('2');

    const candidatesQuery = useQuery({
        queryKey: ['admin', 'candidates'],
        queryFn: () => candidateService.getAdminCandidates(),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => candidateService.createCandidate(data),
        onSuccess: () => {
            Alert.alert('Success', 'Candidate created successfully!');
            setShowAddModal(false);
            setFirstName('');
            setLastName('');
            queryClient.invalidateQueries({ queryKey: ['admin', 'candidates'] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err.response?.data?.error?.message || 'Failed to create candidate');
        },
    });

    const handleCreate = () => {
        if (!firstName || !lastName) {
            Alert.alert('Error', 'Please provide first and last name');
            return;
        }
        createMutation.mutate({
            firstName,
            lastName,
            categoryId,
            gender,
            yearsOfExperience: parseInt(yearsOfExperience) || 0,
            isPublished: true,
            isAvailable: true,
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Agency Candidates</Text>
                    <Text style={styles.subTitle}>Manage candidate profiles & medical clearances</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <Ionicons name="add" size={24} color={Colors.white} />
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
                            <Text style={styles.emptyText}>No candidates in roster</Text>
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
                                            {cand.firstName} {cand.lastName}
                                        </Text>
                                        <Text style={styles.candSub}>
                                            {cand.gender} • {cand.yearsOfExperience} yrs exp
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.medBadge,
                                            cand.medicalStatus === 'cleared'
                                                ? styles.medCleared
                                                : styles.medPending,
                                        ]}
                                    >
                                        <Text style={styles.medText}>{cand.medicalStatus}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Add Candidate Modal */}
            {showAddModal && (
                <Modal visible transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add Candidate</Text>
                                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                    <Ionicons name="close" size={24} color={Colors.gray400} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="First Name"
                                placeholderTextColor={Colors.gray500}
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Last Name"
                                placeholderTextColor={Colors.gray500}
                                value={lastName}
                                onChangeText={setLastName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Years of Experience"
                                placeholderTextColor={Colors.gray500}
                                keyboardType="number-pad"
                                value={yearsOfExperience}
                                onChangeText={setYearsOfExperience}
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, createMutation.isPending && { opacity: 0.6 }]}
                                onPress={handleCreate}
                                disabled={createMutation.isPending}
                            >
                                <Text style={styles.submitBtnText}>
                                    {createMutation.isPending ? 'Saving...' : 'Save Candidate'}
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
    candSub: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
    medBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
    medCleared: { backgroundColor: Colors.success + '20' },
    medPending: { backgroundColor: Colors.warning + '20' },
    medText: { fontSize: 11, fontWeight: '700', color: Colors.accent },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalCard: {
        backgroundColor: Colors.primaryLight,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
    input: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 52,
        color: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray700,
    },
    submitBtn: {
        backgroundColor: Colors.accent,
        paddingVertical: 16,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
