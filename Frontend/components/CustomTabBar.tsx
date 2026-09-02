import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions,
    Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useAuthStore } from '../stores/authStore';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
    name: string;
    label: string;
    activeIcon: IconName;
    inactiveIcon: IconName;
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';

    const getTabConfig = (routeName: string): TabConfig => {
        switch (routeName) {
            case 'index':
                return {
                    name: 'index',
                    label: 'Home',
                    activeIcon: 'home',
                    inactiveIcon: 'home-outline',
                };
            case 'browse':
                return {
                    name: 'browse',
                    label: isJobSeeker ? 'Jobs' : 'Candidates',
                    activeIcon: isJobSeeker ? 'briefcase' : 'people',
                    inactiveIcon: isJobSeeker ? 'briefcase-outline' : 'people-outline',
                };
            case 'saved':
                return {
                    name: 'saved',
                    label: 'Saved',
                    activeIcon: 'bookmark',
                    inactiveIcon: 'bookmark-outline',
                };
            case 'activity':
                return {
                    name: 'activity',
                    label: isJobSeeker ? 'Applications' : 'Inquiries',
                    activeIcon: 'chatbubbles',
                    inactiveIcon: 'chatbubbles-outline',
                };
            case 'profile':
                return {
                    name: 'profile',
                    label: 'Profile',
                    activeIcon: 'person-circle',
                    inactiveIcon: 'person-circle-outline',
                };
            default:
                return {
                    name: routeName,
                    label: routeName,
                    activeIcon: 'grid',
                    inactiveIcon: 'grid-outline',
                };
        }
    };

    const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 16;

    return (
        <View style={[styles.containerWrapper, { paddingBottom: bottomPadding }]}>
            <View style={styles.tabBarContainer}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const config = getTabConfig(route.name);

                    const label =
                        options.tabBarLabel !== undefined
                            ? (options.tabBarLabel as string)
                            : options.title !== undefined
                                ? options.title
                                : config.label;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TabBarItem
                            key={route.key}
                            isFocused={isFocused}
                            label={label}
                            activeIcon={config.activeIcon}
                            inactiveIcon={config.inactiveIcon}
                            onPress={onPress}
                            onLongPress={onLongPress}
                        />
                    );
                })}
            </View>
        </View>
    );
}

interface TabBarItemProps {
    isFocused: boolean;
    label: string;
    activeIcon: IconName;
    inactiveIcon: IconName;
    onPress: () => void;
    onLongPress: () => void;
}

function TabBarItem({
    isFocused,
    label,
    activeIcon,
    inactiveIcon,
    onPress,
    onLongPress,
}: TabBarItemProps) {
    const scaleAnim = useRef(new Animated.Value(isFocused ? 1.05 : 0.9)).current;
    const translateYAnim = useRef(new Animated.Value(isFocused ? -8 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isFocused ? 1.05 : 0.9,
                friction: 6,
                tension: 100,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnim, {
                toValue: isFocused ? -8 : 0,
                friction: 6,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isFocused]);

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                {isFocused ? (
                    <Animated.View
                        style={[
                            styles.activeBubble,
                            {
                                transform: [
                                    { scale: scaleAnim },
                                    { translateY: translateYAnim },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.activeInnerGlow}>
                            <Ionicons name={activeIcon} size={20} color="#FFFFFF" />
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View
                        style={[
                            styles.inactiveIconWrapper,
                            {
                                transform: [
                                    { scale: scaleAnim },
                                    { translateY: translateYAnim },
                                ],
                            },
                        ]}
                    >
                        <Ionicons name={inactiveIcon} size={20} color={Colors.gray400} />
                    </Animated.View>
                )}
            </View>

            <Text
                style={[
                    styles.tabLabel,
                    isFocused ? styles.activeLabel : styles.inactiveLabel,
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'transparent',
        zIndex: 99,
        pointerEvents: 'box-none',
    },
    tabBarContainer: {
        flexDirection: 'row',
        width: Dimensions.get('window').width > 480 ? 440 : '92%',
        height: 60,
        backgroundColor: '#0F172A', // Deep Slate Navy floating dock surface
        borderRadius: 30,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'space-around',
        // Elevated floating box shadow
        borderWidth: 1.5,
        borderColor: '#1E293B',
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
        height: '100%',
    },
    iconContainer: {
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    activeBubble: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#14B8A6', // Vibrant Brand Teal
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2.5,
        borderColor: '#0F172A', // Contrast ring matching dock background
    },
    activeInnerGlow: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    inactiveIconWrapper: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 10.5,
        textAlign: 'center',
        marginTop: 1,
    },
    activeLabel: {
        color: '#14B8A6',
        fontWeight: '800',
    },
    inactiveLabel: {
        color: '#94A3B8',
        fontWeight: '600',
    },
});
