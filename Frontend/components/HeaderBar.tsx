import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../constants';
import { useLanguageStore } from '../stores/languageStore';
import { LanguageModal } from './LanguageModal';
import { NotificationModal } from './NotificationModal';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

interface HeaderBarProps {
    title: string;
    subtitle?: string;
    showGreeting?: boolean;
    userName?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
    title,
    subtitle,
    showGreeting,
    userName,
}) => {
    const [langModalVisible, setLangModalVisible] = useState(false);
    const [notifModalVisible, setNotifModalVisible] = useState(false);

    const { getCurrentLanguageOption } = useLanguageStore();
    const currentLang = getCurrentLanguageOption();

    // Query unread notifications count
    const notificationsQuery = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(),
        refetchInterval: 15000, // Poll every 15s for new notifications
    });

    const notifications: any[] = notificationsQuery.data?.data || notificationsQuery.data || [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <>
            <View style={styles.headerContainer}>
                {/* Left side: Title or Greeting */}
                <View style={styles.titleWrapper}>
                    {showGreeting ? (
                        <>
                            <Text style={styles.greetingText}>
                                Welcome back, {userName || 'User'} 👋
                            </Text>
                            <Text style={styles.subtitleText}>{subtitle || 'Employer Dashboard'}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.titleText}>{title}</Text>
                            {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
                        </>
                    )}
                </View>

                {/* Right side: Action icons (Language + Notifications) */}
                <View style={styles.actionsRow}>
                    {/* Language Selector Button */}
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => setLangModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.flagIcon}>{currentLang.flag}</Text>
                        <Text style={styles.langCodeText}>{currentLang.code.toUpperCase()}</Text>
                    </TouchableOpacity>

                    {/* Notification Bell Button */}
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => setNotifModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="notifications-outline" size={22} color={Colors.gray800} />
                        {unreadCount > 0 && (
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modals */}
            <LanguageModal
                visible={langModalVisible}
                onClose={() => setLangModalVisible(false)}
            />
            <NotificationModal
                visible={notifModalVisible}
                onClose={() => setNotifModalVisible(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 56,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray100,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    titleWrapper: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    greetingText: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.gray900,
        letterSpacing: -0.3,
    },
    titleText: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.gray900,
        letterSpacing: -0.3,
    },
    subtitleText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.accent,
        marginTop: 2,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    actionIconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        height: 42,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray50,
        borderWidth: 1,
        borderColor: Colors.gray200,
        position: 'relative',
        gap: 4,
    },
    flagIcon: {
        fontSize: 16,
    },
    langCodeText: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.gray700,
    },
    badgeContainer: {
        position: 'absolute',
        top: -3,
        right: -3,
        backgroundColor: Colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '900',
    },
});
