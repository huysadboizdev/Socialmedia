import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import api from '../service/userService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Assets
import allGif from '../assets/alll_list.gif';

export default function Orders() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      // Reusing the endpoint from services.jsx but without filtering
      const res = await api.post('/user/service', { action: 'getOrderHistory' });
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
      switch(String(status).toLowerCase()) {
          case 'completed': return '#22c55e'; // green
          case 'pending': return '#eab308'; // yellow
          case 'processing': return '#3b82f6'; // blue
          case 'canceled': return '#ef4444'; // red
          default: return '#71717a';
      }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(item.service?.platform) }]}>
                <Text style={styles.platformText}>{item.service?.platform || '?'}</Text>
            </View>
            <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.serviceName}>{item.service?.name || 'Dịch vụ đã xóa'}</Text>
      
      <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Số lượng</Text>
              <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>
          <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tổng tiền</Text>
              <Text style={styles.detailValue}>{(item.totalPrice || 0).toLocaleString()} đ</Text>
          </View>
      </View>

      <Text style={styles.date}>
          {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) : ''}
      </Text>
    </View>
  );

  const getPlatformColor = (platform) => {
      switch(platform) {
          case 'Facebook': return '#1877F2';
          case 'Instagram': return '#E1306C';
          case 'TikTok': return '#000000'; // or white
          default: return '#71717a';
      }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Image source={allGif} style={{ width: 28, height: 28 }} resizeMode="contain" />
            <Text style={styles.headerTitle}>Tất cả tiến trình</Text>
        </View>
        <View style={{width: 24}} /> 
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có đơn hàng nào.</Text>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  platformText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderId: {
    color: colors.subtext,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  serviceName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  detailItem: {
      gap: 4,
  },
  detailLabel: {
      color: colors.subtext,
      fontSize: 11,
  },
  detailValue: {
      color: colors.text, // e4e4e7 -> text
      fontWeight: '500',
  },
  date: {
    color: colors.subtext,
    fontSize: 11,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.subtext,
  }
});
