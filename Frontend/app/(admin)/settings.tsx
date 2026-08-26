import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';

export default function AgencySettingsScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [licenseNumber, setLicenseNumber] = useState('');
    const [bio, setBio] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const [channels, setChannels] = useState<any[]>([]);
    const [newChannelType, setNewChannelType] = useState('WHATSAPP');
    const [newChannelValue, setNewChannelValue] = useState('');

    const loadSettings = async () => {
        try {
            const res = await adminService.getSettings();
            const settings = res.data?.settings || {};
            setLicenseNumber(settings.licenseNumber || 'MOLS/ETH/2026/0492');
            setBio(settings.bio || '');
            setLogoUrl(settings.logoUrl || '');
            setContactEmail(settings.contactEmail || '');
            setContactPhone(settings.contactPhone || '');
            setChannels(res.data?.contactChannels || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load agency credentials');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadSettings();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadSettings();
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminService.updateSettings({
                licenseNumber,
                bio,
                logoUrl,
                contactEmail,
                contactPhone,
            });
            Alert.alert('Success', 'Agency credentials updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update credentials');
        } finally {
            setSaving(false);
        }
    };

    const handleAddChannel = async () => {
        if (!newChannelValue.trim()) {
            Alert.alert('Missing Value', 'Please enter a contact number or handle.');
            return;
        }
        try {
            const res = await adminService.addContactChannel({
                type: newChannelType,
                value: newChannelValue,
                label: newChannelType,
            });
            setChannels((prev) => [...prev, res.data]);
            setNewChannelValue('');
            Alert.alert('Success', `${newChannelType} channel added!`);
        } catch (error) {
            Alert.alert('Error', 'Failed to add contact channel');
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Loading agency credentials...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Agency Credentials</Text>
                    <Text style={styles.subTitle}>Ministry License & Official Agency Verification</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#10B981', '#2563EB']} />
                }
            >
                {/* Official Verification Banner */}
                <View style={styles.verificationBanner}>
                    <View style={styles.shieldIconCircle}>
                        <Ionicons name="shield-checkmark" size={28} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.verificationTitle}>Official License Verified</Text>
                        <Text style={styles.verificationSub}>Ministry of Labour & Skills (MoLS) Accredited Overseas Recruitment Agency</Text>
                    </View>
                </View>

                {/* Primary Credentials Card */}
                <View style={styles.card}>
                    <Text style={styles.cardHeaderTitle}>Ministry License & Profile</Text>

                    <Text style={styles.label}>Ministry License Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. MOLS/ETH/2026/0492"
                        placeholderTextColor="#94A3B8"
                        value={licenseNumber}
                        onChangeText={setLicenseNumber}
                    />

                    <Text style={styles.label}>Agency Bio & Overview</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        numberOfLines={3}
                        placeholder="Brief history, specialized overseas recruitment categories..."
                        placeholderTextColor="#94A3B8"
                        value={bio}
                        onChangeText={setBio}
                    />

                    <Text style={styles.label}>Logo Image URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/logo.png"
                        placeholderTextColor="#94A3B8"
                        value={logoUrl}
                        onChangeText={setLogoUrl}
                    />

                    <Text style={styles.label}>Official Contact Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="official@agency.com"
                        placeholderTextColor="#94A3B8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={contactEmail}
                        onChangeText={setContactEmail}
                    />

                    <Text style={styles.label}>Official Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="+251 911 000 000"
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                    />

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                                <Text style={styles.saveBtnText}>Save Credentials</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Direct Contact Channels Card */}
                <View style={styles.card}>
                    <Text style={styles.cardHeaderTitle}>Direct Contact Channels</Text>
                    <Text style={styles.cardSub}>Add WhatsApp, Telegram, or hotline channels for candidates & employers.</Text>

                    {channels.length === 0 ? (
                        <Text style={styles.noChannelText}>No additional contact channels configured.</Text>
                    ) : (
                        channels.map((c) => (
                            <View key={c.id || c.value} style={styles.channelRow}>
                                <View style={styles.channelIconCircle}>
                                    <Ionicons
                                        name={c.type === 'WHATSAPP' || c.channelType === 'WHATSAPP' ? 'logo-whatsapp' : 'call-outline'}
                                        size={18}
                                        color={c.type === 'WHATSAPP' || c.channelType === 'WHATSAPP' ? '#25D366' : '#2563EB'}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.channelType}>{c.type || c.channelType || 'CHANNEL'}</Text>
                                    <Text style={styles.channelValue}>{c.value || c.channelValue}</Text>
                                </View>
                            </View>
                        ))
                    )}

                    <Text style={styles.label}>Add New Channel</Text>
                    <View style={styles.channelTypeSelector}>
                        {['WHATSAPP', 'TELEGRAM', 'PHONE'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.typePill, newChannelType === t && styles.typePillActive]}
                                onPress={() => setNewChannelType(t)}
                            >
                                <Text style={[styles.typePillText, newChannelType === t && styles.typePillTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.addChannelBox}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="e.g. +251 911 222 333"
                            placeholderTextColor="#94A3B8"
                            value={newChannelValue}
                            onChangeText={setNewChannelValue}
                        />
                        <TouchableOpacity style={styles.addChannelBtn} onPress={handleAddChannel} activeOpacity={0.8}>
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' }, // Light default theme
    header: {
        paddingTop: 56,
        paddingHorizontal: 18,
        paddingBottom: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    title: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
    subTitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 18, gap: 14, paddingBottom: 40 },
    verificationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        padding: 14,
        borderRadius: 16,
    },
    shieldIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verificationTitle: { fontSize: 15, fontWeight: '800', color: '#065F46' },
    verificationSub: { fontSize: 12, color: '#047857', marginTop: 2, fontWeight: '500' },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    cardHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
    cardSub: { fontSize: 12, color: '#64748B', marginBottom: 12 },
    label: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 12, marginBottom: 6 },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        paddingHorizontal: 12,
        height: 44,
        color: '#0F172A',
        fontSize: 14,
    },
    textArea: { height: 75, paddingVertical: 10, textAlignVertical: 'top' },
    saveBtn: {
        marginTop: 20,
        backgroundColor: '#10B981', // Brand Emerald Green
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
    noChannelText: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic', marginVertical: 8 },
    channelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    channelIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    channelType: { fontSize: 11, fontWeight: '800', color: '#64748B' },
    channelValue: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
    channelTypeSelector: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    typePill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#F8FAFC',
    },
    typePillActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    typePillText: { fontSize: 11, fontWeight: '700', color: '#475569' },
    typePillTextActive: { color: '#FFFFFF' },
    addChannelBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    addChannelBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#2563EB',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
