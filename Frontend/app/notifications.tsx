import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../services/notificationService';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationService.getNotifications();
            setNotifications(res.data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            );
        } catch (error) {
            // silent fail
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            Alert.alert('Success', 'All notifications marked as read');
        } catch (error) {
            Alert.alert('Error', 'Failed to mark all as read');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1A365D" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Notifications',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleMarkAllRead} style={{ marginRight: 15 }}>
                            <Text style={styles.headerAction}>Mark all read</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-outline" size={64} color="#CBD5E0" />
                    <Text style={styles.emptyTitle}>No Notifications Yet</Text>
                    <Text style={styles.emptySub}>You will get updates on application status changes and inquiry replies here.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                style={[styles.card, !item.isRead && styles.unreadCard]}
                                onPress={() => handleMarkAsRead(item.id)}
                            >
                                <View style={styles.iconCircle}>
                                    <Ionicons
                                        name={item.type === 'APPLICATION' ? 'document-text' : 'notifications'}
                                        size={22}
                                        color="#1A365D"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.body}>{item.body}</Text>
                                    <Text style={styles.timeText}>
                                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>

                                {!item.isRead && <View style={styles.unreadDot} />}
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerAction: { color: '#2B6CB0', fontSize: 13, fontWeight: '600' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A5568', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', marginTop: 8 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    unreadCard: { backgroundColor: '#F0F4F8', borderWidth: 1, borderColor: '#CBD5E0' },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#EDF2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { fontSize: 15, fontWeight: 'bold', color: '#1A365D' },
    body: { fontSize: 13, color: '#4A5568', marginTop: 4 },
    timeText: { fontSize: 11, color: '#A0AEC0', marginTop: 6 },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D69E2E', marginLeft: 8 },
});
