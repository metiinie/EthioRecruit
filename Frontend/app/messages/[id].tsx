import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../stores/authStore';

export default function ChatRoomScreen() {
    const { id: conversationId } = useLocalSearchParams<{ id: string }>();
    const user = useAuthStore((s) => s.user);

    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (conversationId) {
            loadMessages();
            chatService.markAsRead(conversationId);
        }
    }, [conversationId]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const res = await chatService.getMessages(conversationId!);
            setMessages(res.data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load chat history');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;
        const textToSend = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            const res = await chatService.sendMessage(conversationId!, textToSend);
            setMessages((prev) => [...prev, res.data]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (error) {
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Chat Conversation' }} />

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    renderItem={({ item }) => {
                        const isMine = item.senderType === 'user';
                        return (
                            <View style={[styles.bubbleWrapper, isMine ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
                                <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                                    <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                                        {item.text}
                                    </Text>
                                    <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.theirTimeText]}>
                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#A0AEC0"
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                    />

                    <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="send" size={18} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bubbleWrapper: { width: '100%', marginBottom: 10, flexDirection: 'row' },
    myBubbleWrapper: { justifyContent: 'flex-end' },
    theirBubbleWrapper: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
    myBubble: { backgroundColor: '#1A365D', borderBottomRightRadius: 2 },
    theirBubble: { backgroundColor: '#EDF2F7', borderBottomLeftRadius: 2 },
    messageText: { fontSize: 14, lineHeight: 20 },
    myMessageText: { color: '#FFFFFF' },
    theirMessageText: { color: '#2D3748' },
    timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    myTimeText: { color: '#E2E8F0' },
    theirTimeText: { color: '#A0AEC0' },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    input: {
        flex: 1,
        backgroundColor: '#EDF2F7',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#2D3748',
        fontSize: 14,
        marginRight: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1A365D',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
