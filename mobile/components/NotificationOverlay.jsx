import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming, 
    runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function NotificationOverlay() {
    const { lastMessage, setLastMessage, user } = useContext(AuthContext);
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    // iOS Dynamic Island animations
    const islandWidth = useSharedValue(120);
    const islandHeight = useSharedValue(36);
    const islandOpacity = useSharedValue(0);
    const islandY = useSharedValue(-50);

    // Android Bubble animations
    const bubbleX = useSharedValue(SCREEN_WIDTH - 80);
    const bubbleY = useSharedValue(SCREEN_HEIGHT / 3);
    const bubbleScale = useSharedValue(0);

    useEffect(() => {
        if (lastMessage) {
            triggerNotification();
        }
    }, [lastMessage]);

    const triggerNotification = () => {
        try {
            setVisible(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        if (Platform.OS === 'ios') {
            // Dynamic Island Animation
            islandOpacity.value = withTiming(1, { duration: 150 });
            islandY.value = withSpring(11, { damping: 15 });
            
            // Expand instantly instead of delay
            islandWidth.value = withSpring(SCREEN_WIDTH - 40);
            islandHeight.value = withSpring(80);

            // Hide after 5 seconds
            setTimeout(() => {
                islandHeight.value = withSpring(36);
                islandWidth.value = withSpring(120);
                setTimeout(() => {
                    islandY.value = withSpring(-50);
                    islandOpacity.value = withTiming(0, { duration: 300 }, () => {
                        runOnJS(setLastMessage)(null);
                        runOnJS(setVisible)(false);
                    });
                }, 300);
            }, 5000);
        } else {
            // Android Bubble Animation
            bubbleScale.value = withSpring(1, { damping: 12 });
            
            // Auto hide bubble after 8 seconds if not interacted? 
            // Or just leave it? User asked for "bong bóng chat", usually they stay.
            // But for a simulation notification, maybe it should hide or shrink.
            // Let's make it shrink to a small dot or hide after some time.
            setTimeout(() => {
                bubbleScale.value = withSpring(0, {}, () => {
                    runOnJS(setLastMessage)(null);
                    runOnJS(setVisible)(false);
                });
            }, 8000);
        }
        } catch (error) {
            console.error('Notification error:', error);
            setVisible(false);
            setLastMessage(null);
        }
    };

    const islandStyle = useAnimatedStyle(() => ({
        width: islandWidth.value,
        height: islandHeight.value,
        opacity: islandOpacity.value,
        transform: [{ translateY: islandY.value }],
    }));

    const bubbleStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: bubbleX.value },
            { translateY: bubbleY.value },
            { scale: bubbleScale.value }
        ],
    }));

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            bubbleX.value = e.absoluteX - 30;
            bubbleY.value = e.absoluteY - 30;
        })
        .onEnd(() => {
            // Snap to sides
            const targetX = bubbleX.value > SCREEN_WIDTH / 2 ? SCREEN_WIDTH - 70 : 10;
            bubbleX.value = withSpring(targetX);
        });

    if (!visible || !lastMessage) return null;

    return (
        <View style={styleSheet.container} pointerEvents="box-none">
            {Platform.OS === 'ios' ? (
                <Animated.View style={[styleSheet.island, islandStyle]}>
                    <TouchableOpacity 
                        style={styleSheet.islandContent}
                        onPress={() => {
                            if (user && user.role === 'admin') {
                                router.push(`/(admin)/chat/${lastMessage?.userId}?username=${lastMessage?.username || 'User'}`);
                            } else {
                                router.push('/chat-admin');
                            }
                            setVisible(false);
                            setLastMessage(null);
                        }}
                    >
                        <View style={styleSheet.islandHeader}>
                            <View style={styleSheet.avatarSmall}>
                                <Ionicons name="person" size={14} color="white" />
                            </View>
                            <Text style={styleSheet.adminName}>{user?.role === 'admin' ? (lastMessage?.username || 'User') : 'Admin'}</Text>
                        </View>
                        <Text style={styleSheet.islandMsg} numberOfLines={2}>
                            {lastMessage?.content || ''}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styleSheet.bubble, bubbleStyle]}>
                        <TouchableOpacity 
                            style={styleSheet.bubbleContent}
                            onPress={() => {
                                if (user && user.role === 'admin') {
                                    router.push(`/(admin)/chat/${lastMessage?.userId}?username=${lastMessage?.username || 'User'}`);
                                } else {
                                    router.push('/chat-admin');
                                }
                                setVisible(false);
                                setLastMessage(null);
                            }}
                        >
                            <View style={styleSheet.bubbleInner}>
                                <Ionicons name="chatbubble-ellipses" size={24} color="white" />
                                <View style={styleSheet.bubbleDot} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </GestureDetector>
            )}
        </View>
    );
}

const styleSheet = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    island: {
        position: 'absolute',
        top: 40, // Safely below notch area usually
        alignSelf: 'center',
        backgroundColor: 'black',
        borderRadius: 25,
        padding: 10,
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    islandContent: {
        flex: 1,
        justifyContent: 'center',
    },
    islandHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    avatarSmall: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    adminName: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    islandMsg: {
        color: '#d1d5db',
        fontSize: 13,
    },
    bubble: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3b82f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    bubbleContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleDot: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ef4444',
        borderWidth: 1.5,
        borderColor: 'white',
    }
});
