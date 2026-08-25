import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';

export default function AgencySettingsScreen() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [licenseNumber, setLicenseNumber] = useState('');
    const [bio, setBio] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const [channels, setChannels] = useState<any[]>([]);
    const [newChannelType, setNewChannelType] = useState('WHATSAPP');
    const [newChannelValue, setNewChannelValue] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await adminService.getSettings();
            const settings = res.data?.settings || {};
            setLicenseNumber(settings.licenseNumber || '');
            setBio(settings.bio || '');
            setLogoUrl(settings.logoUrl || '');
            setContactEmail(settings.contactEmail || '');
            setContactPhone(settings.contactPhone || '');
            setChannels(res.data?.contactChannels || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load agency settings');
        } finally {
            setLoading(false);
        }
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
            Alert.alert('Success', 'Agency settings updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleAddChannel = async () => {
        if (!newChannelValue.trim()) return;
        try {
            const res = await adminService.addContactChannel({
                type: newChannelType,
                value: newChannelValue,
                label: newChannelType,
            });
            setChannels((prev) => [...prev, res.data]);
            setNewChannelValue('');
        } catch (error) {
            Alert.alert('Error', 'Failed to add contact channel');
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
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <Stack.Screen options={{ title: 'Agency Profile & Settings' }} />

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Agency Credentials</Text>

                <Text style={styles.label}>Ministry License Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. MOLS/ETH/2026/0492"
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                />

                <Text style={styles.label}>Agency Bio & Overview</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={3}
                    placeholder="Brief history, office locations, specialized candidate categories..."
                    value={bio}
                    onChangeText={setBio}
                />

                <Text style={styles.label}>Logo Image URL</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://cloudinary.com/logo.png"
                    value={logoUrl}
                    onChangeText={setLogoUrl}
                />

                <Text style={styles.label}>Official Contact Email</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    value={contactEmail}
                    onChangeText={setContactEmail}
                />

                <Text style={styles.label}>Official Phone Number</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={contactPhone}
                    onChangeText={setContactPhone}
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Settings</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Contact Channels Section */}
            <View style={[styles.card, { marginTop: 20 }]}>
                <Text style={styles.cardTitle}>Contact Channels</Text>
                <Text style={styles.cardSub}>Add WhatsApp, Telegram, or hotline channels for direct seeker & employer inquiries.</Text>

                {channels.map((c) => (
                    <View key={c.id} style={styles.channelRow}>
                        <Ionicons
                            name={c.channelType === 'WHATSAPP' ? 'logo-whatsapp' : 'call'}
                            size={20}
                            color="#1A365D"
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.channelType}>{c.channelType}</Text>
                            <Text style={styles.channelValue}>{c.channelValue}</Text>
                        </View>
                    </View>
                ))}

                <View style={styles.addChannelBox}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        placeholder="e.g. +251 911 000 000"
                        value={newChannelValue}
                        onChangeText={setNewChannelValue}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={handleAddChannel}>
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A365D', marginBottom: 4 },
    cardSub: { fontSize: 12, color: '#718096', marginBottom: 12 },
    label: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginTop: 12, marginBottom: 4 },
    input: { backgroundColor: '#EDF2F7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#2D3748', fontSize: 14 },
    textArea: { height: 75, textAlignVertical: 'top' },
    saveBtn: { marginTop: 20, backgroundColor: '#1A365D', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    saveBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
    channelRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
    channelType: { fontSize: 12, fontWeight: 'bold', color: '#718096' },
    channelValue: { fontSize: 14, color: '#2D3748' },
    addChannelBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    addBtn: { width: 44, height: 44, backgroundColor: '#D69E2E', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
