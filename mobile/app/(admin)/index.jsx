import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    totalUsers: 0,
    todayOrders: 0,
    systemBalance: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
            if (res.data.stats) {
                setStats({
                    monthlyRevenue: res.data.stats.monthlyRevenue || 0,
                    totalRevenue: res.data.stats.totalRevenue || 0,
                    totalUsers: res.data.stats.totalUsers || 0,
                    todayOrders: res.data.stats.todayOrders || 0,
                    totalOrders: res.data.stats.totalOrders || 0,
                    systemBalance: res.data.stats.systemBalance || 0
                });
            }

            // Process recent activity
            const orders = (res.data.recentOrders || []).map(o => ({
                type: 'order',
                id: o._id,
                date: new Date(o.orderDate),
                title: `Đơn hàng: ${o.service?.name || 'Unknown Service'}`,
                subtitle: `${o.userId?.username || 'Guest'} • ${o.quantity} items`,
                amount: o.totalPrice,
                status: o.status
            }));

            const deposits = (res.data.recentDeposits || []).map(d => ({
                type: 'deposit',
                id: d._id,
                date: new Date(d.createdAt),
                title: `Nạp tiền: ${d.amount.toLocaleString()}đ`,
                subtitle: `${d.userId?.username || 'User'} • ${d.description || 'Nạp tiền'}`,
                amount: d.amount,
                status: d.status
            }));

            const combined = [...orders, ...deposits].sort((a, b) => b.date - a.date).slice(0, 10);
            setRecentActivity(combined);
        }
    } catch (e) {
        console.error("Error fetching stats:", e);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ title, value, icon, color, subtext }) => (
    <View style={styles.statCard}>
        <View style={[styles.statHeader]}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{title}</Text>
        {subtext && <Text style={[styles.statSub, { color: color }]}>{subtext}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào, {user?.username || 'Admin'} 👋</Text>
            <Text style={styles.subGreeting}>Tổng quan hệ thống hôm nay</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.badge} />
          </View>
        </View>

        {/* Highlight Card (Balance) */}
        <View style={styles.highlightCard}>
            <View>
                <Text style={styles.highlightLabel}>Số dư hệ thống</Text>
                <Text style={styles.highlightValue}>{(stats.systemBalance).toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={styles.highlightIcon}>
                <Ionicons name="wallet" size={32} color="#fff" />
            </View>
            <View style={styles.highlightDecor} />
        </View>

        <Text style={styles.sectionTitle}>Thống kê nhanh</Text>
        <View style={styles.statsGrid}>
            <StatCard 
                title="Tổng doanh thu" 
                value={`${(stats.totalRevenue || 0).toLocaleString('vi-VN')} đ`}
                icon="bar-chart" 
                color="#8b5cf6" // Violet
                subtext={`+${(stats.monthlyRevenue || 0).toLocaleString('vi-VN')} đ tháng này`}
            />
             <StatCard 
                title="Tổng đơn hàng" 
                value={`+${stats.totalOrders || 0}`}
                icon="cart" 
                color="#f59e0b" // Amber
                subtext={`+${stats.todayOrders} hôm nay`}
            />
            <StatCard 
                title="Thành viên" 
                value={stats.totalUsers.toLocaleString()}
                icon="people" 
                color="#10b981" // Emerald
                subtext="Tổng thành viên"
            />
             <StatCard 
                title="Đang xử lý" 
                value="0"
                icon="time" 
                color="#3b82f6" // Blue
                subtext="Cần duyệt ngay"
            />
        </View>

        <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
        <View style={styles.activityList}>
            {recentActivity.length > 0 ? (
                recentActivity.map((item, index) => (
                    <TouchableOpacity 
                        key={`${item.type}-${item.id}`} 
                        style={[styles.activityItem, index < recentActivity.length - 1 && styles.borderBottom]}
                        onPress={() => {
                            if (item.type === 'order') {
                                router.push('/(admin)/orders');
                            } else if (item.type === 'deposit') {
                                router.push('/(admin)/deposits');
                            }
                        }}
                    >
                        <View style={[styles.activityIcon, { backgroundColor: item.type === 'deposit' ? '#dcfce7' : '#dbeafe' }]}>
                            <Ionicons 
                                name={item.type === 'deposit' ? "wallet-outline" : "cart-outline"} 
                                size={20} 
                                color={item.type === 'deposit' ? '#16a34a' : '#2563eb'} 
                            />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.activitySub}>{item.subtitle}</Text>
                            <Text style={styles.activityTime}>{item.date.toLocaleString('vi-VN')}</Text>
                        </View>
                        <View style={styles.activityRight}>
                            <Text style={[styles.activityAmount, { color: item.type === 'deposit' ? '#16a34a' : '#2563eb' }]}>
                                {item.type === 'deposit' ? '+' : '-'}{item.amount.toLocaleString()}đ
                            </Text>
                            <Text style={[styles.activityStatus, { 
                                color: 
                                    item.status === 'Completed' || item.status === 'approved' ? '#16a34a' : 
                                    item.status === 'Pending' || item.status === 'pending' ? '#eab308' : 
                                    '#ef4444' 
                            }]}>
                                {item.status}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="clipboard-outline" size={48} color={colors.border} />
                    <Text style={styles.emptyText}>Chưa có hoạt động nào được ghi nhận</Text>
                </View>
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800', // Extra bold
    color: colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.subtext,
    marginTop: 4,
    fontWeight: '500',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: colors.card,
  },
  highlightCard: {
    marginHorizontal: 20,
    backgroundColor: theme === 'dark' ? '#7c3aed' : '#8b5cf6', // Violet-600/500
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
    shadowColor: theme === 'dark' ? '#000' : '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  highlightLabel: {
    color: '#ddd6fe', // Violet-200
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  highlightValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  highlightIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 20,
  },
  highlightDecor: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 52) / 2, // (screen - padding*2 - gap)/2
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 14,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.subtext,
    fontWeight: '500',
    marginBottom: 8,
  },
  statSub: {
    fontSize: 11,
    fontWeight: '600',
  },

  activityList: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
  },
  activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
  },
  borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
  },
  activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
  },
  activityContent: {
      flex: 1,
  },
  activityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
  },
  activitySub: {
      fontSize: 12,
      color: colors.subtext,
      marginBottom: 2,
  },
  activityTime: {
      fontSize: 10,
      color: colors.subtext,
      opacity: 0.8,
  },
  activityRight: {
      alignItems: 'flex-end',
  },
  activityAmount: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 2,
  },
  activityStatus: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 12,
    color: colors.subtext,
    fontSize: 14,
  },
});
