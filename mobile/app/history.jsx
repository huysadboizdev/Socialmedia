import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../service/userService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function History() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/user/transactions');
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (error) {
      console.log("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'deposit': return 'arrow-down-circle';
      case 'withdraw': return 'arrow-up-circle';
      case 'mission': return 'checkmark-circle';
      case 'attendance': return 'calendar';
      default: return 'swap-horizontal';
    }
  };

  const getColor = (type) => {
    switch (type) {
        case 'deposit': return '#3b82f6'; // blue
        case 'withdraw': return '#ef4444'; // red
        case 'mission': return '#a855f7'; // purple
        case 'attendance': return '#10b981'; // green
        default: return '#71717a';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: getColor(item.type) + '20' }]}>
        <Ionicons name={getIcon(item.type)} size={24} color={getColor(item.type)} />
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>{item.description || 'Giao dịch thành công'}</Text>
        <Text style={styles.date}>
            {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) : ''}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: item.amount >= 0 ? '#10b981' : '#ef4444' }]}>
            {item.amount >= 0 ? '+' : ''}{item.amount.toLocaleString()} đ
        </Text>
        <Text style={styles.balance}>SD: {item.newBalance?.toLocaleString()} đ</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <View style={{width: 24}} /> 
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : (
        <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có giao dịch nào.</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  description: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    color: '#71717a',
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  balance: {
    color: '#71717a',
    fontSize: 11,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
  }
});
