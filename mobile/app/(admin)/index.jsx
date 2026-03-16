import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api, { getNotifications, markNotificationRead } from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);
  const router = useRouter();
  const { user, unreadNotifCount, unreadCount } = useContext(AuthContext);
  
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    totalUsers: 0,
    todayOrders: 0,
    systemBalance: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);

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
            if (res.data.analytics) {
                setAnalytics(res.data.analytics);
            }
        }

        // Fetch notifications
        if (user && user._id) {
             const notifRes = await getNotifications(user._id);
             if (notifRes.success) {
                 setNotifications(notifRes.notifications);
             }
        }
    } catch (_e) {
        console.error("Error fetching stats:", _e);
    } finally {
        setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (user && user._id && unreadNotifCount !== undefined) {
        // Re-fetch notifications silently when unreadNotifCount changes from polling
        getNotifications(user._id).then(notifRes => {
            if (notifRes.success) {
                setNotifications(notifRes.notifications);
            }
        }).catch(err => console.error("Poll notification error:", err));
    }
  }, [unreadNotifCount, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleReadNotification = async (notificationId, link) => {
      try {
          await markNotificationRead(user._id, notificationId);
          setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
          setShowNotifications(false);
          if (link) {
              // Extract the route part (e.g. "/orders" to "/(admin)/orders")
              if (link.includes('orders')) router.push('/(admin)/orders');
              else if (link.includes('deposits')) router.push('/(admin)/deposits');
          }
      } catch (error) {
          console.error("Error marking read:", error);
      }
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
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => router.push('/(admin)/chats')}
            >
              <Ionicons name="chatbubbles-outline" size={24} color={colors.text} />
              {unreadCount > 0 && (
                  <View style={[styles.badge, styles.badgeWithText]}>
                      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {(unreadNotifCount > 0 || notifications.filter(n => !n.isRead).length > 0) && (
                  <View style={styles.badge} />
              )}
            </TouchableOpacity>
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

        {analytics && (
            <>
                <Text style={styles.sectionTitle}>Bảng thống kê số liệu</Text>
                <View style={styles.statsGrid}>
                    <StatCard 
                        title="Tổng Lượt Click" 
                        value={(analytics.totalClicks || 0).toLocaleString()}
                        icon="mouse-outline" 
                        color="#ec4899" // Pink
                        subtext="Lượt truy cập"
                    />
                    <StatCard 
                        title="Khách Truy Cập" 
                        value={(analytics.uniqueVisitors || 0).toLocaleString()}
                        icon="person-outline" 
                        color="#06b6d4" // Cyan
                        subtext="Duy nhất"
                    />
                    <StatCard 
                        title="Tỷ Lệ Thoát" 
                        value={analytics.bounceRate || "0%"}
                        icon="exit-outline" 
                        color="#f43f5e" // Rose
                        subtext="Session thoát"
                    />
                    <StatCard 
                        title="Thời Gian DS" 
                        value={analytics.avgSession || "0s"}
                        icon="timer-outline" 
                        color="#8b5cf6" // Violet
                        subtext="Trung bình"
                    />
                </View>

                {/* Referrers & Devices */}
                <View style={styles.analyticsListsContainer}>
                    <View style={styles.analyticsListCard}>
                        <Text style={styles.analyticsListTitle}>Nguồn Giới Thiệu</Text>
                        {(analytics.referrers || []).length > 0 ? (
                            analytics.referrers.map((ref, idx) => (
                                <View key={idx} style={styles.analyticsListItem}>
                                    <Text style={styles.analyticsListName} numberOfLines={1}>{ref.name}</Text>
                                    <View style={styles.analyticsListBarBg}>
                                        <View 
                                            style={[styles.analyticsListBarFill, { width: `${Math.min((ref.value / Math.max(...analytics.referrers.map(r => r.value), 1)) * 100, 100)}%`, backgroundColor: '#3b82f6' }]} 
                                        />
                                    </View>
                                    <Text style={styles.analyticsListValue}>{ref.value.toLocaleString()}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
                        )}
                    </View>

                    <View style={styles.analyticsListCard}>
                        <Text style={styles.analyticsListTitle}>Thiết Bị</Text>
                        {(analytics.devices || []).length > 0 ? (
                            analytics.devices.map((dev, idx) => (
                                <View key={idx} style={styles.analyticsListItem}>
                                    <Text style={styles.analyticsListName} numberOfLines={1}>{dev.name}</Text>
                                    <View style={styles.analyticsListBarBg}>
                                        <View 
                                            style={[styles.analyticsListBarFill, { width: `${Math.min((dev.value / Math.max(...analytics.devices.map(d => d.value), 1)) * 100, 100)}%`, backgroundColor: '#10b981' }]} 
                                        />
                                    </View>
                                    <Text style={styles.analyticsListValue}>{dev.value}%</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
                        )}
                    </View>
                </View>
            </>
        )}

      </ScrollView>

        {/* Notifications Modal */}
        <Modal visible={showNotifications} animationType="fade" transparent>
            <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setShowNotifications(false)}
            >
                <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <TouchableOpacity onPress={() => setActiveNotifTab('notifications')}>
                                <Text style={[styles.modalTitle, activeNotifTab !== 'notifications' && { color: colors.subtext, fontWeight: 'normal' }]}>Thông báo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActiveNotifTab('activity')}>
                                <Text style={[styles.modalTitle, activeNotifTab !== 'activity' && { color: colors.subtext, fontWeight: 'normal' }]}>Hoạt động</Text>
                            </TouchableOpacity>
                        </View>
                        {activeNotifTab === 'notifications' && (
                            <TouchableOpacity onPress={async () => {
                                await markNotificationRead(user._id);
                                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                            }}>
                                 <Text style={{color: colors.primary, fontSize: 13}}>Đánh dấu đã đọc</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {activeNotifTab === 'notifications' ? (
                        <FlatList
                            data={notifications}
                            keyExtractor={item => item._id}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={<Text style={{padding: 20, textAlign: 'center', color: colors.subtext}}>Không có thông báo mới</Text>}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.notificationItem, !item.isRead && { backgroundColor: colors.background }]}
                                    onPress={() => handleReadNotification(item._id, item.link)}
                                >
                                    <View style={[styles.notifIcon, !item.isRead && { backgroundColor: colors.primary + '20' }]}>
                                         <Ionicons name={item.message?.includes('ORDER') ? "cart" : "notifications"} size={20} color={!item.isRead ? colors.primary : colors.subtext} />
                                    </View>
                                    <View style={styles.notifContent}>
                                        <Text style={[styles.notifMessage, !item.isRead && {fontWeight: 'bold', color: colors.text}]} numberOfLines={2}>{item.message}</Text>
                                        <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <FlatList
                            data={recentActivity}
                            keyExtractor={item => `${item.type}-${item.id}`}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ padding: 10 }}
                            ListEmptyComponent={<Text style={{padding: 20, textAlign: 'center', color: colors.subtext}}>Chưa có hoạt động nào được ghi nhận</Text>}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                    onPress={() => {
                                        setShowNotifications(false);
                                        if (item.type === 'order') {
                                            router.push('/(admin)/orders');
                                        } else if (item.type === 'deposit') {
                                            router.push('/(admin)/deposits');
                                        }
                                    }}
                                >
                                    <View style={[styles.activityIcon, { backgroundColor: item.type === 'deposit' ? '#dcfce7' : '#dbeafe', marginRight: 12 }]}>
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
                            )}
                        />
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
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
  badgeWithText: {
    width: 'auto',
    height: 18,
    minWidth: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    top: -4,
    right: -4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  
  analyticsListsContainer: {
      paddingHorizontal: 20,
      marginBottom: 32,
      gap: 16,
  },
  analyticsListCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
  },
  analyticsListTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
  },
  analyticsListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
  },
  analyticsListName: {
      width: 80,
      fontSize: 12,
      color: colors.subtext,
  },
  analyticsListBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
  },
  analyticsListBarFill: {
      height: '100%',
      borderRadius: 4,
  },
  analyticsListValue: {
      width: 40,
      textAlign: 'right',
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.text,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  notifIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  notifContent: {
      flex: 1,
  },
  notifMessage: {
      fontSize: 14,
      color: colors.subtext,
      marginBottom: 4,
      lineHeight: 20,
  },
  notifTime: {
      fontSize: 12,
      color: colors.subtext,
      opacity: 0.7,
  }
});
