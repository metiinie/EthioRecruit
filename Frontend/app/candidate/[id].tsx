import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { candidateService } from '../../services/candidateService';
import { savedService } from '../../services/savedService';

export default function CandidateDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [submittingInquiry, setSubmittingInquiry] = useState(false);

    useEffect(() => {
        if (id) {
            loadCandidate();
        }
    }, [id]);

    const loadCandidate = async () => {
        setLoading(true);
        try {
            const res = await candidateService.getCandidateById(id!);
            setCandidate(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load candidate details');
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async () => {
        if (!id) return;
        try {
            if (isSaved) {
                await savedService.unsaveCandidate(id);
                setIsSaved(false);
                Alert.alert('Success', 'Removed from saved candidates');
            } else {
                await savedService.saveCandidate(id);
                setIsSaved(true);
                Alert.alert('Success', 'Saved to your candidate roster');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Action failed');
        }
    };

    const handleSendInquiry = async () => {
        if (!inquiryMessage.trim()) {
            Alert.alert('Required', 'Please enter an inquiry message');
            return;
        }
        setSubmittingInquiry(true);
        try {
            await candidateService.submitInquiry(id!, { message: inquiryMessage });
            setInquiryModalVisible(false);
            setInquiryMessage('');
            Alert.alert('Inquiry Sent!', 'The managing agency will contact you shortly.');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit inquiry');
        } finally {
            setSubmittingInquiry(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1A365D" />
                <Text style={styles.loadingText}>Loading Candidate Profile...</Text>
            </View>
        );
    }

    if (!candidate) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Candidate Not Found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            <Stack.Screen
                options={{
                    title: `${candidate.firstName} ${candidate.lastName}`,
                    headerRight: () => (
                        <TouchableOpacity onPress={toggleSave} style={{ marginRight: 15 }}>
                            <Ionicons
                                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                                size={24}
                                color="#D69E2E"
                            />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Profile Photo / Video Thumbnail Header */}
            <View style={styles.headerCard}>
                <Image
                    source={{
                        uri: candidate.photoUrl || candidate.videoThumbnail || 'https://via.placeholder.com/300x300.png?text=Candidate+Photo',
                    }}
                    style={styles.avatarImage}
                />
                <Text style={styles.candidateName}>
                    {candidate.firstName} {candidate.lastName}
                </Text>
                <Text style={styles.categoryText}>{candidate.category?.name || 'Domestic Worker'}</Text>

                <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: candidate.isAvailable ? '#C6F6D5' : '#FED7D7' }]}>
                        <Text style={[styles.badgeText, { color: candidate.isAvailable ? '#22543D' : '#742A2A' }]}>
                            {candidate.isAvailable ? 'Available Now' : 'Reserved'}
                        </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#EBF8FF' }]}>
                        <Text style={[styles.badgeText, { color: '#2B6CB0' }]}>
                            Medical: {candidate.medicalStatus?.toUpperCase() || 'PASSED'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Key Information Matrix */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Overview & Demographics</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Age / Gender</Text>
                        <Text style={styles.gridValue}>{candidate.age ? `${candidate.age} yrs` : 'N/A'} • {candidate.gender || 'Female'}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Religion</Text>
                        <Text style={styles.gridValue}>{candidate.religion || 'Christianity'}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Experience</Text>
                        <Text style={styles.gridValue}>{candidate.experienceYears ? `${candidate.experienceYears} Years` : 'Fresh'}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Location</Text>
                        <Text style={styles.gridValue}>{candidate.currentCountry || 'Ethiopia'}</Text>
                    </View>
                </View>
            </View>

            {/* Skills & Languages */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Proficiency & Skills</Text>
                <View style={styles.chipContainer}>
                    {(candidate.skills || ['House Cleaning', 'Cooking', 'Child Care', 'Elder Care']).map((skill: string, index: number) => (
                        <View key={index} style={styles.chip}>
                            <Ionicons name="checkmark-circle" size={16} color="#319795" style={{ marginRight: 4 }} />
                            <Text style={styles.chipText}>{skill}</Text>
                        </View>
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Languages Spoken</Text>
                <View style={styles.chipContainer}>
                    {(candidate.languages || ['Amharic', 'English', 'Arabic (Basic)']).map((lang: string, index: number) => (
                        <View key={index} style={[styles.chip, { backgroundColor: '#EDF2F7' }]}>
                            <Text style={[styles.chipText, { color: '#2D3748' }]}>{lang}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Managing Agency Banner */}
            {candidate.agency && (
                <View style={styles.agencyCard}>
                    <Ionicons name="business" size={24} color="#1A365D" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.agencyName}>{candidate.agency.name}</Text>
                        <Text style={styles.agencySub}>Licensed Recruitment Agency</Text>
                    </View>
                </View>
            )}

            {/* Bottom Action Floating Bar */}
            <View style={styles.actionFooter}>
                <TouchableOpacity
                    style={styles.inquireButton}
                    onPress={() => setInquiryModalVisible(true)}
                >
                    <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.inquireButtonText}>Inquire / Request Candidate</Text>
                </TouchableOpacity>
            </View>

            {/* Inquiry Modal */}
            <Modal visible={inquiryModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Inquire Candidate</Text>
                        <Text style={styles.modalSubtitle}>
                            Send an inquiry directly to {candidate.agency?.name || 'the managing agency'}.
                        </Text>

                        <TextInput
                            style={styles.textArea}
                            multiline
                            numberOfLines={4}
                            placeholder="State your required start date, working conditions, or specific questions..."
                            placeholderTextColor="#A0AEC0"
                            value={inquiryMessage}
                            onChangeText={setInquiryMessage}
                        />

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.cancelModalButton}
                                onPress={() => setInquiryModalVisible(false)}
                            >
                                <Text style={styles.cancelModalButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.submitModalButton}
                                onPress={handleSendInquiry}
                                disabled={submittingInquiry}
                            >
                                {submittingInquiry ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.submitModalButtonText}>Send Inquiry</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 12, fontSize: 16, color: '#4A5568' },
    errorText: { fontSize: 18, color: '#E53E3E', fontWeight: 'bold' },
    headerCard: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    avatarImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
    candidateName: { fontSize: 22, fontWeight: 'bold', color: '#1A365D' },
    categoryText: { fontSize: 14, color: '#718096', marginTop: 4 },
    badgeRow: { flexDirection: 'row', marginTop: 12 },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginHorizontal: 4 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    gridItem: { width: '50%', marginBottom: 12 },
    gridLabel: { fontSize: 12, color: '#A0AEC0' },
    gridValue: { fontSize: 14, fontWeight: '600', color: '#2D3748', marginTop: 2 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6FFFA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: { fontSize: 13, color: '#234E52', fontWeight: '500' },
    agencyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EDF2F7',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
    },
    agencyName: { fontSize: 15, fontWeight: 'bold', color: '#1A365D' },
    agencySub: { fontSize: 12, color: '#718096' },
    actionFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    inquireButton: {
        backgroundColor: '#1A365D',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 10,
    },
    inquireButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A365D' },
    modalSubtitle: { fontSize: 13, color: '#718096', marginVertical: 8 },
    textArea: {
        backgroundColor: '#EDF2F7',
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        color: '#2D3748',
        marginVertical: 12,
    },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
    cancelModalButton: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
    cancelModalButtonText: { color: '#718096', fontWeight: '600' },
    submitModalButton: { backgroundColor: '#1A365D', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    submitModalButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
});
