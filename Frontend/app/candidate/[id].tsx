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
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { candidateService } from '../../services/candidateService';
import { savedService } from '../../services/savedService';
import { getValidImageUri, getBestCandidateAvatar } from '../../utils/imageUtils';
import { AgencyContactBar } from '../../components/AgencyContactBar';
import { getCandidatePhotos } from '../../components/CandidatePostCard';

export default function CandidateDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [togglingSave, setTogglingSave] = useState(false);
    const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [submittingInquiry, setSubmittingInquiry] = useState(false);
    const [exportingCv, setExportingCv] = useState(false);
    const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
    const [activePhotoIdx, setActivePhotoIdx] = useState(0);

    const handleExportCv = async () => {
        if (!id) return;
        setExportingCv(true);
        try {
            const res = await candidateService.getExportCv(id);
            const cvData = res.data;
            Alert.alert(
                'Recruitment CV Generated',
                `Official Candidate Recruitment Profile for ${cvData.candidate.firstName} ${cvData.candidate.lastName} (Ref: ${cvData.candidate.id.slice(0, 8).toUpperCase()}) is ready.\n\nPosition: ${cvData.candidate.appliedPosition || 'Domestic Worker'}\nAgency: ${cvData.candidate.agency?.name || 'EthioRecruit Agency'}`,
                [{ text: 'OK', style: 'cancel' }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error?.message || 'Failed to export candidate CV');
        } finally {
            setExportingCv(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadCandidate();
            checkIsSaved();
        }
    }, [id]);

    const loadCandidate = async () => {
        setLoading(true);
        try {
            const res = await candidateService.getCandidateById(id!);
            setCandidate(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load candidate profile details');
        } finally {
            setLoading(false);
        }
    };

    const checkIsSaved = async () => {
        try {
            const res = await savedService.getSavedCandidates();
            const list = res.data || [];
            const found = list.some((item: any) => item.candidateId === id || item.candidate?.id === id);
            setIsSaved(found);
        } catch (error) {
            // Ignore error on initial saved status check
        }
    };

    const toggleSave = async () => {
        if (!id || togglingSave) return;
        setTogglingSave(true);
        try {
            if (isSaved) {
                await savedService.unsaveCandidate(id);
                setIsSaved(false);
                Alert.alert('Removed', 'Candidate removed from your saved list');
            } else {
                try {
                    await savedService.saveCandidate(id);
                    setIsSaved(true);
                    Alert.alert('Saved', 'Candidate saved to your roster');
                } catch (err: any) {
                    const msg = err.response?.data?.error?.message || err.response?.data?.message || '';
                    if (msg.includes('already saved') || err.response?.status === 409) {
                        setIsSaved(true);
                        Alert.alert('Saved', 'Candidate is already in your saved list');
                    } else {
                        throw err;
                    }
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error?.message || 'Failed to update saved status');
        } finally {
            setTogglingSave(false);
        }
    };

    const handleSendInquiry = async () => {
        if (!inquiryMessage.trim()) {
            Alert.alert('Required', 'Please enter your inquiry message');
            return;
        }
        setSubmittingInquiry(true);
        try {
            await candidateService.submitInquiry(id!, { message: inquiryMessage });
            setInquiryModalVisible(false);
            setInquiryMessage('');
            Alert.alert('Inquiry Sent!', 'Your inquiry has been submitted to the recruitment agency!');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error?.message || 'Failed to send inquiry');
        } finally {
            setSubmittingInquiry(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.loadingText}>Loading Candidate Profile...</Text>
            </SafeAreaView>
        );
    }

    if (!candidate) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
                <Text style={styles.errorText}>Candidate Profile Not Found</Text>
                <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()}>
                    <Text style={styles.backHomeBtnText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const isMedicalCleared = candidate.medicalStatus === 'cleared' || candidate.medicalStatus === 'PASSED_GAMCA' || candidate.medicalStatus === 'PASSED_LOCAL' || candidate.medicalStatus === 'PASSED';
    const isVerified = candidate.agency?.isVerified;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Screen Header Bar with Back Icon */}
            <SafeAreaView style={styles.topHeaderNav}>
                <View style={styles.headerNavContent}>
                    <TouchableOpacity
                        style={styles.backIconButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={22} color={Colors.white} />
                    </TouchableOpacity>

                    <Text style={styles.headerNavTitle} numberOfLines={1}>
                        {candidate.firstName} {candidate.lastName}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <TouchableOpacity
                            style={styles.bookmarkButton}
                            onPress={handleExportCv}
                            disabled={exportingCv}
                            activeOpacity={0.7}
                        >
                            {exportingCv ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Ionicons name="document-text-outline" size={20} color={Colors.white} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.bookmarkButton}
                            onPress={toggleSave}
                            disabled={togglingSave}
                            activeOpacity={0.7}
                        >
                            {togglingSave ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Ionicons
                                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                                    size={22}
                                    color={isSaved ? Colors.warning : Colors.white}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Candidate Info Scroll Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Main Profile Header Card */}
                <View style={styles.profileHeaderCard}>
                    {getBestCandidateAvatar(candidate) ? (
                        <Image source={{ uri: getBestCandidateAvatar(candidate)! }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>
                                {candidate.firstName?.[0] || 'C'}{candidate.lastName?.[0] || ''}
                            </Text>
                        </View>
                    )}

                    <View style={styles.nameRow}>
                        <Text style={styles.candidateName}>
                            {candidate.firstName} {candidate.lastName}
                        </Text>
                        {isVerified && (
                            <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                        )}
                    </View>

                    <Text style={styles.categorySub}>
                        {candidate.category?.name || 'Domestic Worker'} • {candidate.yearsOfExperience || candidate.experienceYears || '1+'} Years Experience
                    </Text>

                    {/* Status Badges Row */}
                    <View style={styles.badgesRow}>
                        <View
                            style={[
                                styles.statusBadge,
                                isMedicalCleared ? styles.statusCleared : styles.statusPending,
                            ]}
                        >
                            <Ionicons
                                name="shield-checkmark"
                                size={13}
                                color={isMedicalCleared ? Colors.success : Colors.warning}
                            />
                            <Text
                                style={[
                                    styles.statusBadgeText,
                                    { color: isMedicalCleared ? Colors.success : Colors.warning },
                                ]}
                            >
                                {isMedicalCleared ? 'Medical Cleared' : 'Medical Pending'}
                            </Text>
                        </View>

                        <View style={[styles.statusBadge, styles.statusAvailable]}>
                            <Ionicons name="checkmark-circle-outline" size={13} color={Colors.accentDark} />
                            <Text style={[styles.statusBadgeText, { color: Colors.accentDark }]}>
                                Available for Overseas Hire
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Candidate 5-Photo Gallery Section */}
                {(() => {
                    const photos = getCandidatePhotos(candidate);
                    if (photos.length === 0) return null;
                    const currentPhoto = photos[activePhotoIdx] || photos[0];

                    return (
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeaderRowBetween}>
                                <View style={styles.sectionHeaderRow}>
                                    <Ionicons name="images-outline" size={18} color={Colors.accent} />
                                    <Text style={styles.sectionTitle}>Candidate Photos ({photos.length}/5)</Text>
                                </View>
                                <Text style={styles.tapToExpandText}>Tap photo to enlarge</Text>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.galleryScrollContainer}
                            >
                                {photos.map((photo, idx) => (
                                    <TouchableOpacity
                                        key={`detail-photo-${photo.id}-${idx}`}
                                        style={styles.galleryCard}
                                        onPress={() => {
                                            setActivePhotoIdx(idx);
                                            setPhotoViewerVisible(true);
                                        }}
                                        activeOpacity={0.88}
                                    >
                                        <Image source={{ uri: photo.url }} style={styles.galleryCardImg} />
                                        <View style={styles.galleryCardBadge}>
                                            <Ionicons name={photo.icon as any} size={11} color={Colors.white} />
                                            <Text style={styles.galleryCardBadgeText}>{photo.label}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Detailed Full Screen Viewer Modal */}
                            {photoViewerVisible && (
                                <Modal visible transparent animationType="fade" onRequestClose={() => setPhotoViewerVisible(false)}>
                                    <View style={styles.viewerOverlay}>
                                        <View style={styles.viewerHeader}>
                                            <View style={styles.viewerTitleCol}>
                                                <Text style={styles.viewerCandidateName}>
                                                    {candidate.firstName} {candidate.lastName}
                                                </Text>
                                                <Text style={styles.viewerPhotoLabel}>
                                                    {currentPhoto.label} ({activePhotoIdx + 1} of {photos.length})
                                                </Text>
                                            </View>

                                            <TouchableOpacity style={styles.viewerCloseBtn} onPress={() => setPhotoViewerVisible(false)}>
                                                <Ionicons name="close" size={24} color={Colors.white} />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.viewerMainDisplay}>
                                            <Image
                                                source={{ uri: currentPhoto.url }}
                                                style={styles.viewerMainImage}
                                                resizeMode="contain"
                                            />

                                            {photos.length > 1 && (
                                                <>
                                                    <TouchableOpacity
                                                        style={[styles.viewerNavArrow, { left: 16 }]}
                                                        onPress={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                                                    >
                                                        <Ionicons name="chevron-back" size={28} color={Colors.white} />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={[styles.viewerNavArrow, { right: 16 }]}
                                                        onPress={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                                                    >
                                                        <Ionicons name="chevron-forward" size={28} color={Colors.white} />
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>

                                        <View style={styles.viewerBottomRow}>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.viewerThumbScroll}>
                                                {photos.map((p, idx) => (
                                                    <TouchableOpacity
                                                        key={`detail-vthumb-${p.id}-${idx}`}
                                                        style={[styles.viewerThumbBox, activePhotoIdx === idx && styles.viewerThumbBoxActive]}
                                                        onPress={() => setActivePhotoIdx(idx)}
                                                    >
                                                        <Image source={{ uri: p.url }} style={styles.viewerThumbImg} />
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                </Modal>
                            )}
                        </View>
                    );
                })()}

                {/* Comprehensive Employer Data Matrix */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="person-circle-outline" size={18} color={Colors.accent} />
                        <Text style={styles.sectionTitle}>Candidate Demographics & Details</Text>
                    </View>

                    <View style={styles.gridMatrix}>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Age / Gender</Text>
                            <Text style={styles.gridValue}>
                                {candidate.age ? `${candidate.age} Years` : '24 Years'} • {candidate.gender || 'Female'}
                            </Text>
                        </View>

                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Religion</Text>
                            <Text style={styles.gridValue}>{candidate.religion || 'Christianity'}</Text>
                        </View>

                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Current Country</Text>
                            <Text style={styles.gridValue}>{candidate.currentCountry || 'Ethiopia'}</Text>
                        </View>

                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Target Destination</Text>
                            <Text style={styles.gridValue}>{candidate.targetCountry || 'Saudi Arabia, UAE, Kuwait'}</Text>
                        </View>

                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Passport Status</Text>
                            <Text style={[styles.gridValue, { color: Colors.success }]}>
                                {candidate.passportStatus || 'Passport Ready & Verified'}
                            </Text>
                        </View>

                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Expected Salary</Text>
                            <Text style={styles.gridValue}>
                                {candidate.expectedSalary ? `${candidate.salaryCurrency || 'USD'} ${candidate.expectedSalary}` : 'Negotiable'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Candidate Summary & Background */}
                {candidate.summary ? (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="document-text-outline" size={18} color={Colors.accent} />
                            <Text style={styles.sectionTitle}>Summary & Professional Bio</Text>
                        </View>
                        <Text style={styles.summaryText}>{candidate.summary}</Text>
                    </View>
                ) : null}

                {/* Skills & Spoken Languages */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="ribbon-outline" size={18} color={Colors.accent} />
                        <Text style={styles.sectionTitle}>Skills & Competencies</Text>
                    </View>
                    <View style={styles.chipsContainer}>
                        {(candidate.skills || ['House Cleaning', 'Child Care', 'Cooking', 'Elder Care', 'Laundry']).map(
                            (skill: string, idx: number) => (
                                <View key={idx} style={styles.skillPill}>
                                    <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            )
                        )}
                    </View>

                    <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
                        <Ionicons name="language-outline" size={18} color={Colors.accent} />
                        <Text style={styles.sectionTitle}>Languages Spoken</Text>
                    </View>
                    <View style={styles.chipsContainer}>
                        {(candidate.languages || ['Amharic (Native)', 'English (Basic)', 'Arabic (Conversational)']).map(
                            (lang: string, idx: number) => (
                                <View key={idx} style={[styles.skillPill, { backgroundColor: Colors.gray100 }]}>
                                    <Text style={[styles.skillText, { color: Colors.gray800 }]}>{lang}</Text>
                                </View>
                            )
                        )}
                    </View>
                </View>

                {/* Managing Agency Card */}
                <View style={styles.agencyCard}>
                    <View style={styles.agencyIconCircle}>
                        <Ionicons name="business" size={24} color={Colors.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.agencyName}>
                                {candidate.agency?.name || 'EthioRecruit Verified Agency'}
                            </Text>
                            {isVerified && (
                                <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                            )}
                        </View>
                        <Text style={styles.agencySub}>Licensed Foreign Employment Agency</Text>
                    </View>
                </View>

                {/* Direct Agency Outreach Shortcuts */}
                <AgencyContactBar
                    agency={candidate.agency}
                    candidateName={`${candidate.firstName} ${candidate.lastName}`}
                />
            </ScrollView>

            {/* Fixed Bottom Action Bar */}
            <View style={styles.bottomActionBar}>
                <TouchableOpacity
                    style={styles.saveActionBtn}
                    onPress={toggleSave}
                    disabled={togglingSave}
                    activeOpacity={0.8}
                >
                    {togglingSave ? (
                        <ActivityIndicator size="small" color={Colors.accent} />
                    ) : (
                        <Ionicons
                            name={isSaved ? 'bookmark' : 'bookmark-outline'}
                            size={20}
                            color={isSaved ? Colors.warning : Colors.gray700}
                        />
                    )}
                </TouchableOpacity>

                {/* High visibility "Inquire with Agency" button */}
                <TouchableOpacity
                    style={styles.inquireFullButton}
                    onPress={() => setInquiryModalVisible(true)}
                    activeOpacity={0.85}
                >
                    <Ionicons name="chatbubble-ellipses" size={20} color={Colors.white} />
                    <Text style={styles.inquireFullButtonText}>Inquire with Agency</Text>
                </TouchableOpacity>
            </View>

            {/* Inquiry Submission Modal */}
            {inquiryModalVisible && (
                <Modal visible transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Inquire Candidate</Text>
                                <TouchableOpacity onPress={() => setInquiryModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={Colors.gray500} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSub}>
                                Direct inquiry regarding {candidate.firstName} {candidate.lastName} to {candidate.agency?.name || 'the agency'}.
                            </Text>

                            {/* Direct Agency Contact Shortcuts */}
                            <AgencyContactBar
                                agency={candidate.agency}
                                candidateName={`${candidate.firstName} ${candidate.lastName}`}
                            />

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Specify required start date, working conditions, salary budget, or questions..."
                                placeholderTextColor={Colors.gray400}
                                multiline
                                numberOfLines={4}
                                value={inquiryMessage}
                                onChangeText={setInquiryMessage}
                            />
                            <TouchableOpacity
                                style={[styles.modalSubmitBtn, submittingInquiry && { opacity: 0.6 }]}
                                onPress={handleSendInquiry}
                                disabled={submittingInquiry}
                            >
                                <Text style={styles.modalSubmitText}>
                                    {submittingInquiry ? 'Submitting...' : 'Send Inquiry to Agency'}
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
    container: { flex: 1, backgroundColor: Colors.background },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: Spacing.lg },
    loadingText: { marginTop: 12, fontSize: 15, color: Colors.gray600, fontWeight: '600' },
    errorText: { fontSize: 18, fontWeight: '800', color: Colors.error, marginTop: 12 },
    backHomeBtn: { marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.md },
    backHomeBtnText: { color: Colors.white, fontWeight: '700' },

    /* Top Nav Header */
    topHeaderNav: {
        backgroundColor: Colors.primary,
        paddingTop: StatusBar.currentHeight || 10,
    },
    headerNavContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
    },
    backIconButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerNavTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '800',
        color: Colors.white,
        marginHorizontal: 12,
    },
    bookmarkButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollContent: {
        padding: Spacing.lg,
        gap: Spacing.md,
        paddingBottom: 100,
    },

    /* Profile Header */
    profileHeaderCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },
    avatarImage: {
        width: 88,
        height: 88,
        borderRadius: 44,
        marginBottom: 12,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 28,
        fontWeight: '900',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    candidateName: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.gray900,
    },
    categorySub: {
        fontSize: 13,
        color: Colors.gray500,
        marginTop: 3,
        fontWeight: '600',
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 14,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BorderRadius.sm,
    },
    statusCleared: { backgroundColor: Colors.success + '15' },
    statusPending: { backgroundColor: Colors.warning + '15' },
    statusAvailable: { backgroundColor: Colors.accent + '15' },
    statusBadgeText: { fontSize: 11, fontWeight: '800' },

    /* Section Cards */
    sectionCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 1,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.gray900,
    },
    gridMatrix: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 14,
    },
    gridItem: {
        width: '50%',
    },
    gridLabel: {
        fontSize: 11,
        color: Colors.gray500,
        fontWeight: '600',
    },
    gridValue: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.gray900,
        marginTop: 2,
    },
    summaryText: {
        fontSize: 13,
        color: Colors.gray700,
        lineHeight: 20,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.accent + '12',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
    },
    skillText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.gray900,
    },

    /* Agency Card */
    agencyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        gap: 12,
    },
    agencyIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    agencyName: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.white,
    },
    agencySub: {
        fontSize: 12,
        color: Colors.gray400,
        marginTop: 2,
    },

    /* Bottom Action Bar */
    bottomActionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.gray200,
        flexDirection: 'row',
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 10,
        elevation: 10,
    },
    saveActionBtn: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    inquireFullButton: {
        flex: 1,
        backgroundColor: Colors.accent,
        height: 48,
        borderRadius: BorderRadius.xl,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    inquireFullButtonText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '800',
    },

    /* Modal */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, gap: Spacing.md },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.gray900 },
    modalSub: { fontSize: 13, color: Colors.gray500 },
    modalInput: {
        backgroundColor: Colors.gray50,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.gray900,
        height: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    modalSubmitBtn: { backgroundColor: Colors.accent, paddingVertical: 14, borderRadius: BorderRadius.md, alignItems: 'center' },
    modalSubmitText: { color: Colors.white, fontWeight: '700', fontSize: 15 },

    /* Candidate 5-Photo Gallery Styles */
    sectionHeaderRowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tapToExpandText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.accentDark,
    },
    galleryScrollContainer: {
        gap: 10,
        paddingRight: 8,
    },
    galleryCard: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: Colors.gray200,
        backgroundColor: Colors.gray100,
    },
    galleryCardImg: {
        width: '100%',
        height: '100%',
    },
    galleryCardBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        paddingVertical: 4,
        paddingHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    galleryCardBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '800',
    },

    /* Viewer Overlay Styles */
    viewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.94)',
        justifyContent: 'space-between',
    },
    viewerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: 48,
        paddingBottom: 16,
    },
    viewerTitleCol: { flex: 1 },
    viewerCandidateName: { fontSize: 18, fontWeight: '900', color: Colors.white },
    viewerPhotoLabel: { fontSize: 13, fontWeight: '700', color: Colors.accent, marginTop: 2 },
    viewerCloseBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerMainDisplay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    viewerMainImage: { width: '92%', height: '80%' },
    viewerNavArrow: {
        position: 'absolute',
        top: '45%',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerBottomRow: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 36,
        gap: 14,
    },
    viewerThumbScroll: { gap: 10, justifyContent: 'center', flexGrow: 1 },
    viewerThumbBox: {
        width: 54,
        height: 54,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    viewerThumbBoxActive: { borderColor: Colors.accent },
    viewerThumbImg: { width: '100%', height: '100%' },
});
