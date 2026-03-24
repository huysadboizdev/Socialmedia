import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { getUserInfo } from '../../service/userService';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import NotificationModal from '../../components/NotificationModal';

// Assets
import sotienGif from '../../assets/sotien.gif';
import tongnapGif from '../../assets/tongnap.gif';
import napthangGif from '../../assets/napthang.gif';
import capbacGif from '../../assets/capbac.gif';

export default function Home() {
  const { user, unreadCount } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isNoteVisible, setIsNoteVisible] = useState(true);
  
  // Local stats state removed as we use displayUser

  const fetchUserData = async () => {
    try {
      const res = await getUserInfo();
      if (res.success) {
        setUserData(res.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Use local userData if available, else context user, else null
  const displayUser = userData || user;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <NotificationModal 
          isOpen={isNoteVisible} 
          onClose={() => setIsNoteVisible(false)} 
        />
        {/* Header */}
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Xin chào,</Text>
                <Text style={styles.username}>{displayUser?.username || 'Thành viên'}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <Link href="/chat-admin" asChild>
                    <TouchableOpacity style={styles.notiBtn}>
                        <Ionicons name="chatbubbles-outline" size={24} color={colors.text} />
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </Link>
                <TouchableOpacity style={styles.notiBtn}>
                    <Ionicons name="notifications-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
            {/* Balance */}
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                    <Image source={sotienGif} style={{ width: 32, height: 32 }} resizeMode="contain" />
                </View>
                <View>
                    <Text style={styles.statValue}>{(displayUser?.balance || 0).toLocaleString('vi-VN')} đ</Text>
                    <Text style={styles.statLabel}>Số dư</Text>
                </View>
            </View>

            {/* Total Deposit */}
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
                    <Image source={tongnapGif} style={{ width: 32, height: 32 }} resizeMode="contain" />
                </View>
                <View>
                    <Text style={styles.statValue}>{(displayUser?.totalDeposit || 0).toLocaleString('vi-VN')}</Text>
                    <Text style={styles.statLabel}>Tổng nạp</Text>
                </View>
            </View>

            {/* Month Deposit */}
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                     <Image source={napthangGif} style={{ width: 32, height: 32 }} resizeMode="contain" />
                </View>
                <View>
                    <Text style={styles.statValue}>{(displayUser?.monthDeposit || 0).toLocaleString('vi-VN')}</Text>
                    <Text style={styles.statLabel}>Nạp tháng</Text>
                </View>
            </View>

            {/* Rank */}
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Image source={capbacGif} style={{ width: 32, height: 32 }} resizeMode="contain" />
                </View>
                <View>
                    <Text style={styles.statValue}>{displayUser?.rankName || 'Thành viên'}</Text>
                    <Text style={styles.statLabel}>Cấp bậc</Text>
                </View>
            </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
            <View style={[styles.infoBox, { backgroundColor: 'rgba(34, 211, 238, 0.15)', borderColor: 'rgba(34, 211, 238, 0.3)' }]}>
                <Text style={styles.infoTitle}>Admin {currentTime}</Text>
                
                <View style={styles.infoRow}>
                    <Ionicons name="finger-print" size={16} color="#f87171" style={styles.infoIcon} />
                    <Text style={styles.infoText}>Điểm danh hằng ngày truy cập: <Text style={styles.linkText}>Tại Đây</Text></Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Ionicons name="checkbox-outline" size={16} color="#4ade80" style={styles.infoIcon} />
                    <Text style={styles.infoText}>Nhiệm vụ hằng ngày truy cập: <Text style={styles.linkText}>Tại Đây</Text></Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="ribbon-outline" size={16} color="#facc15" style={styles.infoIcon} />
                    <Text style={styles.infoText}>Cảm Ơn Bạn Đã Chọn: <Text style={styles.highlightText}>HUYTICHXANH</Text></Text>
                </View>

                <Link href="/leaderboard" asChild>
                    <TouchableOpacity style={styles.infoRow}>
                        <Ionicons name="trophy-outline" size={16} color="#fbbf24" style={styles.infoIcon} />
                        <Text style={styles.infoText}>Bảng Đua Top Nạp Tiền: <Text style={styles.linkText}>Xem Ngay</Text></Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <View style={[styles.infoBox, { backgroundColor: 'rgba(34, 211, 238, 0.15)', borderColor: 'rgba(34, 211, 238, 0.3)' }]}>
                <Text style={styles.infoTitle}>Admin Support</Text>
                
                <View style={styles.infoRow}>
                    <Ionicons name="headset-outline" size={16} color="#60a5fa" style={styles.infoIcon} />
                    <Text style={styles.infoText}>Admin Hỗ Trợ Qua ZaLo: <Text style={styles.highlightText}>0763076124</Text></Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Ionicons name="logo-facebook" size={16} color="#fb923c" style={styles.infoIcon} />
                    <Text style={styles.infoText}>FaceBook CSKH Sub6Sao.Com: <Text style={styles.linkText}>TẠI ĐÂY</Text></Text>
                </View>
            </View>
        </View>

        {/* Recent Updates */}
        <View style={styles.updatesCard}>
            <Text style={styles.sectionTitle}>Cập nhật gần đây</Text>
            
            <View style={styles.updateContent}>
                {/* Image placeholder would go here */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeTitle}>Chào Mừng Bạn Đến Với <Text style={styles.highlightText}>HUYTICHXANH</Text></Text>
                    <Text style={styles.welcomeDescription}>Chúng Tôi Chuyên Cung Cấp - Dịch Vụ Mạng Xã Hội Rẻ Nhất Việt Nam</Text>
                    <Text style={styles.welcomeFooter}>Cảm Ơn Các Bạn Đã Đồng Hành Và Sử Dụng Dịch Vụ 🌸</Text>
                </View>

                <View style={styles.timeFooter}>
                    <Ionicons name="time-outline" size={14} color="#71717a" />
                    <Text style={styles.footerTime}>{currentTime}</Text>
                </View>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
   gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    color: colors.subtext,
    fontSize: 14,
  },
  username: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  notiBtn: {
      padding: 8,
      backgroundColor: colors.card,
      borderRadius: 12,
      position: 'relative',
  },
  badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#ef4444', // red-500
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
  },
  badgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%', // Approx half with gap
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    flexGrow: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.subtext,
    fontSize: 12,
  },
  section: {
    gap: 16,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  infoTitle: {
    color: '#22d3ee', // cyan-400
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  infoIcon: {
    backgroundColor: colors.secondary, 
    borderRadius: 10,
    padding: 2,
    overflow: 'hidden',
  },
  infoText: {
    color: colors.text, 
    fontSize: 13,
    flex: 1,
  },
  linkText: {
    color: '#c084fc', // purple-400
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  highlightText: {
    color: '#c084fc', // purple-400
    fontWeight: 'bold',
  },
  updatesCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 16,
  },
  updateContent: {
    alignItems: 'center',
    gap: 16,
  },
  welcomeContainer: {
    gap: 8,
    alignItems: 'center',
  },
  welcomeTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeDescription: {
    color: colors.subtext,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  welcomeFooter: {
    color: colors.subtext,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  timeFooter: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border, 
  },
  footerTime: {
    color: colors.subtext,
    fontSize: 12,
  },
});
