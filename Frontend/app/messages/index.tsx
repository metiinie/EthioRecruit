import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../../services/chatService';

export default function ConversationsScreen() {
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setLoading(true);
        try {
            const res = await chatService.getConversations();
            setConversations(res.data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load messages');
        } finally {
            setLoading(false);
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
            <Stack.Screen options={{ title: 'Messages & Inquiries' }} />

            {conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E0" />
                    <Text style={styles.emptyTitle}>No Active Conversations</Text>
                    <Text style={styles.emptySub}>Inquire on candidate profiles or vacancies to start chatting with agencies.</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => {
                        const agency = item.agency;
                        const lastMessage = item.messages?.[0];
                        return (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => router.push(`/messages/${item.id}`)}
                            >
                                <Image
                                    source={{
                                        uri: agency?.logoUrl || 'https://via.placeholder.com/150.png?text=Agency',
                                    }}
                                    style={styles.logo}
                                />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <View style={styles.topRow}>
                                        <Text style={styles.agencyName}>{agency?.name || 'Recruitment Agency'}</Text>
                                        {lastMessage && (
                                            <Text style={styles.timeText}>
                                                {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={styles.lastMsgText} numberOfLines={1}>
                                        {lastMessage ? lastMessage.text : 'Tap to open chat...'}
                                    </Text>
                                </View>
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
    logo: { width: 48, height: 48, borderRadius: 24 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    agencyName: { fontSize: 16, fontWeight: 'bold', color: '#1A365D' },
    timeText: { fontSize: 11, color: '#A0AEC0' },
    lastMsgText: { fontSize: 13, color: '#718096', marginTop: 4 },
});
