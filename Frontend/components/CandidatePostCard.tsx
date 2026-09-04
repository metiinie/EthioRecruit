import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants';
import { getValidImageUri, getBestCandidateAvatar } from '../utils/imageUtils';
import { AgencyContactBar } from './AgencyContactBar';

export interface CandidatePhotoItem {
    id: string;
    type: 'profile' | 'fullBody' | 'passport' | 'medical' | 'coc';
    label: string;
    url: string;
    icon: string;
}

export function getCandidatePhotos(candidate: any): CandidatePhotoItem[] {
    if (!candidate) return [];
    const photos: CandidatePhotoItem[] = [];

    if (candidate.photoUrl && getValidImageUri(candidate.photoUrl)) {
        photos.push({
            id: 'photoUrl',
            type: 'profile',
            label: 'Profile Photo',
            url: getValidImageUri(candidate.photoUrl)!,
            icon: 'person-circle-outline',
        });
    }

    if (candidate.fullBodyPhotoUrl && getValidImageUri(candidate.fullBodyPhotoUrl)) {
        photos.push({
            id: 'fullBodyPhotoUrl',
            type: 'fullBody',
            label: 'Full Body Photo',
            url: getValidImageUri(candidate.fullBodyPhotoUrl)!,
            icon: 'body-outline',
        });
    }

    if (candidate.passportCopyUrl && getValidImageUri(candidate.passportCopyUrl)) {
        photos.push({
            id: 'passportCopyUrl',
            type: 'passport',
            label: 'Passport Copy',
            url: getValidImageUri(candidate.passportCopyUrl)!,
            icon: 'card-outline',
        });
    }

    if (candidate.medicalCertUrl && getValidImageUri(candidate.medicalCertUrl)) {
        photos.push({
            id: 'medicalCertUrl',
            type: 'medical',
            label: 'Medical Cert',
            url: getValidImageUri(candidate.medicalCertUrl)!,
            icon: 'document-text-outline',
        });
    }

    if (candidate.cocCertUrl && getValidImageUri(candidate.cocCertUrl)) {
        photos.push({
            id: 'cocCertUrl',
            type: 'coc',
            label: 'COC Cert',
            url: getValidImageUri(candidate.cocCertUrl)!,
            icon: 'ribbon-outline',
        });
    }

    if (Array.isArray(candidate.galleryPhotos) && candidate.galleryPhotos.length > 0) {
        let fullBodyCount = photos.filter(p => p.type === 'fullBody').length;
        candidate.galleryPhotos.forEach((gUrl: string, gIdx: number) => {
            const validUri = getValidImageUri(gUrl);
            if (validUri && !photos.some(p => p.url === validUri)) {
                // If we haven't reached 5 photos, determine label
                const isExtraFullBody = fullBodyCount > 0 && photos.length < 5;
                if (isExtraFullBody) {
                    fullBodyCount++;
                    photos.push({
                        id: `gallery-fullbody-${gIdx}`,
                        type: 'fullBody',
                        label: `Full Body ${fullBodyCount}`,
                        url: validUri,
                        icon: 'body-outline',
                    });
                } else {
                    photos.push({
                        id: `gallery-${gIdx}`,
                        type: 'profile',
                        label: `Photo ${photos.length + 1}`,
                        url: validUri,
                        icon: 'image-outline',
                    });
                }
            }
        });
    }

    return photos.slice(0, 5);
}

interface CandidatePostCardProps {
    candidate: any;
    onPress?: () => void;
    onInquire?: () => void;
    onToggleBookmark?: () => void;
    isBookmarked?: boolean;
}

