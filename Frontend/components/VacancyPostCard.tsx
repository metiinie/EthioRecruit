import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants';
import { AgencyContactBar } from './AgencyContactBar';

interface VacancyPostCardProps {
    vacancy: any;
    onPress?: () => void;
    onApply?: () => void;
    onToggleBookmark?: () => void;
    isBookmarked?: boolean;
}

export function VacancyPostCard({
    vacancy,
    onPress,
    onApply,
    onToggleBookmark,
    isBookmarked = false,
}: VacancyPostCardProps) {
    if (!vacancy) return null;

    const agencyName = vacancy.agency?.name || 'EthioRecruit Verified Agency';
    const isVerified = vacancy.agency?.isVerified ?? true;

    const salaryText = vacancy.salaryMin
        ? `${vacancy.salaryCurrency || 'SAR'} ${vacancy.salaryMin}`
        : 'Negotiable Salary';

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
                        <Ionicons name="business" size={16} color={Colors.accentDark} />
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
                        <Text style={styles.postMetaSub}>Overseas Vacancy • Active Recruitment</Text>
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

            {/* 2. Job Title & Salary Highlight Row */}
            <View style={styles.jobTitleRow}>
                <View style={styles.jobTitleCol}>
                    <Text style={styles.jobTitle}>{vacancy.title}</Text>
                    {vacancy.category?.name ? (
                        <Text style={styles.categorySub}>{vacancy.category.name}</Text>
                    ) : null}
                </View>

                <View style={styles.salaryBadge}>
                    <Text style={styles.salaryText}>{salaryText}</Text>
                </View>
            </View>

            {/* 3. Metadata Chips Grid */}
            <View style={styles.chipsRow}>
                {/* Location */}
                <View style={styles.chipNeutral}>
                    <Ionicons name="location-outline" size={13} color={Colors.primary} />
                    <Text style={styles.chipTextNeutral}>
                        {vacancy.country || 'Gulf Region'} {vacancy.city ? `(${vacancy.city})` : ''}
                    </Text>
                </View>

                {/* Contract Duration */}
                <View style={styles.chipNeutral}>
                    <Ionicons name="calendar-outline" size={13} color={Colors.gray700} />
                    <Text style={styles.chipTextNeutral}>
                        {vacancy.contractPeriodYears || 2} Year Contract
                    </Text>
                </View>

                {/* Open Positions Count */}
                {vacancy.positionsCount ? (
                    <View style={styles.chipTeal}>
                        <Ionicons name="people-outline" size={13} color={Colors.accentDark} />
                        <Text style={styles.chipTextTeal}>{vacancy.positionsCount} Openings</Text>
                    </View>
                ) : null}
            </View>

            {/* 4. Job Description Snippet */}
            {vacancy.description ? (
                <Text style={styles.descriptionText} numberOfLines={2}>
                    {vacancy.description}
                </Text>
            ) : null}

            {/* 5. Perks & Benefits Chips */}
            <View style={styles.perksRow}>
                {vacancy.visaSponsorship ?? true ? (
                    <View style={styles.perkChip}>
                        <Ionicons name="airplane-outline" size={12} color={Colors.accentDark} />
                        <Text style={styles.perkText}>Visa Included</Text>
                    </View>
                ) : null}

                {vacancy.accommodationProvided ?? true ? (
                    <View style={styles.perkChip}>
                        <Ionicons name="home-outline" size={12} color={Colors.accentDark} />
                        <Text style={styles.perkText}>Housing Provided</Text>
                    </View>
                ) : null}

                {vacancy.mealsProvided ? (
                    <View style={styles.perkChip}>
                        <Ionicons name="restaurant-outline" size={12} color={Colors.accentDark} />
                        <Text style={styles.perkText}>Meals Included</Text>
                    </View>
                ) : null}
            </View>

            {/* Direct Agency Contact Shortcuts */}
            <AgencyContactBar
                agency={vacancy.agency}
                vacancyTitle={vacancy.title}
                compact
            />

            {/* 6. Post Footer Action Bar */}
            <View style={styles.postFooter}>
                <TouchableOpacity
                    style={styles.secondaryActionBtn}
                    onPress={onPress}
                    activeOpacity={0.8}
                >
                    <Text style={styles.secondaryActionText}>View Job Details</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>

                {onApply && (
                    <TouchableOpacity
                        style={styles.primaryActionBtn}
                        onPress={onApply}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="paper-plane" size={14} color={Colors.white} />
                        <Text style={styles.primaryActionText}>Apply Now</Text>
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
        backgroundColor: Colors.accent + '18',
        justifyContent: 'center',
        alignItems: 'center',
    },
    agencyTextCol: { flex: 1 },
    agencyNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    agencyName: { fontSize: 13, fontWeight: '800', color: Colors.gray900 },
    postMetaSub: { fontSize: 11, color: Colors.gray500, marginTop: 1 },
    bookmarkBtn: { padding: 4 },
    divider: { height: 1, backgroundColor: Colors.gray100, marginBottom: 12 },
    jobTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    jobTitleCol: { flex: 1 },
    jobTitle: { fontSize: 17, fontWeight: '900', color: Colors.gray900, lineHeight: 22 },
    categorySub: { fontSize: 12, color: Colors.gray500, fontWeight: '600', marginTop: 2 },
    salaryBadge: {
        backgroundColor: Colors.accent + '15',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.accent + '30',
    },
    salaryText: { fontSize: 13, fontWeight: '900', color: Colors.accentDark },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10,
    },
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
        backgroundColor: Colors.primary + '10',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BorderRadius.md,
    },
    chipTextTeal: { fontSize: 11, fontWeight: '800', color: Colors.primary },
    descriptionText: {
        fontSize: 12,
        color: Colors.gray600,
        lineHeight: 18,
        marginBottom: 10,
    },
    perksRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    perkChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.accent + '10',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
    },
    perkText: { fontSize: 11, color: Colors.accentDark, fontWeight: '700' },
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
