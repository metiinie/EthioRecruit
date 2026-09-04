import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { HeaderBar } from '../../components/HeaderBar';
import { LanguageModal } from '../../components/LanguageModal';
import { NotificationModal } from '../../components/NotificationModal';
import { useLanguageStore } from '../../stores/languageStore';

export default function ProfileScreen() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const mode = useAuthStore((s) => s.mode);
    const setAuth = useAuthStore((s) => s.setAuth);
    const logout = useAuthStore((s) => s.logout);

    const isJobSeeker = mode === 'JOB_SEEKER';

    const [langModalVisible, setLangModalVisible] = useState(false);
    const [notifModalVisible, setNotifModalVisible] = useState(false);
    const [messagingModalVisible, setMessagingModalVisible] = useState(false);

    // Messaging Handles State
    const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || user?.phone || '');
    const [telegramUsername, setTelegramUsername] = useState(user?.telegramUsername || '');
    const [imoNumber, setImoNumber] = useState(user?.imoNumber || user?.phone || '');
    const [preferredChannel, setPreferredChannel] = useState(user?.preferredChannel || 'WHATSAPP');
    const [savingHandles, setSavingHandles] = useState(false);

    React.useEffect(() => {
        if (user) {
            setWhatsappNumber(user.whatsappNumber || user.phone || '');
            setTelegramUsername(user.telegramUsername || '');
            setImoNumber(user.imoNumber || user.phone || '');
            setPreferredChannel(user.preferredChannel || 'WHATSAPP');
        }
    }, [user, messagingModalVisible]);

    const handleSaveMessagingHandles = async () => {
        setSavingHandles(true);
        try {
            const cleanWa = whatsappNumber.trim();
            const cleanTg = telegramUsername.trim().replace('@', '');
            const cleanImo = imoNumber.trim();

            const res = await authService.updateMe({
                whatsappNumber: cleanWa,
                telegramUsername: cleanTg,
                imoNumber: cleanImo,
                preferredChannel,
            });
            const updatedUser = res?.data || res;
            if (updatedUser && updatedUser.id) {
                const currentUser = useAuthStore.getState().user || {};
                const mergedUser = {
                    ...currentUser,
                    ...updatedUser,
                    whatsappNumber: cleanWa,
                    telegramUsername: cleanTg,
                    imoNumber: cleanImo,
                    preferredChannel,
                };
                setAuth(mergedUser, useAuthStore.getState().token || '');
            }
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.alert('Success: Your messaging handles (WhatsApp, Telegram, IMO) updated successfully!');
            } else {
                Alert.alert('Success', 'Your messaging handles (WhatsApp, Telegram, IMO) updated successfully!');
            }
            setMessagingModalVisible(false);
        } catch (err: any) {
            const errorMsg = getErrorMessage(err);
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.alert(`Save Error: ${errorMsg}`);
            } else {
                Alert.alert('Error', errorMsg);
            }
        } finally {
            setSavingHandles(false);
        }
    };

    const { getCurrentLanguageOption } = useLanguageStore();
    const currentLang = getCurrentLanguageOption();

    const handleModeSwitch = async () => {
        const newMode = isJobSeeker ? 'EMPLOYER' : 'JOB_SEEKER';
        try {
            const response = await authService.switchMode(newMode as any);
            setAuth(response.data.user, response.data.token);
        } catch {
            // Fallback: switch locally
            useAuthStore.getState().setMode(newMode as any);
        }
    };

    const handleLogout = () => {
        const performLogout = () => {
            logout();
            router.replace('/(auth)/welcome' as any);
        };

        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out of EthioRecruit?')) {
                performLogout();
            } else if (typeof window === 'undefined') {
                performLogout();
            }
        } else {
            Alert.alert('Sign Out', 'Are you sure you want to log out of EthioRecruit?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: performLogout,
                },
            ]);
        }
    };

    return (
        <View style={styles.container}>
            {/* Top Header */}
            <HeaderBar
                title="Account Settings"
                subtitle={isJobSeeker ? 'Job Seeker Profile' : 'Employer Profile'}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                        </Text>
                    </View>

                    <Text style={styles.name}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={styles.phone}>{user?.phone || '+251 900 000 000'}</Text>

                    <View style={styles.roleBadge}>
                        <Ionicons
                            name={isJobSeeker ? 'briefcase' : 'business'}
                            size={12}
                            color={Colors.accentDark}
                        />
                        <Text style={styles.roleBadgeText}>
                            {isJobSeeker ? 'JOB SEEKER MODE' : 'EMPLOYER MODE'}
                        </Text>
                    </View>

                    {/* Mode Toggle Button */}
                    <TouchableOpacity
                        style={styles.modeToggleBtn}
                        onPress={handleModeSwitch}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="swap-horizontal" size={16} color={Colors.white} />
                        <Text style={styles.modeToggleText}>
                            Switch to {isJobSeeker ? 'Employer' : 'Job Seeker'} Mode
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Account Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusIconCircle}>
                        <Ionicons name="shield-checkmark" size={20} color={Colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.statusTitle}>Verified Account</Text>
                        <Text style={styles.statusSub}>Licensed & Compliant Overseas Hiring Platform</Text>
                    </View>
                </View>

                {/* Account Actions Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Preferences & Features</Text>
                </View>

                <View style={styles.menuCard}>
                    {/* Language Switcher Action */}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuBorder]}
                        onPress={() => setLangModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIconCircle, { backgroundColor: Colors.accent + '15' }]}>
                                <Ionicons name="globe-outline" size={18} color={Colors.accent} />
                            </View>
                            <View>
                                <Text style={styles.menuLabel}>Interface Language</Text>
                                <Text style={styles.menuSubLabel}>
                                    {currentLang.flag} {currentLang.name} ({currentLang.nativeName})
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
                    </TouchableOpacity>

                    {/* Notifications Center Action */}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuBorder]}
                        onPress={() => setNotifModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIconCircle, { backgroundColor: Colors.info + '15' }]}>
                                <Ionicons name="notifications-outline" size={18} color={Colors.info} />
                            </View>
                            <View>
                                <Text style={styles.menuLabel}>Notifications Center</Text>
                                <Text style={styles.menuSubLabel}>View messages & system alerts</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
                    </TouchableOpacity>

                    {/* Direct Messaging Handles (WhatsApp, Telegram, IMO) */}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuBorder]}
                        onPress={() => setMessagingModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIconCircle, { backgroundColor: '#10B98115' }]}>
                                <Ionicons name="chatbubbles-outline" size={18} color="#10B981" />
                            </View>
                            <View>
                                <Text style={styles.menuLabel}>Messaging Handles</Text>
                                <Text style={styles.menuSubLabel}>WhatsApp, Telegram & IMO contact channels</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
                    </TouchableOpacity>

                    {/* Saved Candidates / Vacancies */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(tabs)/saved' as any)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIconCircle, { backgroundColor: Colors.warning + '15' }]}>
                                <Ionicons name="bookmark-outline" size={18} color={Colors.warning} />
                            </View>
                            <View>
                                <Text style={styles.menuLabel}>
                                    {isJobSeeker ? 'Saved Vacancies' : 'Saved Candidates'}
                                </Text>
                                <Text style={styles.menuSubLabel}>Manage your bookmarked roster</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
                    </TouchableOpacity>
                </View>

                {/* Support & Legal Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Support & Assistance</Text>
                </View>

                <View style={styles.menuCard}>
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuBorder]}
                        onPress={() => Alert.alert('Support', 'Contact EthioRecruit Support via support@ethiorecruit.com')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIconCircle, { backgroundColor: Colors.primary + '15' }]}>
                                <Ionicons name="help-buoy-outline" size={18} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.menuLabel}>Help & Support</Text>
                                <Text style={styles.menuSubLabel}>FAQs & Customer Care</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Alert.alert('EthioRecruit v2.0', 'Licensed Foreign Employment Agency Platform')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIconCircle, { backgroundColor: Colors.gray200 }]}>
                                <Ionicons name="information-circle-outline" size={18} color={Colors.gray700} />
                            </View>
                            <View>
                                <Text style={styles.menuLabel}>About EthioRecruit</Text>
                                <Text style={styles.menuSubLabel}>Version 2.0.0 • Overseas Hiring</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
                    </TouchableOpacity>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Sign Out Account</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modals */}
            <LanguageModal
                visible={langModalVisible}
                onClose={() => setLangModalVisible(false)}
            />
            <NotificationModal
                visible={notifModalVisible}
                onClose={() => setNotifModalVisible(false)}
            />

            {/* Direct Messaging Handles Modal */}
            <Modal visible={messagingModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="chatbubbles-outline" size={20} color="#10B981" />
                                <Text style={styles.modalTitle}>Messaging Handles</Text>
                            </View>
                            <TouchableOpacity onPress={() => setMessagingModalVisible(false)}>
                                <Ionicons name="close-circle" size={24} color={Colors.gray500} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 18, gap: 14 }}>
                            <Text style={styles.modalSub}>
                                Add your WhatsApp, Telegram, and IMO contact handles so agency admins can easily reach you with job opportunities.
                            </Text>

                            {/* WhatsApp Number Input */}
                            <Text style={styles.inputLabel}>WhatsApp Number</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="logo-whatsapp" size={18} color="#25D366" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="+251 911 000 000"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                    value={whatsappNumber}
                                    onChangeText={setWhatsappNumber}
                                />
                            </View>

                            {/* Telegram Username Input */}
                            <Text style={styles.inputLabel}>Telegram Username</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="paper-plane-outline" size={18} color="#0284C7" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="e.g. @username or abebe_k"
                                    placeholderTextColor="#94A3B8"
                                    autoCapitalize="none"
                                    value={telegramUsername}
                                    onChangeText={setTelegramUsername}
                                />
                            </View>

                            {/* IMO Number Input */}
                            <Text style={styles.inputLabel}>IMO Contact Number</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="call-outline" size={18} color="#D97706" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="+251 911 000 000"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                    value={imoNumber}
                                    onChangeText={setImoNumber}
                                />
                            </View>

                            {/* Preferred Contact Channel Selector */}
                            <Text style={styles.inputLabel}>Preferred Outreach Channel</Text>
                            <View style={styles.channelRow}>
                                {[
                                    { key: 'WHATSAPP', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
                                    { key: 'TELEGRAM', label: 'Telegram', icon: 'paper-plane-outline', color: '#0284C7' },
                                    { key: 'IMO', label: 'IMO', icon: 'call-outline', color: '#D97706' },
                                ].map((ch) => (
                                    <TouchableOpacity
                                        key={ch.key}
                                        style={[
                                            styles.channelPill,
                                            preferredChannel === ch.key && { backgroundColor: ch.color + '20', borderColor: ch.color },
                                        ]}
                                        onPress={() => setPreferredChannel(ch.key)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name={ch.icon as any} size={14} color={preferredChannel === ch.key ? ch.color : Colors.gray500} />
                                        <Text style={[
                                            styles.channelPillText,
                                            preferredChannel === ch.key && { color: ch.color, fontWeight: '800' },
                                        ]}>{ch.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, savingHandles && { opacity: 0.6 }]}
                                onPress={handleSaveMessagingHandles}
                                disabled={savingHandles}
                                activeOpacity={0.8}
                            >
                                {savingHandles ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                                        <Text style={styles.saveBtnText}>Save Messaging Handles</Text>
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
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.lg, paddingBottom: 120 },
    profileCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 1,
    },
    avatarCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    avatarText: { fontSize: 26, fontWeight: '900', color: Colors.white },
    name: { fontSize: 20, fontWeight: '800', color: Colors.gray900 },
    phone: { fontSize: 13, color: Colors.gray500, marginTop: 2 },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.accent + '15',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
        marginTop: 10,
    },
    roleBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.accentDark,
    },
    modeToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: BorderRadius.xl,
        marginTop: Spacing.md,
        width: '100%',
    },
    modeToggleText: { fontSize: 13, fontWeight: '700', color: Colors.white },

    /* Status Card */
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        gap: 12,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.accent + '30',
    },
    statusIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusTitle: { fontSize: 14, fontWeight: '800', color: Colors.gray900 },
    statusSub: { fontSize: 12, color: Colors.gray500, marginTop: 1 },

    sectionHeader: { marginBottom: Spacing.xs },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.gray200,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
    },
    menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: { fontSize: 15, color: Colors.gray900, fontWeight: '700' },
    menuSubLabel: { fontSize: 12, color: Colors.gray500, marginTop: 1 },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.error + '40',
    },
    logoutText: { fontSize: 15, fontWeight: '800', color: Colors.error },

    // Messaging Handles Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray200,
    },
    modalTitle: { fontSize: 18, fontWeight: '900', color: Colors.gray900 },
    modalSub: { fontSize: 13, color: Colors.gray600, lineHeight: 18 },
    inputLabel: { fontSize: 12, fontWeight: '800', color: Colors.gray700, marginTop: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.gray300,
        paddingHorizontal: 12,
        height: 46,
    },
    modalInput: { flex: 1, color: Colors.gray900, fontSize: 14, fontWeight: '600' },
    channelRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    channelPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.gray200,
        backgroundColor: Colors.gray100,
    },
    channelPillText: { fontSize: 12, fontWeight: '700', color: Colors.gray600 },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 10,
    },
    saveBtnText: { color: Colors.white, fontSize: 14, fontWeight: '900' },
});
