import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserInfo } from '../../service/userService';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
            <View>
                <Text style={styles.welcomeText}>Xin chào,</Text>
                <Text style={styles.username}>{userData?.username || 'Thành viên'}</Text>
            </View>
            <Ionicons name="notifications-outline" size={24} color="white" />
        </View>

        {/* Stats Grid */}
        <View style={styles.grid}>
            {/* Balance */}
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                    <Ionicons name="wallet-outline" size={24} color="#f472b6" />
                </View>
                <View>
                    <Text style={styles.cardValue}>{(userData?.balance || 0).toLocaleString('vi-VN')}</Text>
                    <Text style={styles.cardLabel}>Số dư</Text>
                </View>
            </View>

            {/* Total Deposit */}
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
                    <Ionicons name="cash-outline" size={24} color="#facc15" />
                </View>
                <View>
                    <Text style={styles.cardValue}>0</Text>
                    <Text style={styles.cardLabel}>Tổng nạp</Text>
                </View>
            </View>

            {/* Month Deposit */}
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                    <Ionicons name="calendar-outline" size={24} color="#fb923c" />
                </View>
                <View>
                    <Text style={styles.cardValue}>0 USD</Text>
                    <Text style={styles.cardLabel}>Nạp tháng</Text>
                </View>
            </View>

            {/* Rank */}
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Ionicons name="trophy-outline" size={24} color="#f87171" />
                </View>
                <View>
                    <Text style={styles.cardValue}>Thành viên</Text>
                    <Text style={styles.cardLabel}>Cấp bậc</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // zinc-950
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
  welcomeText: {
    color: '#a1a1aa', // zinc-400
    fontSize: 14,
  },
  username: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%', // Approx half with gap
    backgroundColor: '#18181b', // zinc-900
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a', // zinc-800
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardLabel: {
    color: '#a1a1aa', // zinc-400
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
  },
  infoIcon: {
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 10,
    padding: 2,
    overflow: 'hidden',
  },
  infoText: {
    color: '#e2e8f0', // slate-200
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
    backgroundColor: '#18181b', // zinc-900
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a', // zinc-800
    padding: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
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
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeDescription: {
    color: '#a1a1aa',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  welcomeFooter: {
    color: '#a1a1aa',
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
    borderTopColor: '#27272a', // dashed border workaround
  },
  footerTime: {
    color: '#71717a',
    fontSize: 12,
  },
});