export function CandidatePostCard({
    candidate,
    onPress,
    onInquire,
    onToggleBookmark,
    isBookmarked = false,
}: CandidatePostCardProps) {
    const [viewerVisible, setViewerVisible] = useState(false);
    const [activePhotoIdx, setActivePhotoIdx] = useState(0);

    if (!candidate) return null;

    const photos = getCandidatePhotos(candidate);

    const isMedicalCleared =
        candidate.medicalStatus === 'cleared' ||
        candidate.medicalStatus === 'PASSED_GAMCA' ||
        candidate.medicalStatus === 'PASSED_LOCAL' ||
        candidate.medicalStatus === 'PASSED';

    const agencyName = candidate.agency?.name || 'Verified Agency';
    const isVerified = candidate.agency?.isVerified ?? true;
    const categoryName = candidate.category?.name || candidate.appliedPosition || 'Domestic Worker';
    const expYears = candidate.yearsOfExperience || candidate.experienceYears || '1+';

    const handleOpenPhoto = (idx: number) => {
        setActivePhotoIdx(idx);
        setViewerVisible(true);
    };

    const handlePrevPhoto = () => {
        if (photos.length === 0) return;
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    };

    const handleNextPhoto = () => {
        if (photos.length === 0) return;
        setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    };

    const currentPhoto = photos[activePhotoIdx] || photos[0];

    return (
        <View style={styles.cardContainer}>
            {/* 1. Feed Post Header: Agency Info */}
            <View style={styles.postHeader}>
                <View style={styles.agencyInfo}>
                    <View style={styles.agencyAvatarCircle}>
                        <Ionicons name="business" size={16} color={Colors.primary} />
                    </View>
                    <View style={styles.agencyTextCol}>
                        <View style={styles.agencyNameRow}>
                            <Text style={styles.agencyName} numberOfLines={1}>
                                {agencyName}
                            </Text>
                            {isVerified && (
                                <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
                            )}
                        </View>
                        <Text style={styles.postMetaSub}>Recruitment Agency • Verified Listing</Text>
                    </View>
                </View>

                {onToggleBookmark && (
                    <TouchableOpacity
                        style={styles.bookmarkBtn}
                        onPress={onToggleBookmark}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                            size={20}
                            color={isBookmarked ? Colors.warning : Colors.gray400}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* 2. Candidate Hero Info Row */}
            <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.candidateHeroRow}>
                {getBestCandidateAvatar(candidate) ? (
                    <Image source={{ uri: getBestCandidateAvatar(candidate)! }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>
                            {candidate.firstName?.[0] || 'C'}
                        </Text>
                    </View>
                )}

                <View style={styles.candidateMainDetails}>
                    <Text style={styles.candidateName}>
                        {candidate.firstName} {candidate.lastName}
                    </Text>

                    {candidate.fullNameAmharic ? (
                        <Text style={styles.amharicName}>{candidate.fullNameAmharic}</Text>
                    ) : null}

                    <View style={styles.categoryBadge}>
                        <Ionicons name="briefcase-outline" size={12} color={Colors.primary} />
                        <Text style={styles.categoryBadgeText}>{categoryName}</Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* 3. Metadata Chips Grid */}
            <View style={styles.chipsRow}>
                {/* Medical Status */}
                <View
                    style={[
                        styles.chip,
                        isMedicalCleared ? styles.chipSuccess : styles.chipWarning,
                    ]}
                >
                    <Ionicons
                        name={isMedicalCleared ? 'shield-checkmark' : 'time-outline'}
                        size={13}
                        color={isMedicalCleared ? Colors.success : Colors.warning}
                    />
                    <Text
                        style={[
                            styles.chipText,
                            { color: isMedicalCleared ? Colors.success : Colors.warning },
                        ]}
                    >
                        {isMedicalCleared ? 'Medical Cleared' : 'Medical Pending'}
                    </Text>
                </View>

                {/* Experience */}
                <View style={styles.chipNeutral}>
                    <Ionicons name="ribbon-outline" size={13} color={Colors.gray700} />
                    <Text style={styles.chipTextNeutral}>{expYears} Yrs Exp</Text>
                </View>

                {/* Expected Salary */}
                {candidate.expectedSalary ? (
                    <View style={styles.chipTeal}>
                        <Ionicons name="cash-outline" size={13} color={Colors.accentDark} />
                        <Text style={styles.chipTextTeal}>
                            {candidate.expectedSalaryCurrency || 'SAR'} {candidate.expectedSalary}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* 4. Bio / Summary Post Quote Box */}
            {candidate.summary ? (
                <View style={styles.summaryQuoteBox}>
                    <Text style={styles.summaryText} numberOfLines={2}>
                        "{candidate.summary}"
                    </Text>
                </View>
            ) : null}

            {/* 5. Skills & Languages Pills */}
            {((candidate.skills && candidate.skills.length > 0) || (candidate.languages && candidate.languages.length > 0)) && (
                <View style={styles.tagsContainer}>
                    {candidate.skills?.slice(0, 3).map((skill: string, idx: number) => (
                        <View key={`skill-${idx}`} style={styles.tagItem}>
                            <Text style={styles.tagText}>• {skill}</Text>
                        </View>
                    ))}
                    {candidate.languages?.slice(0, 2).map((lang: string, idx: number) => (
                        <View key={`lang-${idx}`} style={styles.tagItemSecondary}>
                            <Text style={styles.tagTextSecondary}>🗣 {lang}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* 6. Direct Agency Contact Shortcuts Bar */}
            <AgencyContactBar
                agency={candidate.agency}
                candidateName={`${candidate.firstName || ''} ${candidate.lastName || ''}`}
                compact
            />

            {/* 7. Post Action Footer */}
            <View style={styles.postFooter}>
                <TouchableOpacity
                    style={styles.secondaryActionBtn}
                    onPress={onPress}
                    activeOpacity={0.8}
                >
                    <Ionicons name="person-outline" size={15} color={Colors.primary} />
                    <Text style={styles.secondaryActionText}>View Full Profile</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>

                {onInquire && (
                    <TouchableOpacity
                        style={styles.primaryActionBtn}
                        onPress={onInquire}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="chatbubble-ellipses" size={15} color={Colors.white} />
                        <Text style={styles.primaryActionText}>Inquire</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: Spacing.md,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 3,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    agencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    agencyAvatarCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    agencyTextCol: { flex: 1 },
    agencyNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    agencyName: { fontSize: 13, fontWeight: '800', color: Colors.gray900 },
    postMetaSub: { fontSize: 11, color: Colors.gray500, marginTop: 1 },
    bookmarkBtn: { padding: 4 },
    divider: { height: 1, backgroundColor: Colors.gray100, marginBottom: 12 },
    candidateHeroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    avatarImage: { width: 56, height: 56, borderRadius: 28 },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E2E8F0',
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: { color: Colors.primary, fontWeight: '900', fontSize: 22 },
    candidateMainDetails: { flex: 1 },
    candidateName: { fontSize: 17, fontWeight: '900', color: Colors.gray900 },
    amharicName: { fontSize: 12, color: Colors.accentDark, fontWeight: '700', marginTop: 1 },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primary + '10',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    categoryBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

    /* Photo gallery strip styles */
    photoSectionContainer: {
        backgroundColor: Colors.gray50,
        borderRadius: BorderRadius.lg,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    photoSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    photoHeaderLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    photoSectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.gray800 },
    photoCounterBadge: { fontSize: 11, fontWeight: '700', color: Colors.accentDark },
    photoStripScroll: { gap: 8, paddingRight: 8 },
    photoThumbnailCard: {
        width: 90,
        height: 90,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: Colors.gray200,
        backgroundColor: Colors.white,
    },
    photoThumbnailImage: { width: '100%', height: '100%' },
    photoTypeTagPill: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        paddingVertical: 3,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    photoTypeTagText: { fontSize: 9, fontWeight: '800', color: Colors.white },

    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BorderRadius.md,
    },
    chipSuccess: { backgroundColor: Colors.success + '15' },
    chipWarning: { backgroundColor: Colors.warning + '15' },
    chipText: { fontSize: 11, fontWeight: '800' },
    chipNeutral: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.gray100,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BorderRadius.md,
    },
    chipTextNeutral: { fontSize: 11, fontWeight: '700', color: Colors.gray700 },
    chipTeal: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.accent + '15',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BorderRadius.md,
    },
    chipTextTeal: { fontSize: 11, fontWeight: '800', color: Colors.accentDark },
    summaryQuoteBox: {
        backgroundColor: Colors.gray50,
        borderLeftWidth: 3,
        borderLeftColor: Colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BorderRadius.sm,
        marginBottom: 12,
    },
    summaryText: { fontSize: 12, color: Colors.gray700, fontStyle: 'italic', lineHeight: 17 },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    tagItem: {
        backgroundColor: Colors.gray100,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
    },
    tagText: { fontSize: 11, color: Colors.gray600, fontWeight: '600' },
    tagItemSecondary: {
        backgroundColor: Colors.primary + '08',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
    },
    tagTextSecondary: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.gray100,
        gap: 10,
    },
    secondaryActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray100,
        flex: 1,
    },
    secondaryActionText: { fontSize: 12, fontWeight: '700', color: Colors.primary, flex: 1 },
    primaryActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.accent,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: BorderRadius.md,
        elevation: 1,
    },
    primaryActionText: { fontSize: 13, fontWeight: '800', color: Colors.white },

    /* Viewer Modal Styles */
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
    viewerFullProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.accent,
        paddingVertical: 13,
        borderRadius: BorderRadius.lg,
    },
    viewerFullProfileText: { fontSize: 14, fontWeight: '800', color: Colors.white },
});

