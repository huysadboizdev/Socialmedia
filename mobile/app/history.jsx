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
import lichsuGif from '../assets/lichsugd.gif';

export default function History() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
        <Text style={[styles.amount, { color: item.amount >= 0 ? colors.success : colors.danger }]}>
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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Image source={lichsuGif} style={{ width: 28, height: 28 }} resizeMode="contain" />
            <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        </View>
        <View style={{width: 24}} /> 
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    color: colors.subtext,
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
    color: colors.subtext,
    fontSize: 11,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.subtext,
  }
});
