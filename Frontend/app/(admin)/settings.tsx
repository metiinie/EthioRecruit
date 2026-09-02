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
    Image,
    Linking,
    Modal,
    Switch,
    Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { adminService } from '../../services/adminService';
import { useAdminAuthStore } from '../../stores/adminAuthStore';

export default function AgencyProfileScreen() {
    const router = useRouter();
    const { admin, logout } = useAdminAuthStore();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile Data State
    const [agencyName, setAgencyName] = useState('EthioRecruit Overseas Agency');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [bio, setBio] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    // System Settings Toggles
    const [allowInAppApplications, setAllowInAppApplications] = useState(true);
    const [showSalaryInVacancies, setShowSalaryInVacancies] = useState(true);
    const [notifyAdminOnNewInquiry, setNotifyAdminOnNewInquiry] = useState(true);

    // Contact Channels
    const [channels, setChannels] = useState<any[]>([]);
    const [newChannelType, setNewChannelType] = useState('WHATSAPP');
    const [newChannelValue, setNewChannelValue] = useState('');

    // Edit Modal State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const loadSettings = async () => {
        try {
            const res = await adminService.getSettings();
            const settings = res.data?.settings || {};
            setLicenseNumber(settings.licenseNumber || 'MOLS/ETH/2026/0492');
            setBio(settings.bio || 'Accredited overseas recruitment agency providing vetted Ethiopian talent for international opportunities across the Gulf, Middle East, and worldwide.');
            setLogoUrl(settings.logoUrl || '');
            setContactEmail(settings.contactEmail || admin?.email || 'contact@ethiorecruit.com');
            setContactPhone(settings.contactPhone || '+251 911 000 000');

            setAllowInAppApplications(settings.allowInAppApplications ?? true);
            setShowSalaryInVacancies(settings.showSalaryInVacancies ?? true);
            setNotifyAdminOnNewInquiry(settings.notifyAdminOnNewInquiry ?? true);

            setChannels(res.data?.contactChannels || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load agency profile settings');
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

    // Pick Logo Image from Gallery or Camera
    const pickLogoMedia = async (source: 'gallery' | 'camera') => {
        try {
            const permissionResult =
                source === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission Denied', `Camera/Gallery permission is required to select logo.`);
                return;
            }

            const result =
                source === 'camera'
                    ? await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    })
                    : await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setLogoUrl(result.assets[0].uri);
            }
        } catch (err: any) {
            Alert.alert('Media Error', err.message || 'Failed to select logo image');
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await adminService.updateSettings({
                licenseNumber,
                bio,
                logoUrl,
                contactEmail,
                contactPhone,
                allowInAppApplications,
                showSalaryInVacancies,
                notifyAdminOnNewInquiry,
            });
            Alert.alert('Success', 'Agency profile updated successfully!');
            setIsEditModalVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleSetting = async (key: string, value: boolean) => {
        if (key === 'allowInAppApplications') setAllowInAppApplications(value);
        if (key === 'showSalaryInVacancies') setShowSalaryInVacancies(value);
        if (key === 'notifyAdminOnNewInquiry') setNotifyAdminOnNewInquiry(value);

        try {
            await adminService.updateSettings({
                [key]: value,
            });
        } catch (err) {
            Alert.alert('Error', 'Failed to update setting preference');
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
                value: newChannelValue.trim(),
                label: newChannelType,
            });
            const newChan = res.data || res;
            setChannels((prev) => [...prev, newChan]);
            setNewChannelValue('');
            Alert.alert('Success', `${newChannelType} channel added successfully!`);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add contact channel');
        }
    };

    const openContactChannel = (type: string, value: string) => {
        const cleanValue = value.replace(/[^\d+]/g, '');
        const rawVal = value.trim();
        const typeUpper = (type || '').toUpperCase();

        if (typeUpper === 'WHATSAPP') {
            const phone = cleanValue.replace('+', '');
            const waApp = `whatsapp://send?phone=${phone}`;
            const waWeb = `https://wa.me/${phone}`;

            Linking.canOpenURL(waApp).then((supported) => {
                if (supported) Linking.openURL(waApp);
                else Linking.openURL(waWeb);
            }).catch(() => Linking.openURL(waWeb));
        } else if (typeUpper === 'TELEGRAM') {
            let tgUrl = `https://t.me/${rawVal.replace('@', '')}`;
            if (cleanValue && cleanValue.startsWith('+')) {
                tgUrl = `https://t.me/${cleanValue}`;
            }
            Linking.openURL(tgUrl).catch(() => Alert.alert('Error', 'Could not open Telegram app/web link'));
        } else if (typeUpper === 'PHONE') {
            Linking.openURL(`tel:${cleanValue || rawVal}`).catch(() => Alert.alert('Error', 'Could not launch phone dialer'));
        }
    };

    const handleLogout = () => {
        const performLogout = () => {
            logout();
            router.replace('/(auth)/admin-login' as any);
        };

        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out of the Admin Workspace?')) {
                performLogout();
            } else if (typeof window === 'undefined') {
                performLogout();
            }
        } else {
            Alert.alert('Log Out', 'Are you sure you want to sign out of the Admin Workspace?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: performLogout,
                },
            ]);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Loading agency profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Agency Profile</Text>
                    <Text style={styles.subTitle}>Official License, Accreditation & Settings</Text>
                </View>
                <TouchableOpacity
                    style={styles.editHeaderBtn}
                    onPress={() => setIsEditModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.editHeaderBtnText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#10B981', '#2563EB']} />
                }
            >
                {/* Hero Agency Profile Card */}
                <View style={styles.heroCard}>
                    <View style={styles.heroTopRow}>
                        {logoUrl ? (
                            <Image source={{ uri: logoUrl }} style={styles.heroLogo} resizeMode="cover" />
                        ) : (
                            <View style={styles.heroLogoPlaceholder}>
                                <Ionicons name="business" size={28} color="#2563EB" />
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <View style={styles.verifiedRow}>
                                <Text style={styles.heroAgencyName}>{agencyName}</Text>
                                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                            </View>
                            <Text style={styles.heroLicenseText}>MoLS License: {licenseNumber || 'MOLS/ETH/2026/0492'}</Text>
                        </View>
                    </View>

                    <View style={styles.heroBadgesRow}>
                        <View style={styles.heroBadgePill}>
                            <Ionicons name="shield-checkmark" size={13} color="#059669" />
                            <Text style={styles.heroBadgePillText}>MoLS Accredited</Text>
                        </View>
                        <View style={[styles.heroBadgePill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                            <Ionicons name="globe-outline" size={13} color="#2563EB" />
                            <Text style={[styles.heroBadgePillText, { color: '#1E40AF' }]}>Overseas Placement</Text>
                        </View>
                    </View>

                    {/* Quick Hero Actions */}
                    <View style={styles.heroQuickActions}>
                        <TouchableOpacity
                            style={styles.heroActionBtn}
                            onPress={() => openContactChannel('PHONE', contactPhone)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="call-outline" size={16} color="#0F172A" />
                            <Text style={styles.heroActionText}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.heroActionBtn}
                            onPress={() => openContactChannel('WHATSAPP', contactPhone)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                            <Text style={styles.heroActionText}>WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.heroActionBtn}
                            onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="mail-outline" size={16} color="#2563EB" />
                            <Text style={styles.heroActionText}>Email</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Subscription & Billing Package Card */}
                <View style={[styles.card, { backgroundColor: '#FEFCE8', borderColor: '#FEF08A' }]}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="ribbon" size={20} color="#D97706" />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardHeaderTitle, { color: '#854D0E' }]}>EthioRecruit SaaS Subscription</Text>
                            <Text style={{ fontSize: 11, color: '#A16207', fontWeight: '600' }}>Active Workspace Plan</Text>
                        </View>
                        <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A' }}>
                            <Text style={{ fontSize: 11, fontWeight: '900', color: '#B45309' }}>PRO AGENCY</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, marginVertical: 10, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FEF08A' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8' }}>Candidate Limit</Text>
                            <Text style={{ fontSize: 15, fontWeight: '900', color: '#0F172A', marginTop: 2 }}>Unlimited</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8' }}>Billing Cycle</Text>
                            <Text style={{ fontSize: 15, fontWeight: '900', color: '#059669', marginTop: 2 }}>Annual Paid</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8' }}>Expires On</Text>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#D97706', marginTop: 2 }}>Dec 31, 2026</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#D97706', paddingVertical: 10, borderRadius: 10 }}
                        onPress={() => Alert.alert('EthioRecruit SaaS Billing', 'Your agency is currently on the active Pro Agency Tier. Contact EthioRecruit Support to renew or upgrade.')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="card-outline" size={16} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Manage Plan & Billing</Text>
                    </TouchableOpacity>
                </View>

                {/* About & Bio Card */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="document-text-outline" size={18} color="#2563EB" />
                        <Text style={styles.cardHeaderTitle}>Agency Overview & Bio</Text>
                    </View>
                    <Text style={styles.bioText}>{bio}</Text>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Official Email</Text>
                            <Text style={styles.infoValue}>{contactEmail}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Official Phone</Text>
                            <Text style={styles.infoValue}>{contactPhone}</Text>
                        </View>
                    </View>
                </View>

                {/* Direct Contact Channels */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="chatbubbles-outline" size={18} color="#10B981" />
                        <Text style={styles.cardHeaderTitle}>Direct Contact Channels</Text>
                    </View>
                    <Text style={styles.cardSub}>Tap launch to open WhatsApp, Telegram, or Phone directly.</Text>

                    {channels.length === 0 ? (
                        <Text style={styles.noChannelText}>No contact channels added yet.</Text>
                    ) : (
                        channels.map((c) => {
                            const chanType = c.type || c.channelType || 'PHONE';
                            const chanVal = c.value || c.channelValue || '';
                            const isWhatsApp = chanType.toUpperCase() === 'WHATSAPP';
                            const isTelegram = chanType.toUpperCase() === 'TELEGRAM';

                            return (
                                <View key={c.id || chanVal} style={styles.channelRow}>
                                    <View style={[
                                        styles.channelIconCircle,
                                        isWhatsApp ? { backgroundColor: '#DCFCE7' } :
                                            isTelegram ? { backgroundColor: '#E0F2FE' } : { backgroundColor: '#F1F5F9' }
                                    ]}>
                                        <Ionicons
                                            name={isWhatsApp ? 'logo-whatsapp' : isTelegram ? 'paper-plane-outline' : 'call-outline'}
                                            size={18}
                                            color={isWhatsApp ? '#25D366' : isTelegram ? '#0284C7' : '#2563EB'}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.channelType}>{chanType}</Text>
                                        <Text style={styles.channelValue}>{chanVal}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.openBtn}
                                        onPress={() => openContactChannel(chanType, chanVal)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.openBtnText}>Launch</Text>
                                        <Ionicons name="open-outline" size={14} color="#2563EB" />
                                    </TouchableOpacity>
                                </View>
                            );
                        })
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

                {/* Application & Preference Settings */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="options-outline" size={18} color="#D97706" />
                        <Text style={styles.cardHeaderTitle}>App & Portal Preferences</Text>
                    </View>

                    <View style={styles.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.switchTitle}>Allow In-App Applications</Text>
                            <Text style={styles.switchSub}>Enable candidates to apply directly through EthioRecruit app</Text>
                        </View>
                        <Switch
                            value={allowInAppApplications}
                            onValueChange={(val) => handleToggleSetting('allowInAppApplications', val)}
                            trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                            thumbColor={allowInAppApplications ? '#10B981' : '#94A3B8'}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.switchTitle}>Show Salary in Vacancies</Text>
                            <Text style={styles.switchSub}>Display monthly wage estimates on job vacancy cards</Text>
                        </View>
                        <Switch
                            value={showSalaryInVacancies}
                            onValueChange={(val) => handleToggleSetting('showSalaryInVacancies', val)}
                            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                            thumbColor={showSalaryInVacancies ? '#2563EB' : '#94A3B8'}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.switchTitle}>New Inquiry Notifications</Text>
                            <Text style={styles.switchSub}>Alert recruiters when a job seeker sends a message</Text>
                        </View>
                        <Switch
                            value={notifyAdminOnNewInquiry}
                            onValueChange={(val) => handleToggleSetting('notifyAdminOnNewInquiry', val)}
                            trackColor={{ false: '#CBD5E1', true: '#FDE68A' }}
                            thumbColor={notifyAdminOnNewInquiry ? '#D97706' : '#94A3B8'}
                        />
                    </View>
                </View>

                {/* Account & Security Card */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="person-outline" size={18} color="#64748B" />
                        <Text style={styles.cardHeaderTitle}>Logged-in Account</Text>
                    </View>

                    <View style={styles.accountUserRow}>
                        <View style={styles.accountAvatar}>
                            <Text style={styles.accountAvatarText}>
                                {admin?.firstName?.[0] || 'A'}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.accountName}>
                                {admin?.firstName} {admin?.lastName}
                            </Text>
                            <Text style={styles.accountEmail}>{admin?.email}</Text>
                        </View>
                        <View style={styles.roleTag}>
                            <Text style={styles.roleTagText}>{admin?.role || 'ADMIN'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                        <Text style={styles.logoutBtnText}>Log Out of Workspace</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Agency Profile</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <Ionicons name="close-circle" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 18, gap: 12 }}>
                            <Text style={styles.label}>Ministry License Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. MOLS/ETH/2026/0492"
                                placeholderTextColor="#94A3B8"
                                value={licenseNumber}
                                onChangeText={setLicenseNumber}
                            />

                            <Text style={styles.label}>Agency Logo Image</Text>
                            {logoUrl ? (
                                <View style={styles.logoPreviewRow}>
                                    <Image source={{ uri: logoUrl }} style={styles.logoPreview} resizeMode="cover" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.logoUriText} numberOfLines={1}>{logoUrl}</Text>
                                        <TouchableOpacity onPress={() => setLogoUrl('')} style={{ marginTop: 4 }}>
                                            <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '700' }}>Remove Logo</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : null}

                            <View style={styles.mediaPickerRow}>
                                <TouchableOpacity
                                    style={styles.mediaBtn}
                                    onPress={() => pickLogoMedia('gallery')}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="images-outline" size={16} color="#2563EB" />
                                    <Text style={styles.mediaBtnText}>From Gallery</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.mediaBtn}
                                    onPress={() => pickLogoMedia('camera')}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="camera-outline" size={16} color="#10B981" />
                                    <Text style={styles.mediaBtnText}>Take Photo</Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={[styles.input, { marginTop: 4 }]}
                                placeholder="Or enter image URL (https://...)"
                                placeholderTextColor="#94A3B8"
                                value={logoUrl}
                                onChangeText={setLogoUrl}
                            />

                            <Text style={styles.label}>Agency Bio & Overview</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                multiline
                                numberOfLines={3}
                                placeholder="Brief overview, branch locations, specialized categories..."
                                placeholderTextColor="#94A3B8"
                                value={bio}
                                onChangeText={setBio}
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
                                style={[styles.saveModalBtn, saving && { opacity: 0.6 }]}
                                onPress={handleSaveProfile}
                                disabled={saving}
                                activeOpacity={0.8}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                                        <Text style={styles.saveModalBtnText}>Save Profile Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
    subTitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
    editHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#10B981', // Brand Emerald Green
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editHeaderBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 18, gap: 14, paddingBottom: 40 },

    // Hero Card
    heroCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    heroLogo: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#CBD5E1' },
    heroLogoPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    heroAgencyName: { fontSize: 18, fontWeight: '900', color: '#0F172A', flexShrink: 1 },
    heroLicenseText: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 2 },
    heroBadgesRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
    heroBadgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    heroBadgePillText: { fontSize: 11, fontWeight: '800', color: '#065F46' },
    heroQuickActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    heroActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#F8FAFC',
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    heroActionText: { fontSize: 12, fontWeight: '700', color: '#0F172A' },

    // General Card
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
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    cardHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    cardSub: { fontSize: 12, color: '#64748B', marginBottom: 12 },
    bioText: { fontSize: 13, color: '#475569', lineHeight: 20 },
    infoGrid: { flexDirection: 'row', gap: 12, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    infoItem: { flex: 1 },
    infoLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
    infoValue: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 2 },

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

    // Channel Rows
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
    openBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    openBtnText: { fontSize: 11, fontWeight: '800', color: '#2563EB' },
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

    // Switches
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    switchTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
    switchSub: { fontSize: 11, color: '#64748B', marginTop: 2 },

    // Account User
    accountUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        marginVertical: 10,
    },
    accountAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountAvatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
    accountName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
    accountEmail: { fontSize: 12, color: '#64748B' },
    roleTag: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    roleTagText: { fontSize: 10, fontWeight: '900', color: '#1E40AF' },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 6,
    },
    logoutBtnText: { color: '#DC2626', fontWeight: '800', fontSize: 13 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
    logoPreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F1F5F9',
        padding: 10,
        borderRadius: 10,
        marginBottom: 4,
    },
    logoPreview: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#CBD5E1' },
    logoUriText: { fontSize: 12, color: '#475569', fontWeight: '500' },
    mediaPickerRow: { flexDirection: 'row', gap: 10 },
    mediaBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#F1F5F9',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    mediaBtnText: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
    saveModalBtn: {
        marginTop: 16,
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    saveModalBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
