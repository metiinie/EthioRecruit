import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Linking,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants';

interface ContactAgencyModalProps {
    visible: boolean;
    onClose: () => void;
    agency: any;
    title?: string;
    topicName?: string;
}

export function ContactAgencyModal({
    visible,
    onClose,
    agency,
    title = 'Contact Agency',
    topicName,
}: ContactAgencyModalProps) {
    if (!agency && !visible) return null;

    const agencyName = agency?.name || 'Recruitment Agency';
    const rawPhone = agency?.whatsappNumber || agency?.phone || agency?.contactPhone || '+251911000000';
    const cleanPhone = rawPhone.replace(/[^\d]/g, '') || '251911000000';
    const tgUsername = (agency?.telegramUsername || agency?.telegram || 'metinie').replace('@', '').trim() || 'metinie';
    const imoPhone = agency?.imoNumber || agency?.imo || rawPhone;

    const topicContext = topicName ? ` regarding "${topicName}"` : '';
    const prefilledText = encodeURIComponent(`Hello ${agencyName}, I am contacting you via EthioRecruit${topicContext}.`);

    const handleWhatsApp = async () => {
        const waAppUrl = `whatsapp://send?phone=${cleanPhone}&text=${prefilledText}`;
        const waWebUrl = `https://wa.me/${cleanPhone}?text=${prefilledText}`;

        try {
            const canOpen = await Linking.canOpenURL(waAppUrl);
            if (canOpen) {
                await Linking.openURL(waAppUrl);
            } else {
                await Linking.openURL(waWebUrl);
            }
        } catch {
            await Linking.openURL(waWebUrl);
        }
    };

    const handleTelegram = async () => {
        const tgUrl = `https://t.me/${tgUsername}`;
        try {
            await Linking.openURL(tgUrl);
        } catch {
            if (Platform.OS === 'web') {
                window.open(tgUrl, '_blank');
            } else {
                Alert.alert('Telegram Contact', `Agency Telegram: @${tgUsername}`);
            }
        }
    };

    const handleIMO = async () => {
        const cleanImo = imoPhone.replace(/[^\d]/g, '');
        const imoAppUrl = `imo://user?phone=${cleanImo}`;

        try {
            const canOpen = await Linking.canOpenURL(imoAppUrl);
            if (canOpen) {
                await Linking.openURL(imoAppUrl);
            } else {
                if (Platform.OS === 'web') {
                    window.open(`tel:${rawPhone}`, '_self');
                } else {
                    Alert.alert('IMO Contact Number', `Agency IMO / Phone: ${imoPhone}`);
                }
            }
        } catch {
            if (Platform.OS === 'web') {
                window.open(`tel:${rawPhone}`, '_self');
            } else {
                Alert.alert('IMO Contact Number', `Agency IMO / Phone: ${imoPhone}`);
            }
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    {/* Modal Header */}
                    <View style={styles.headerRow}>
                        <View style={styles.headerTitleCol}>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <Text style={styles.agencySubtitle} numberOfLines={1}>
                                {agencyName} {agency?.isVerified ? '• Verified Agency' : ''}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                            <Ionicons name="close" size={22} color={Colors.gray500} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.promptText}>
                        Select your preferred messaging channel to contact {agencyName} directly:
                    </Text>

                    {/* Channel Action Buttons */}
                    <View style={styles.buttonsContainer}>
                        {/* WhatsApp Button */}
                        <TouchableOpacity
                            style={[styles.channelBtn, styles.waBtn]}
                            onPress={handleWhatsApp}
                            activeOpacity={0.85}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.btnTextCol}>
                                <Text style={styles.btnTitle}>WhatsApp</Text>
                                <Text style={styles.btnHandleText}>{rawPhone}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Telegram Button */}
                        <TouchableOpacity
                            style={[styles.channelBtn, styles.tgBtn]}
                            onPress={handleTelegram}
                            activeOpacity={0.85}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                            </View>
                            <View style={styles.btnTextCol}>
                                <Text style={styles.btnTitle}>Telegram</Text>
                                <Text style={styles.btnHandleText}>@{tgUsername}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* IMO Button */}
                        <TouchableOpacity
                            style={[styles.channelBtn, styles.imoBtn]}
                            onPress={handleIMO}
                            activeOpacity={0.85}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="call" size={18} color="#FFFFFF" />
                            </View>
                            <View style={styles.btnTextCol}>
                                <Text style={styles.btnTitle}>IMO Contact</Text>
                                <Text style={styles.btnHandleText}>{imoPhone}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Footer Close Action */}
                    <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.8}>
                        <Text style={styles.dismissText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

interface ContactUsButtonProps {
    agency: any;
    topicName?: string;
    label?: string;
    style?: any;
    compact?: boolean;
}

export function ContactUsButton({
    agency,
    topicName,
    label = 'Contact Us',
    style,
    compact = false,
}: ContactUsButtonProps) {
    const [modalVisible, setModalVisible] = React.useState(false);

    return (
        <>
            <TouchableOpacity
                style={[compact ? styles.compactBtn : styles.standardBtn, style]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="chatbubbles" size={compact ? 13 : 15} color="#FFFFFF" />
                <Text style={compact ? styles.compactBtnText : styles.standardBtnText}>{label}</Text>
            </TouchableOpacity>

            <ContactAgencyModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                agency={agency}
                topicName={topicName}
            />
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modalCard: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
        elevation: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTitleCol: { flex: 1 },
    modalTitle: { fontSize: 18, fontWeight: '900', color: Colors.gray900 },
    agencySubtitle: { fontSize: 12, color: Colors.primary, fontWeight: '700', marginTop: 2 },
    closeBtn: { padding: 4 },
    promptText: { fontSize: 13, color: Colors.gray600, marginBottom: Spacing.md, lineHeight: 18 },
    buttonsContainer: { gap: 10, marginBottom: Spacing.md },
    channelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: BorderRadius.lg,
        gap: 12,
        elevation: 2,
    },
    waBtn: { backgroundColor: '#16A34A' },
    tgBtn: { backgroundColor: '#0284C7' },
    imoBtn: { backgroundColor: '#D97706' },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnTextCol: { flex: 1 },
    btnTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    btnHandleText: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 11, fontWeight: '600', marginTop: 1 },
    dismissBtn: {
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: Colors.gray100,
        borderRadius: BorderRadius.md,
    },
    dismissText: { fontSize: 13, fontWeight: '700', color: Colors.gray700 },

    /* Button variants */
    standardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.accent,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BorderRadius.md,
    },
    standardBtnText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
    compactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BorderRadius.sm,
    },
    compactBtnText: { color: Colors.white, fontSize: 11, fontWeight: '800' },
});
