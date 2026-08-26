import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
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
        Alert.alert('Sign Out', 'Are you sure you want to log out of EthioRecruit?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/(auth)/welcome' as any);
                },
            },
        ]);
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
                    <Text style={styles.phone}>{user?.phone}</Text>

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
                                <Text style={styles.menuSubLabel}>View messages & updates</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
                    </TouchableOpacity>

                    {/* Saved Candidates / Vacancies */}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuBorder]}
                        onPress={() =>
                            router.push((isJobSeeker ? '/saved/vacancies' : '/saved/candidates') as any)
                        }
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
                                <Text style={styles.menuSubLabel}>Bookmarked profiles</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.lg, paddingBottom: 40 },
    profileCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
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
    sectionHeader: { marginBottom: Spacing.xs },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
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
});
