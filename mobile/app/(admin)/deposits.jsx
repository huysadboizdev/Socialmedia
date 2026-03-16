import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AdminDeposits() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('pending'); // pending | history
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDeposits = async () => {
    try {
      const res = await api.get('/admin/deposits');
      if (res.data.success) {
          setDeposits(res.data.deposits || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải lịch sử nạp tiền");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeposits();
  };

  const filteredDeposits = deposits.filter(d => {
      const matchTab = activeTab === 'pending' ? d.status === 'pending' : d.status !== 'pending';
      const matchSearch = searchTerm === '' || 
          d.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          d.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d._id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTab && matchSearch;
  });

  const handleApprove = (item) => {
      Alert.alert(
          "Duyệt Nạp Tiền",
          `Xác nhận duyệt nạp ${item.amount.toLocaleString('vi-VN')} đ cho ${item.userId?.username}?`,
          [
              { text: "Hủy", style: "cancel" },
              {
                  text: "Duyệt Ngay",
                  onPress: async () => {
                      try {
                          const res = await api.post('/admin/approve', { transactionId: item._id });
                          if (res.data.success) {
                              Alert.alert("Thành công", "Đã duyệt giao dịch");
                              fetchDeposits();
                          }
                      } catch (_e) {
                          Alert.alert("Lỗi", "Không thể duyệt giao dịch");
                      }
                  }
              }
          ]
      );
  };

  const handleReject = (item) => {
      Alert.alert(
          "Từ Chối Nạp Tiền",
          "Bạn có chắc chắn muốn từ chối giao dịch này?",
          [
              { text: "Hủy", style: "cancel" },
              {
                  text: "Từ Chối",
                  style: "destructive",
                  onPress: async () => {
                      try {
                          const res = await api.post('/admin/reject', { transactionId: item._id });
                          if (res.data.success) {
                              Alert.alert("Thành công", "Đã từ chối giao dịch");
                              fetchDeposits();
                          }
                      } catch (_e) {
                          Alert.alert("Lỗi", "Không thể từ chối giao dịch");
                      }
                  }
              }
          ]
      );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.userId?.username?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <View>
                <Text style={styles.username}>{item.userId?.username || 'Unknown'}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
            </View>
        </View>
        <Text style={[styles.amount, { color: activeTab === 'pending' ? '#f59e0b' : (item.status === 'approved' ? '#16a34a' : '#ef4444') }]}>
            {item.status === 'rejected' ? '-' : '+'}{item.amount.toLocaleString('vi-VN')} đ
        </Text>
      </View>

      <View style={styles.cardBody}>
          <Text style={styles.label}>Nội dung:</Text>
          <View style={styles.descBox}>
              <Text style={styles.descText}>{item.description}</Text>
          </View>
          <Text style={styles.transId}>ID: {item._id}</Text>
      </View>

      {item.status === 'pending' ? (
          <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleReject(item)}>
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                  <Text style={[styles.btnText, { color: '#ef4444' }]}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleApprove(item)}>
                  <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                  <Text style={[styles.btnText, { color: '#16a34a' }]}>Duyệt</Text>
              </TouchableOpacity>
          </View>
      ) : (
          <View style={styles.statusRow}>
               <View style={[styles.statusBadge, { 
                   backgroundColor: item.status === 'approved' ? '#dcfce7' : '#fee2e2' 
               }]}>
                   <Ionicons 
                        name={item.status === 'approved' ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={item.status === 'approved' ? '#16a34a' : '#ef4444'} 
                    />
                   <Text style={[styles.statusText, { 
                       color: item.status === 'approved' ? '#15803d' : '#b91c1c' 
                   }]}>
                       {item.status === 'approved' ? 'Giao dịch thành công' : 'Giao dịch thất bại'}
                   </Text>
               </View>
          </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.push('/(admin)/menu')}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản Lý Nạp Tiền</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]} 
            onPress={() => setActiveTab('pending')}
          >
              <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                  Chờ Duyệt ({deposits.filter(d => d.status === 'pending').length})
              </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
            onPress={() => setActiveTab('history')}
          >
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                  Lịch Sử
              </Text>
          </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.subtext} />
            <TextInput 
                style={styles.searchInput}
                placeholder="Tìm giao dịch..."
                placeholderTextColor={colors.subtext}
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList 
            data={filteredDeposits}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={64} color={colors.border} />
                    <Text style={styles.emptyText}>
                        {activeTab === 'pending' ? 'Không có giao dịch chờ duyệt' : 'Chưa có lịch sử giao dịch'}
                    </Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
  },
  headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
  },
  tabContainer: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: colors.card,
      padding: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
  },
  tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
  },
  activeTab: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
  },
  tabText: {
      fontWeight: '600',
      color: colors.subtext,
      fontSize: 14,
  },
  activeTabText: {
      color: 'white',
      fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.text,
    height: '100%',
    fontSize: 15,
  },
  listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
  },
  userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
  },
  avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
  },
  avatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
  },
  username: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
  },
  time: {
      fontSize: 12,
      color: colors.subtext,
  },
  amount: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  cardBody: {
      marginBottom: 16,
  },
  label: {
      fontSize: 12,
      color: colors.subtext,
      marginBottom: 4,
  },
  descBox: {
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
  },
  descText: {
      fontSize: 13,
      color: colors.text,
      fontStyle: 'italic',
  },
  transId: {
      fontSize: 10,
      color: colors.subtext,
      textAlign: 'right',
  },
  actionRow: {
      flexDirection: 'row',
      gap: 12,
  },
  btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
      borderWidth: 1,
  },
  btnReject: {
      borderColor: '#fca5a5',
      backgroundColor: '#fef2f2',
  },
  btnApprove: {
      borderColor: '#86efac',
      backgroundColor: '#f0fdf4',
  },
  btnText: {
      fontWeight: 'bold',
      fontSize: 14,
  },
  statusRow: {
      flexDirection: 'row',
      justifyContent: 'center',
  },
  statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 20,
      gap: 6,
  },
  statusText: {
      fontSize: 13,
      fontWeight: 'bold',
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 60,
      opacity: 0.5,
  },
  emptyText: {
      fontSize: 16,
      color: colors.subtext,
      marginTop: 12,
  },
});
