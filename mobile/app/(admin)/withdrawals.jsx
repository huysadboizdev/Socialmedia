import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, Image, Dimensions, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AdminWithdrawals() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('pending'); // pending | history
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // QR Viewer
  const [viewingQR, setViewingQR] = useState(null);

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals');
      if (res.data.success) {
          setWithdrawals(res.data.requests || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải yêu cầu rút tiền");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWithdrawals();
  };

  const filteredWithdrawals = withdrawals.filter(w => 
      activeTab === 'pending' ? w.status === 'pending' : w.status !== 'pending'
  );

  const handleApprove = (item) => {
      Alert.alert(
          "Duyệt Rút Tiền",
          "Bạn có chắc chắn muốn duyệt yêu cầu này?",
          [
              { text: "Hủy", style: "cancel" },
              {
                  text: "Duyệt Ngay",
                  onPress: async () => {
                      try {
                          const res = await api.post('/admin/withdraw/approve', { transactionId: item._id });
                          if (res.data.success) {
                              Alert.alert("Thành công", "Đã duyệt yêu cầu rút tiền");
                              fetchWithdrawals();
                          }
                      } catch (_e) {
                          Alert.alert("Lỗi", "Không thể duyệt yêu cầu");
                      }
                  }
              }
          ]
      );
  };

  const handleReject = (item) => {
      Alert.alert(
          "Từ Chối Rút Tiền",
          "Từ chối và hoàn tiền lại cho thành viên?",
          [
              { text: "Hủy", style: "cancel" },
              {
                  text: "Từ Chối",
                  style: "destructive",
                  onPress: async () => {
                      try {
                          const res = await api.post('/admin/withdraw/reject', { transactionId: item._id });
                          if (res.data.success) {
                              Alert.alert("Thành công", "Đã từ chối và hoàn tiền");
                              fetchWithdrawals();
                          }
                      } catch (_e) {
                          Alert.alert("Lỗi", "Không thể từ chối yêu cầu");
                      }
                  }
              }
          ]
      );
  };

  const renderItem = ({ item }) => {
      const amount = Math.abs(item.amount);
      const fee = amount * 0.2;
      const finalAmount = amount - fee;

      return (
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
            <View style={styles.amountBadge}>
                <Text style={styles.amountText}>-{amount.toLocaleString()} đ</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
               <View style={styles.detailRow}>
                   <View style={styles.detailItem}>
                       <Text style={styles.detailLabel}>Phí (20%)</Text>
                       <Text style={styles.feeText}>{fee.toLocaleString()} đ</Text>
                   </View>
                   <View style={styles.detailItem}>
                       <Text style={styles.detailLabel}>Thực nhận</Text>
                       <Text style={styles.finalAmountText}>{finalAmount.toLocaleString()} đ</Text>
                   </View>
               </View>

               <View style={styles.bankBox}>
                   <View style={styles.bankRow}>
                       <Ionicons name="card-outline" size={16} color={colors.primary} />
                       <Text style={styles.bankName}>{item.withdrawalDetails?.bankName}</Text>
                   </View>
                   <Text style={styles.bankAccount}>{item.withdrawalDetails?.bankAccount}</Text>
                   {item.withdrawalDetails?.email && (
                       <View style={styles.emailRow}>
                           <Ionicons name="mail-outline" size={14} color={colors.subtext} />
                           <Text style={styles.emailText}>{item.withdrawalDetails.email}</Text>
                       </View>
                   )}
               </View>

               {item.withdrawalDetails?.qrCode && (
                   <TouchableOpacity style={styles.qrBtn} onPress={() => setViewingQR(item.withdrawalDetails.qrCode)}>
                       <Ionicons name="qr-code-outline" size={18} color={colors.text} />
                       <Text style={styles.qrBtnText}>Xem QR Code</Text>
                   </TouchableOpacity>
               )}
          </View>

          {activeTab === 'pending' ? (
              <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleReject(item)}>
                      <Ionicons name="close-circle" size={18} color="#ef4444" />
                      <Text style={[styles.btnText, { color: '#ef4444' }]}>Từ Chối</Text>
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
                           {item.status === 'approved' ? 'Thành công' : 'Đã từ chối'}
                       </Text>
                   </View>
              </View>
          )}

          {item.description && item.description.includes('HUYWD') && (
               <View style={styles.codeBox}>
                   <Text style={styles.codeLabel}>Mã đối soát:</Text>
                   <Text style={styles.codeValue}>{item.description.split(' - ')[0]}</Text>
               </View>
          )}
        </View>
      );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.push('/(admin)/menu')}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản Lý Rút Tiền</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]} 
            onPress={() => setActiveTab('pending')}
          >
              <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                  Chờ Duyệt ({withdrawals.filter(w => w.status === 'pending').length})
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

      {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList 
            data={filteredWithdrawals}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="wallet-outline" size={64} color={colors.border} />
                    <Text style={styles.emptyText}>
                        {activeTab === 'pending' ? 'Không có yêu cầu rút tiền' : 'Chưa có lịch sử giao dịch'}
                    </Text>
                </View>
            }
        />
      )}

      {/* QR Modal */}
      <Modal visible={!!viewingQR} transparent animationType="fade">
          <View style={styles.modalOverlay}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setViewingQR(null)}>
                  <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              {viewingQR && (
                  <View style={styles.qrContainer}>
                      <Image 
                          source={{ uri: viewingQR }} 
                          style={styles.qrImage} 
                          resizeMode="contain"
                      />
                      <Text style={styles.qrText}>Quét mã để chuyển khoản</Text>
                  </View>
              )}
          </View>
      </Modal>

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
      padding: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
  },
  tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
  },
  activeTab: {
      backgroundColor: colors.background === '#ffffff' ? '#ffffff' : colors.primary,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
  },
  tabText: {
      fontWeight: '600',
      color: colors.subtext,
      fontSize: 13,
  },
  activeTabText: {
      color: colors.primary,
      fontWeight: 'bold',
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
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
  amountBadge: {
      backgroundColor: '#fff1f2',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
  },
  amountText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#e11d48',
  },
  detailsContainer: {
      marginBottom: 16,
      gap: 12,
  },
  detailRow: {
      flexDirection: 'row',
      gap: 12,
  },
  detailItem: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
  },
  detailLabel: {
      fontSize: 11,
      color: colors.subtext,
      marginBottom: 2,
  },
  feeText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#f97316',
  },
  finalAmountText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#16a34a',
  },
  bankBox: {
      backgroundColor: '#f8fafc',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e2e8f0',
  },
  bankRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
  },
  bankName: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#334155',
  },
  bankAccount: {
      fontSize: 16,
      fontWeight: '900',
      color: '#0f172a',
      marginBottom: 6,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      letterSpacing: 1,
  },
  emailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  emailText: {
      fontSize: 12,
      color: '#64748b',
  },
  qrBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: 10,
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
  },
  qrBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
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
      marginTop: 4,
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
  codeBox: {
      marginTop: 12,
      backgroundColor: '#f3e8ff',
      padding: 8,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
  },
  codeLabel: {
      fontSize: 12,
      color: '#7e22ce',
      fontWeight: '600',
  },
  codeValue: {
      fontSize: 13,
      color: '#7e22ce',
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
  // Modal
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  closeBtn: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      padding: 10,
  },
  qrContainer: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 20,
      alignItems: 'center',
  },
  qrImage: {
      width: width * 0.7,
      height: width * 0.7,
      marginBottom: 12,
  },
  qrText: {
      fontSize: 14,
      color: '#333',
      fontWeight: '600',
  },
});
