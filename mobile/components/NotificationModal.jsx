import React, { useState, useEffect } from 'react';
import { 
    Modal, 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    ActivityIndicator,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Functional helper to parse text into styled components
const renderRichText = (text, colors) => {
    // We'll split the text into parts and style them
    // This is a simplified version of the web's regex logic
    const parts = text.split(/(Sub6Sao\.Com|HUYTICHXANH|Zalo|Tại Đây|\d{10,}|\d+:\d+\s*-\s*\d+:\d+|\d+\s*%)/g);
    
    return parts.map((part, index) => {
        if (/Sub6Sao\.Com|HUYTICHXANH|Zalo|Tại Đây|\d{10,}|\d+:\d+\s*-\s*\d+:\d+/.test(part)) {
            return <Text key={index} style={{ color: '#9333ea', fontWeight: 'bold' }}>{part}</Text>;
        }
        if (/(\d+)\s*%/.test(part)) {
            const match = part.match(/(\d+)/);
            const num = match ? match[1] : '';
            return (
                <View key={index} style={styles.percentBadge}>
                    <Text style={styles.percentText}>{num}</Text>
                </View>
            );
        }
        return <Text key={index}>{part}</Text>;
    });
};

export default function NotificationModal({ isOpen, onClose }) {
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [announcement, setAnnouncement] = useState({
        title: "THÔNG BÁO",
        items: [
            { icon: "🔔", text: "Chào Mừng Bạn Đến Với HUYTICHXANH Social Media 💖" },
            { icon: "👥", text: "Tham Gia Nhóm Zalo Nhận Thông Báo Mới Nhất" },
            { icon: "🔥", text: "Khuyến Mại Nạp 50 % (Đến hết 25/3/2026)" },
            { icon: "📲", text: "Zalo Hỗ Trợ : 0763076124" },
            { icon: "🕒", text: "Time Support : 6:00 - 23:00" },
        ],
    });

    const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/user/announcement`);
                if (res.data.success && res.data.announcement) {
                    setAnnouncement(res.data.announcement);
                }
            } catch (error) {
                console.log("Error fetching announcement:", error);
            } finally {
                setLoading(false);
            }
        };
        if (isOpen) {
            fetchAnnouncement();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Modal
            transparent
            visible={isOpen}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    {/* Close Button X in top right */}
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.subtext} />
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: colors.text }]}>
                        {announcement.title}
                    </Text>

                    <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#9333ea" style={{ marginTop: 20 }} />
                        ) : (
                            announcement.items.map((item, index) => (
                                <View key={index} style={styles.itemRow}>
                                    <Text style={styles.icon}>{item.icon}</Text>
                                    <View style={styles.textContainer}>
                                        <Text style={[styles.itemText, { color: colors.text }]}>
                                            {renderRichText(item.text, colors)}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity 
                            style={styles.doneButton} 
                            onPress={onClose}
                        >
                            <Text style={styles.doneButtonText}>Tôi đã đọc</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: SCREEN_WIDTH - 40,
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        paddingTop: 40,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    closeIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    scrollArea: {
        maxHeight: 400,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },
    icon: {
        fontSize: 22,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    percentBadge: {
        borderWidth: 1,
        borderColor: '#22d3ee',
        borderRadius: 12,
        paddingHorizontal: 6,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
    },
    percentText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0891b2',
    },
    footer: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    doneButton: {
        backgroundColor: '#9333ea',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 15,
        shadowColor: '#9333ea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    doneButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
