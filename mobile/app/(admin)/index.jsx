import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Platform } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
        const res = await api.get('/admin/stats');
        if (res.data.success && res.data.stats) {
             setStats({
                monthlyRevenue: res.data.stats.monthlyRevenue || 0,
                totalUsers: res.data.stats.totalUsers || 0,
                todayOrders: res.data.stats.todayOrders || 0,
                systemBalance: res.data.stats.systemBalance || 0
            });
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
                title="Doanh thu tháng" 
                value={`${(stats.monthlyRevenue).toLocaleString('vi-VN')} đ`}
                icon="bar-chart" 
                color="#8b5cf6" // Violet
                subtext="+12.5% vs tháng trước"
            />
             <StatCard 
                title="Đơn hàng mới" 
                value={`+${stats.todayOrders}`}
                icon="cart" 
                color="#f59e0b" // Amber
                subtext="Hôm nay"
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
        <View style={styles.activityCard}>
            <View style={styles.emptyState}>
                <Ionicons name="clipboard-outline" size={48} color={colors.border} />
                <Text style={styles.emptyText}>Chưa có hoạt động nào được ghi nhận</Text>
            </View>
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
  activityCard: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
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
