import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants';
import { notificationService } from '../services/notificationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function NotificationsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'all' | 'unread' | 'inquiries'>('all');

    // Fetch Notifications
    const notificationsQuery = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(),
    });

    // Mark single notification as read mutation
    const markReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    // Mark all as read mutation
    const markAllReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            Alert.alert('Done', 'All notifications marked as read');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to mark notifications as read');
        },
    });

    const notifications: any[] = notificationsQuery.data?.data || notificationsQuery.data || [];
    const isLoading = notificationsQuery.isLoading;
    const isRefetching = notificationsQuery.isRefetching;

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const inquiriesCount = notifications.filter(
        (n) => n.type === 'INQUIRY' || n.type === 'CANDIDATE' || n.title?.toLowerCase().includes('inquiry')
    ).length;

    let filteredList = notifications;
    if (filter === 'unread') {
        filteredList = notifications.filter((n) => !n.isRead);
    } else if (filter === 'inquiries') {
        filteredList = notifications.filter(
            (n) => n.type === 'INQUIRY' || n.type === 'CANDIDATE' || n.title?.toLowerCase().includes('inquiry')
        );
    }

    const handleNotificationPress = (item: any) => {
        if (!item.isRead) {
            markReadMutation.mutate(item.id);
        }
        // Intelligent routing based on notification payload/type
        if (item.type === 'INQUIRY' || item.title?.toLowerCase().includes('inquiry')) {
            router.push('/(tabs)/activity' as any);
        } else if (item.type === 'APPLICATION') {
            router.push('/(tabs)/activity' as any);
        }
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getIconInfo = (type?: string, title?: string) => {
        const titleLower = (title || '').toLowerCase();
        if (type === 'INQUIRY' || titleLower.includes('inquiry') || titleLower.includes('response')) {
            return { icon: 'chatbubbles', color: Colors.accent, bg: Colors.accent + '15' };
        }
        if (type === 'APPLICATION' || titleLower.includes('application')) {
            return { icon: 'document-text', color: Colors.info, bg: Colors.info + '15' };
        }
        if (titleLower.includes('cleared') || titleLower.includes('medical')) {
            return { icon: 'shield-checkmark', color: Colors.success, bg: Colors.success + '15' };
        }
        return { icon: 'notifications', color: Colors.primary, bg: Colors.primary + '15' };
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <Stack.Screen options={{ headerShown: false }} />

            {/* Top Navigation Header Bar */}
            <SafeAreaView style={styles.topHeaderNav}>
                <View style={styles.headerNavContent}>
                    <TouchableOpacity
                        style={styles.backIconButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={22} color={Colors.white} />
                    </TouchableOpacity>

                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.headerNavTitle}>Notifications Center</Text>
                        <Text style={styles.headerNavSub}>
                            {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                        </Text>
                    </View>

                    {unreadCount > 0 ? (
                        <TouchableOpacity
                            style={styles.markAllBtn}
                            onPress={() => markAllReadMutation.mutate()}
                            disabled={markAllReadMutation.isPending}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="checkmark-done" size={18} color={Colors.accent} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 38 }} />
                    )}
                </View>
            </SafeAreaView>

            {/* Category Filter Chips */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabChip, filter === 'all' && styles.tabChipActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>
                        All ({notifications.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabChip, filter === 'unread' && styles.tabChipActive]}
                    onPress={() => setFilter('unread')}
                >
                    <View style={styles.chipRow}>
                        {unreadCount > 0 && <View style={styles.unreadDotBadge} />}
                        <Text style={[styles.tabText, filter === 'unread' && styles.tabTextActive]}>
                            Unread ({unreadCount})
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabChip, filter === 'inquiries' && styles.tabChipActive]}
                    onPress={() => setFilter('inquiries')}
                >
                    <Text style={[styles.tabText, filter === 'inquiries' && styles.tabTextActive]}>
                        Inquiries ({inquiriesCount})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Notifications Scroll List */}
            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                    <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={() => notificationsQuery.refetch()}
                            tintColor={Colors.accent}
                        />
                    }
                >
                    {filteredList.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="notifications-off-outline" size={48} color={Colors.gray400} />
                            </View>
                            <Text style={styles.emptyTitle}>No Notifications</Text>
                            <Text style={styles.emptySub}>
                                You have no notifications matching this filter at the moment.
                            </Text>
                        </View>
                    ) : (
                        filteredList.map((item: any) => {
                            const iconMeta = getIconInfo(item.type, item.title);
                            const isUnread = !item.isRead;

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.card, isUnread && styles.unreadCard]}
                                    onPress={() => handleNotificationPress(item)}
                                    activeOpacity={0.88}
                                >
                                    {/* Unread Teal Bar Indicator */}
                                    {isUnread && <View style={styles.unreadBarIndicator} />}

                                    <View style={[styles.iconCircle, { backgroundColor: iconMeta.bg }]}>
                                        <Ionicons name={iconMeta.icon as any} size={20} color={iconMeta.color} />
                                    </View>

                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeaderRow}>
                                            <Text style={[styles.cardTitle, isUnread && styles.unreadTitle]} numberOfLines={1}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
                                        </View>

                                        <Text style={styles.cardBody} numberOfLines={2}>
                                            {item.body}
                                        </Text>

                                        {isUnread && (
                                            <View style={styles.unreadTag}>
                                                <View style={styles.smallDot} />
                                                <Text style={styles.unreadTagText}>New Update</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: Colors.gray600, fontSize: 14, fontWeight: '600' },

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
        fontSize: 17,
        fontWeight: '800',
        color: Colors.white,
    },
    headerNavSub: {
        fontSize: 11,
        color: Colors.accent,
        fontWeight: '600',
        marginTop: 1,
    },
    markAllBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* Category Filter Chips */
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: 8,
    },
    tabChip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    tabChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    unreadDotBadge: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.error },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.gray600,
    },
    tabTextActive: {
        color: Colors.white,
        fontWeight: '700',
    },

    listContent: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 40 },
    emptyContainer: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gray200,
        marginTop: Spacing.md,
    },
    emptyIconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: Colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.gray900 },
    emptySub: { fontSize: 13, color: Colors.gray500, textAlign: 'center', marginTop: 6, lineHeight: 18 },

    /* Card */
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    unreadCard: {
        backgroundColor: Colors.accent + '05',
        borderColor: Colors.accent + '40',
    },
    unreadBarIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: Colors.accent,
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: { flex: 1 },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray800, flex: 1, marginRight: 8 },
    unreadTitle: { fontWeight: '900', color: Colors.gray900 },
    timeText: { fontSize: 11, color: Colors.gray400, fontWeight: '600' },
    cardBody: { fontSize: 13, color: Colors.gray600, marginTop: 3, lineHeight: 18 },
    unreadTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 6,
    },
    smallDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
    unreadTagText: { fontSize: 11, fontWeight: '800', color: Colors.accentDark },
});
