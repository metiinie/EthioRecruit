import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../constants';
import { getValidImageUri } from '../utils/imageUtils';
import { AgencyContactBar } from './AgencyContactBar';

interface CandidateDetailModalProps {
    candidate: any | null;
    visible: boolean;
    onClose: () => void;
    onInquire: (candidate: any) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
    candidate,
    visible,
    onClose,
    onInquire,
}) => {
    if (!candidate) return null;

    const isMedicalCleared = candidate.medicalStatus === 'cleared' || candidate.medicalStatus === 'PASSED_GAMCA' || candidate.medicalStatus === 'PASSED_LOCAL' || candidate.medicalStatus === 'PASSED';
    const isVerified = candidate.agency?.isVerified;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Top Bar Header */}
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Candidate Profile</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <Ionicons name="close" size={22} color={Colors.gray600} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                {/* Profile Banner */}
                                <View style={styles.profileHeaderCard}>
                                    {getValidImageUri(candidate.photoUrl) ? (
                                        <Image source={{ uri: getValidImageUri(candidate.photoUrl)! }} style={styles.avatarImage} />
                                    ) : (
                                        <View style={styles.avatarCircle}>
                                            <Text style={styles.avatarText}>
                                                {candidate.firstName?.[0] || 'C'}
                                                {candidate.lastName?.[0] || ''}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.nameRow}>
                                        <Text style={styles.candidateName}>
                                            {candidate.firstName} {candidate.lastName}
                                        </Text>
                                        {isVerified && (
                                            <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
                                        )}
                                    </View>

                                    <Text style={styles.categorySub}>
                                        {candidate.category?.name || 'Domestic Worker'} • {candidate.yearsOfExperience || candidate.experienceYears || '1+'} Years Exp
                                    </Text>

                                    {/* Status Badges */}
                                    <View style={styles.badgesRow}>
                                        <View
                                            style={[
                                                styles.badge,
                                                isMedicalCleared ? styles.badgeCleared : styles.badgePending,
                                            ]}
                                        >
                                            <Ionicons
                                                name="shield-checkmark"
                                                size={12}
                                                color={isMedicalCleared ? Colors.success : Colors.warning}
                                            />
                                            <Text
                                                style={[
                                                    styles.badgeText,
                                                    { color: isMedicalCleared ? Colors.success : Colors.warning },
                                                ]}
                                            >
                                                {isMedicalCleared ? 'Medical Cleared' : 'Medical Pending'}
                                            </Text>
                                        </View>

                                        <View style={[styles.badge, styles.badgeAvailable]}>
                                            <Ionicons name="checkmark-circle-outline" size={12} color={Colors.accentDark} />
                                            <Text style={[styles.badgeText, { color: Colors.accentDark }]}>
                                                Available for Hire
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Overview Matrix */}
                                <View style={styles.sectionCard}>
                                    <Text style={styles.sectionTitle}>Overview & Demographics</Text>
                                    <View style={styles.grid}>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.gridLabel}>Age / Gender</Text>
                                            <Text style={styles.gridValue}>
                                                {candidate.age ? `${candidate.age} yrs` : '24 yrs'} • {candidate.gender || 'Female'}
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
                                            <Text style={styles.gridValue}>{candidate.targetCountry || 'Saudi Arabia, UAE'}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Summary & Bio */}
                                {candidate.summary ? (
                                    <View style={styles.sectionCard}>
                                        <Text style={styles.sectionTitle}>Summary & Experience</Text>
                                        <Text style={styles.summaryBody}>{candidate.summary}</Text>
                                    </View>
                                ) : null}

                                {/* Skills & Languages */}
                                <View style={styles.sectionCard}>
                                    <Text style={styles.sectionTitle}>Skills & Competencies</Text>
                                    <View style={styles.chipsContainer}>
                                        {(candidate.skills || ['House Cleaning', 'Child Care', 'Cooking', 'Elder Care']).map(
                                            (skill: string, idx: number) => (
                                                <View key={idx} style={styles.chipPill}>
                                                    <Ionicons name="checkmark-circle" size={13} color={Colors.accent} />
                                                    <Text style={styles.chipText}>{skill}</Text>
                                                </View>
                                            )
                                        )}
                                    </View>

                                    <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Languages Spoken</Text>
                                    <View style={styles.chipsContainer}>
                                        {(candidate.languages || ['Amharic', 'English', 'Arabic (Basic)']).map(
                                            (lang: string, idx: number) => (
                                                <View key={idx} style={[styles.chipPill, { backgroundColor: Colors.gray100 }]}>
                                                    <Ionicons name="language" size={13} color={Colors.gray600} />
                                                    <Text style={[styles.chipText, { color: Colors.gray800 }]}>{lang}</Text>
                                                </View>
                                            )
                                        )}
                                    </View>
                                </View>

                                {/* Managing Agency Info */}
                                <View style={styles.agencyCard}>
                                    <View style={styles.agencyIconWrapper}>
                                        <Ionicons name="business" size={22} color={Colors.white} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Text style={styles.agencyName}>
                                                {candidate.agency?.name || 'EthioRecruit Verified Agency'}
                                            </Text>
                                            {isVerified && (
                                                <Ionicons name="checkmark-circle" size={15} color={Colors.accent} />
                                            )}
                                        </View>
                                        <Text style={styles.agencySub}>Official Recruitment Partner</Text>
                                    </View>
                                </View>

                                {/* Direct Agency Contact Bar */}
                                <AgencyContactBar
                                    agency={candidate.agency}
                                    candidateName={`${candidate.firstName || ''} ${candidate.lastName || ''}`}
                                />
                            </ScrollView>

                            {/* Bottom Action Footer */}
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={styles.inquireFullBtn}
                                    onPress={() => {
                                        onClose();
                                        onInquire(candidate);
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="chatbubble-ellipses" size={18} color={Colors.white} />
                                    <Text style={styles.inquireFullBtnText}>Inquire with Agency via Platform</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        maxHeight: '90%',
        backgroundColor: Colors.background,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray200,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.gray900,
    },
    closeBtn: {
        padding: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray100,
    },
    scrollContent: {
        padding: Spacing.lg,
        gap: Spacing.md,
        paddingBottom: 20,
    },
    profileHeaderCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    avatarCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 26,
        fontWeight: '900',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    candidateName: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.gray900,
    },
    categorySub: {
        fontSize: 13,
        color: Colors.gray500,
        marginTop: 2,
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    badgeCleared: {
        backgroundColor: Colors.success + '15',
    },
    badgePending: {
        backgroundColor: Colors.warning + '15',
    },
    badgeAvailable: {
        backgroundColor: Colors.accent + '15',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    sectionCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.gray900,
        marginBottom: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 12,
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
    summaryBody: {
        fontSize: 13,
        color: Colors.gray700,
        lineHeight: 20,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    chipPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.accent + '12',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BorderRadius.md,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.gray900,
    },
    agencyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        gap: 12,
    },
    agencyIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
        marginTop: 1,
    },
    footer: {
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray200,
    },
    inquireFullBtn: {
        backgroundColor: Colors.accent,
        paddingVertical: 14,
        borderRadius: BorderRadius.xl,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    inquireFullBtnText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '800',
    },
});
