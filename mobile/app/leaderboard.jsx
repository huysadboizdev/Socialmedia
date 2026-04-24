import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getLeaderboard } from '../service/userService';
import { AuthContext } from '../context/AuthContext';

// Helper removed: backend masks the data directly

export default function Leaderboard() {
    const router = useRouter();
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ monthly: [], quarterly: [] });
    const { user } = useContext(AuthContext);

    const localStyles = getStyles(colors);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userId = user?._id || user?.id || '';
            const res = await getLeaderboard(userId);
            if (res.success) {
                setData({
                    monthly: res.monthly || [],
                    quarterly: res.quarterly || []
                });
            }
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentBoard = activeTab === 'monthly' ? data.monthly : data.quarterly;

    return (
        <SafeAreaView style={localStyles.container}>
            {/* Header */}
            <View style={localStyles.header}>
                <TouchableOpacity onPress={() => router.back()} style={localStyles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={localStyles.title}>BẢNG ĐUA TOP</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={localStyles.tabContainer}>
                <TouchableOpacity 
                    style={[localStyles.tab, activeTab === 'monthly' && localStyles.activeTab]}
                    onPress={() => setActiveTab('monthly')}
                >
                    <Text style={[localStyles.tabText, activeTab === 'monthly' && localStyles.activeTabText]}>Vinh Danh Tháng</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[localStyles.tab, activeTab === 'quarterly' && localStyles.activeTab]}
                    onPress={() => setActiveTab('quarterly')}
                >
                    <Text style={[localStyles.tabText, activeTab === 'quarterly' && localStyles.activeTabText]}>Vinh Danh Quý</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={localStyles.loader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={localStyles.listContent}>
                    {currentBoard.length === 0 ? (
                        <View style={localStyles.emptyContainer}>
                            <Ionicons name="stats-chart-outline" size={64} color={colors.secondary} />
                            <Text style={localStyles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
                        </View>
                    ) : (
                        currentBoard.map((item, index) => (
                            <View key={index} style={[localStyles.rankItem, index === 0 && localStyles.topRank]}>
                                <View style={localStyles.rankNumberContainer}>
                                    {index < 3 ? (
                                        <Ionicons 
                                            name="trophy" 
                                            size={24} 
                                            color={index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309'} 
                                        />
                                    ) : (
                                        <Text style={localStyles.rankNumber}>{index + 1}</Text>
                                    )}
                                </View>
                                
                                <View style={localStyles.userInfo}>
                                    <Text style={localStyles.username}>{item.name}</Text>
                                    <Text style={localStyles.amount}>{item.amount} đ</Text>
                                </View>

                                {index === 0 && (
                                    <View style={localStyles.topBadge}>
                                        <Text style={localStyles.topBadgeText}>TOP 1</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
    },
    title: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeTab: {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
    },
    tabText: {
        color: colors.subtext,
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeTabText: {
        color: colors.primary,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    rankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    topRank: {
        borderColor: '#fbbf24',
        backgroundColor: '#fbbf2410',
    },
    rankNumberContainer: {
        width: 40,
        alignItems: 'center',
    },
    rankNumber: {
        color: colors.subtext,
        fontSize: 16,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    username: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    amount: {
        color: colors.primary,
        fontSize: 14,
        marginTop: 2,
    },
    topBadge: {
        backgroundColor: '#fbbf24',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    topBadgeText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        color: colors.subtext,
        fontSize: 16,
    }
});
