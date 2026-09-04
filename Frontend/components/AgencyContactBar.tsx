import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgencyContactBarProps {
    agency?: any;
    candidateName?: string;
    vacancyTitle?: string;
    customMessage?: string;
    compact?: boolean;
}

export function AgencyContactBar({ agency, candidateName, vacancyTitle, customMessage, compact = false }: AgencyContactBarProps) {
    const agencyName = agency?.name || 'Recruitment Agency';

    // Resolve channels from agency model or fallback phone
    const channels = agency?.contactChannels || [];
    const waChannel = channels.find((c: any) => c.channelType?.toLowerCase() === 'whatsapp')?.channelValue;
    const tgChannel = channels.find((c: any) => c.channelType?.toLowerCase() === 'telegram')?.channelValue;
    const imoChannel = channels.find((c: any) => c.channelType?.toLowerCase() === 'imo')?.channelValue;

    const rawPhone = waChannel || agency?.phone || '+251911000000';
    const cleanPhone = rawPhone.replace(/[^\d+]/g, '').replace('+', '');

    const defaultMsg = candidateName
        ? `Hello ${agencyName}, I am inquiring about Candidate ${candidateName} via EthioRecruit.`
        : vacancyTitle
            ? `Hello ${agencyName}, I am applying for position ${vacancyTitle} via EthioRecruit.`
            : `Hello ${agencyName}, I am contacting you via EthioRecruit.`;

    const messageText = encodeURIComponent(customMessage || defaultMsg);

    const openWhatsApp = () => {
        const waApp = `whatsapp://send?phone=${cleanPhone}&text=${messageText}`;
        const waWeb = `https://wa.me/${cleanPhone}?text=${messageText}`;
        Linking.canOpenURL(waApp).then((supported) => {
            if (supported) Linking.openURL(waApp);
            else Linking.openURL(waWeb);
        }).catch(() => Linking.openURL(waWeb));
    };

    const openTelegram = () => {
        let tgHandle = (tgChannel || '').replace('@', '');
        let tgUrl = tgHandle ? `https://t.me/${tgHandle}` : `https://t.me/${cleanPhone}`;
        Linking.openURL(tgUrl).catch(() => Alert.alert('Telegram Link', `Agency Telegram: ${tgHandle || cleanPhone}`));
    };

    const openIMO = () => {
        const imoNum = (imoChannel || rawPhone).replace('+', '');
        const imoUrl = `imo://user?phone=${imoNum}`;
        Linking.canOpenURL(imoUrl).then((supported) => {
            if (supported) Linking.openURL(imoUrl);
            else {
                Alert.alert('IMO Contact', `Agency IMO Contact: ${imoNum}`);
                Linking.openURL(`tel:${imoNum}`).catch(() => { });
            }
        }).catch(() => {
            Alert.alert('IMO Contact', `Agency IMO Contact: ${imoNum}`);
        });
    };

    return (
        <View style={[styles.container, compact && styles.compactContainer]}>
            <View style={styles.headerRow}>
                <Ionicons name="chatbubbles" size={16} color="#059669" />
                <Text style={styles.barTitle}>Direct Agency Contact Shortcuts</Text>
            </View>
            <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.btn, styles.waBtn]} onPress={openWhatsApp} activeOpacity={0.85}>
                    <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                    <Text style={styles.btnText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.tgBtn]} onPress={openTelegram} activeOpacity={0.85}>
                    <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                    <Text style={styles.btnText}>Telegram</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.imoBtn]} onPress={openIMO} activeOpacity={0.85}>
                    <Ionicons name="call" size={16} color="#FFFFFF" />
                    <Text style={styles.btnText}>IMO</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 12,
        padding: 12,
        marginVertical: 8,
    },
    compactContainer: {
        padding: 8,
        marginVertical: 4,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    barTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#065F46',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 8,
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
        elevation: 1,
    },
    waBtn: {
        backgroundColor: '#25D366',
    },
    tgBtn: {
        backgroundColor: '#0088CC',
    },
    imoBtn: {
        backgroundColor: '#00A3E0',
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 12,
    },
});
