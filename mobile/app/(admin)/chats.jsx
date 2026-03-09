import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    ActivityIndicator, TextInput, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { getConversations } from '../../service/userService';

export default function AdminChats() {
    const router = useRouter();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread'
    const intervalRef = useRef(null);

    const fetchConversationsList = async () => {
        try {
            const res = await getConversations();
            if (res.success) {
                setConversations(res.data);
            }
        } catch (error) {
            console.error("Fetch convs error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversationsList();
        intervalRef.current = setInterval(fetchConversationsList, 2000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = c.username?.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeFilter === 'unread') return matchesSearch && c.unreadCount > 0;
        return matchesSearch;
    });

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const renderItem = ({ item }) => {
        const isUnread = item.unreadCount > 0;

        return (
            <TouchableOpacity 
                style={[styles.convItem, isUnread && styles.convItemUnread]}
                onPress={() => router.push(`/(admin)/chat/${item._id}?username=${item.username}`)}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={24} color={colors.subtext} />
                    </View>
                    {isUnread && <View style={styles.onlineBadge} />}
                </View>
                
                <View style={styles.convInfo}>
                    <View style={styles.convHeaderRow}>
                        <Text style={[styles.usernameText, isUnread && styles.boldText]} numberOfLines={1}>
                            {item.username || 'User'}
                        </Text>
                        <Text style={styles.timeText}>
                            {formatTime(item.lastMessage?.createdAt)}
                        </Text>
                    </View>
                    
                    <View style={styles.convMessageRow}>
                        <Text 
                            style={[styles.lastMessageText, isUnread ? styles.boldText : { color: colors.subtext }]} 
                            numberOfLines={1}
                        >
                            {item.lastMessage?.sender === 'admin' ? 'Bạn: ' : ''}
                            {item.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
                        </Text>
                        {isUnread && (
                            <View style={styles.unreadDotContainer}>
                                <View style={styles.unreadDot} />
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đoạn chat</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.subtext} style={styles.searchIcon} />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Tìm kiếm..."
                    placeholderTextColor={colors.subtext}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={[styles.filterBtn, activeFilter === 'all' && styles.filterBtnActive]}
                    onPress={() => setActiveFilter('all')}
                >
                    <Text style={[styles.filterBtnText, activeFilter === 'all' && styles.filterBtnTextActive]}>Tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterBtn, activeFilter === 'unread' && styles.filterBtnActive]}
                    onPress={() => setActiveFilter('unread')}
                >
                    <Text style={[styles.filterBtnText, activeFilter === 'unread' && styles.filterBtnTextActive]}>Chưa đọc</Text>
                </TouchableOpacity>
            </View>

            {loading && conversations.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={64} color={colors.border} />
                            <Text style={styles.emptyText}>Không có tin nhắn nào</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'ios' ? 0 : 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        marginHorizontal: 16,
        marginTop: 16,
        paddingHorizontal: 12,
        borderRadius: 20,
        height: 40,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontSize: 15,
        height: '100%',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterBtnActive: {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary + '30',
    },
    filterBtnText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    filterBtnTextActive: {
        color: colors.primary,
    },
    listContent: {
        paddingBottom: 20,
    },
    convItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
    },
    convItemUnread: {
        backgroundColor: colors.primary + '05', // very light tint
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: colors.background,
    },
    convInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    convHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    usernameText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
    },
    timeText: {
        fontSize: 12,
        color: colors.subtext,
    },
    convMessageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessageText: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    boldText: {
        fontWeight: 'bold',
        color: colors.text,
    },
    unreadDotContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.subtext,
    },
});
