import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants';
import { getValidImageUri } from '../utils/imageUtils';
import { AgencyContactBar } from './AgencyContactBar';

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
    if (!candidate) return null;

    const isMedicalCleared =
        candidate.medicalStatus === 'cleared' ||
        candidate.medicalStatus === 'PASSED_GAMCA' ||
        candidate.medicalStatus === 'PASSED_LOCAL' ||
        candidate.medicalStatus === 'PASSED';

    const agencyName = candidate.agency?.name || 'Verified Agency';
    const isVerified = candidate.agency?.isVerified ?? true;
    const categoryName = candidate.category?.name || candidate.appliedPosition || 'Domestic Worker';
    const expYears = candidate.yearsOfExperience || candidate.experienceYears || '1+';

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={onPress}
            activeOpacity={0.92}
        >
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
            <View style={styles.candidateHeroRow}>
                {getValidImageUri(candidate.photoUrl) ? (
                    <Image source={{ uri: getValidImageUri(candidate.photoUrl)! }} style={styles.avatarImage} />
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
            </View>

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
                    <Text style={styles.secondaryActionText}>View Profile</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>

                {onInquire && (
                    <TouchableOpacity
                        style={styles.primaryActionBtn}
                        onPress={onInquire}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="chatbubble-ellipses" size={15} color={Colors.white} />
                        <Text style={styles.primaryActionText}>Inquire Candidate</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 2,
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
        marginBottom: 12,
    },
    avatarImage: { width: 54, height: 54, borderRadius: 27 },
    avatarCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: { color: Colors.white, fontWeight: '900', fontSize: 22 },
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
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray100,
    },
    secondaryActionText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
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
});
