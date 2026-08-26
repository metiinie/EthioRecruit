import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => {
    const queryClient = useQueryClient();

    const notificationsQuery = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(),
        enabled: visible,
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const notifications: any[] = notificationsQuery.data?.data || notificationsQuery.data || [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;

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
                            {/* Modal Header */}
                            <View style={styles.header}>
                                <View style={styles.headerTitleRow}>
                                    <View style={styles.bellBadgeWrapper}>
                                        <Ionicons name="notifications" size={20} color={Colors.accent} />
                                        {unreadCount > 0 && (
                                            <View style={styles.unreadPill}>
                                                <Text style={styles.unreadPillText}>{unreadCount}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.title}>Notifications</Text>
                                </View>
                                <View style={styles.headerActions}>
                                    {unreadCount > 0 && (
                                        <TouchableOpacity
                                            onPress={() => markAllReadMutation.mutate()}
                                            disabled={markAllReadMutation.isPending}
                                            style={styles.markAllBtn}
                                        >
                                            <Text style={styles.markAllText}>Mark all read</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                        <Ionicons name="close" size={20} color={Colors.gray500} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Content */}
                            {notificationsQuery.isLoading ? (
                                <View style={styles.centered}>
                                    <ActivityIndicator size="large" color={Colors.accent} />
                                </View>
                            ) : notifications.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="notifications-off-outline" size={48} color={Colors.gray300} />
                                    <Text style={styles.emptyTitle}>No Notifications Yet</Text>
                                    <Text style={styles.emptySub}>
                                        You'll get updates on candidate inquiries, status changes, and messages here.
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={notifications}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.card, !item.isRead && styles.unreadCard]}
                                            onPress={() => !item.isRead && markReadMutation.mutate(item.id)}
                                            activeOpacity={0.8}
                                        >
                                            <View
                                                style={[
                                                    styles.iconCircle,
                                                    !item.isRead && styles.iconCircleUnread,
                                                ]}
                                            >
                                                <Ionicons
                                                    name={
                                                        item.type === 'INQUIRY'
                                                            ? 'chatbubble-text'
                                                            : item.type === 'APPLICATION'
                                                                ? 'document-text'
                                                                : 'notifications'
                                                    }
                                                    size={20}
                                                    color={!item.isRead ? Colors.accent : Colors.gray600}
                                                />
                                            </View>

                                            <View style={styles.cardContent}>
                                                <View style={styles.cardTitleRow}>
                                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                                    {!item.isRead && <View style={styles.unreadDot} />}
                                                </View>
                                                <Text style={styles.cardBody}>{item.body}</Text>
                                                <Text style={styles.timeText}>
                                                    {new Date(item.createdAt).toLocaleDateString()} •{' '}
                                                    {new Date(item.createdAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'flex-end',
    },
    container: {
        maxHeight: '80%',
        backgroundColor: Colors.white,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -5 },
        shadowRadius: 15,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray100,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bellBadgeWrapper: {
        position: 'relative',
    },
    unreadPill: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: Colors.error,
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 1,
        minWidth: 16,
        alignItems: 'center',
    },
    unreadPillText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '800',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.gray900,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    markAllBtn: {
        backgroundColor: Colors.accent + '15',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
    },
    markAllText: {
        color: Colors.accentDark,
        fontSize: 12,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray100,
    },
    centered: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        gap: 10,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.gray800,
    },
    emptySub: {
        fontSize: 13,
        color: Colors.gray500,
        textAlign: 'center',
        maxWidth: 280,
    },
    listContent: {
        paddingBottom: Spacing.xl,
        gap: 10,
    },
    card: {
        flexDirection: 'row',
        padding: 14,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.gray50,
        borderWidth: 1,
        borderColor: Colors.gray200,
        alignItems: 'flex-start',
        gap: 12,
    },
    unreadCard: {
        backgroundColor: Colors.white,
        borderColor: Colors.accent + '50',
    },
    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.gray200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircleUnread: {
        backgroundColor: Colors.accent + '18',
    },
    cardContent: {
        flex: 1,
    },
    cardTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.gray900,
    },
    cardBody: {
        fontSize: 13,
        color: Colors.gray600,
        marginTop: 3,
        lineHeight: 18,
    },
    timeText: {
        fontSize: 11,
        color: Colors.gray400,
        marginTop: 6,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.accent,
    },
});
