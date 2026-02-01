import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AdminOrders() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // View Modal
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.post('/admin/manage-order', { action: 'getAllOrders' });
      if (res.data.success) {
          setOrders(res.data.orders || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
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

  const handleUpdateStatus = (orderId, newStatus) => {
      Alert.alert(
          "Cập nhật trạng thái",
          `Đổi trạng thái thành "${newStatus}"?`,
          [
              { text: "Hủy", style: "cancel" },
              {
                  text: "Đồng ý",
                  onPress: async () => {
                      try {
                          const res = await api.post('/admin/manage-order', {
                              action: 'updateOrderStatus',
                              orderId,
                              status: newStatus
                          });
                          if (res.data.success) {
                              setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
                              if (selectedOrder && selectedOrder._id === orderId) {
                                  setSelectedOrder({ ...selectedOrder, status: newStatus });
                              }
                              Alert.alert("Thành công", "Đã cập nhật trạng thái");
                          } else {
                              Alert.alert("Thất bại", res.data.message);
                          }
                      } catch (e) {
                          Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
                      }
                  }
              }
          ]
      );
  };

  const handleDeleteOrder = (orderId) => {
      Alert.alert(
          "Xóa đơn hàng",
          "Bạn có chắc chắn muốn xóa đơn hàng này không?",
          [
              { text: "Hủy", style: "cancel" },
              {
                  text: "Xóa",
                  style: "destructive",
                  onPress: async () => {
                      try {
                          const res = await api.post('/admin/manage-order', {
                              action: 'deleteOrder',
                              orderId
                          });
                          if (res.data.success) {
                              setOrders(orders.filter(o => o._id !== orderId));
                              setDetailsModalVisible(false);
                              Alert.alert("Thành công", "Đã xóa đơn hàng");
                          } else {
                              Alert.alert("Thất bại", res.data.message);
                          }
                      } catch (e) {
                          Alert.alert("Lỗi", "Không thể xóa đơn hàng");
                      }
                  }
              }
          ]
      );
  };

  const openDetails = (order) => {
      setSelectedOrder(order);
      setDetailsModalVisible(true);
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
        (o._id && o._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.userId?.username && o.userId.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
      switch(status) {
          case 'Completed': return '#22c55e';
          case 'Pending': return '#eab308';
          case 'In Progress': return '#3b82f6';
          case 'Cancelled': return '#ef4444';
          default: return colors.text;
      }
  };

  const getStatusBg = (status) => {
      switch(status) {
          case 'Completed': return '#dcfce7';
          case 'Pending': return '#fef9c3';
          case 'In Progress': return '#dbeafe';
          case 'Cancelled': return '#fee2e2';
          default: return colors.card;
      }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => openDetails(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
          <Text style={styles.serviceName} numberOfLines={2}>{item.service?.name || 'Dịch vụ đã xóa'}</Text>
          <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={14} color={colors.subtext} />
              <Text style={styles.infoText}>{item.userId?.username || 'Guest'}</Text> 
          </View>
           <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.subtext} />
              <Text style={styles.infoText}>{new Date(item.orderDate).toLocaleDateString('vi-VN')}</Text> 
          </View>
      </View>
      
      <View style={styles.cardFooter}>
          <Text style={styles.price}>{item.totalPrice.toLocaleString('vi-VN')} đ</Text>
          <TouchableOpacity onPress={() => openDetails(item)}>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Chi tiết</Text>
          </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
       <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đơn Hàng</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.subtext} />
            <TextInput 
                style={styles.searchInput}
                placeholder="Tìm mã đơn, user..."
                placeholderTextColor={colors.subtext}
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name={showFilters ? "funnel" : "funnel-outline"} size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
             {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                 <TouchableOpacity 
                    key={status}
                    style={[styles.filterChip, filterStatus === status && styles.activeChip]}
                    onPress={() => setFilterStatus(status)}
                 >
                    <Text style={[styles.chipText, filterStatus === status && styles.activeChipText]}>
                        {status === 'All' ? 'Tất cả' : status}
                    </Text>
                 </TouchableOpacity>
             ))}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList 
            data={filteredOrders}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={64} color={colors.border} />
                    <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
                </View>
            }
        />
      )}

      {/* Detail Modal */}
      <Modal visible={detailsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                    <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {selectedOrder && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Mã đơn hàng</Text>
                                <Text style={styles.value}>#{selectedOrder._id.slice(-6).toUpperCase()}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Khách hàng</Text>
                                <Text style={styles.value}>{selectedOrder.userId?.username}</Text>
                            </View>
                             <View style={styles.detailRow}>
                                <Text style={styles.label}>Ngày đặt</Text>
                                <Text style={styles.value}>{new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}</Text>
                            </View>
                        </View>

                        <View style={styles.detailCard}>
                            <Text style={styles.sectionTitle}>Dịch vụ</Text>
                            <Text style={styles.serviceTitle}>{selectedOrder.service?.name}</Text>
                            <View style={{flexDirection:'row', gap: 8, marginTop: 4}}>
                                <Text style={styles.badge}>{selectedOrder.service?.platform}</Text>
                                <Text style={styles.badge}>{selectedOrder.service?.category}</Text>
                            </View>
                        </View>

                        <View style={styles.detailCard}>
                            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Link</Text>
                                <Text style={[styles.value, { color: '#2563eb' }]} numberOfLines={1}>
                                    {selectedOrder.link || 'Không có'}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Số lượng</Text>
                                <Text style={styles.value}>{selectedOrder.quantity}</Text>
                            </View>
                             <View style={styles.detailRow}>
                                <Text style={styles.label}>Tổng tiền</Text>
                                <Text style={[styles.value, { color: '#16a34a', fontWeight: 'bold' }]}>
                                    {selectedOrder.totalPrice.toLocaleString('vi-VN')} đ
                                </Text>
                            </View>
                            {selectedOrder.note ? (
                                <View style={{ marginTop: 8 }}> 
                                    <Text style={styles.label}>Ghi chú</Text>
                                    <Text style={[styles.value, { fontStyle: 'italic' }]}>{selectedOrder.note}</Text>
                                </View>
                            ) : null}
                        </View>
                        
                         {/* Status Controls */}
                        <View style={styles.statusSection}>
                            <Text style={styles.sectionTitle}>Cập nhật trạng thái</Text>
                            <View style={styles.statusGrid}>
                                {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                                    <TouchableOpacity 
                                        key={status}
                                        style={[
                                            styles.statusBtn, 
                                            selectedOrder.status === status && styles.statusBtnActive,
                                            { borderColor: getStatusColor(status) }
                                        ]}
                                        onPress={() => handleUpdateStatus(selectedOrder._id, status)}
                                    >
                                        <Text style={[
                                            styles.statusBtnText, 
                                            { color: getStatusColor(status) },
                                            selectedOrder.status === status && { color: 'white' }
                                        ]}>
                                            {status}
                                        </Text>
                                        {selectedOrder.status === status && (
                                            <View style={[styles.activeIndicator, { backgroundColor: getStatusColor(status) }]} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteOrder(selectedOrder._id)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            <Text style={styles.deleteText}>Xóa đơn hàng</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </View>
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
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.text,
    height: '100%',
  },
  filterBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
  },
  filterScroll: {
      maxHeight: 40,
      marginBottom: 12,
  },
  filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
  },
  activeChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
  },
  chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.subtext,
  },
  activeChipText: {
      color: 'white',
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
      marginBottom: 12,
  },
  orderId: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
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
  cardBody: {
      marginBottom: 12,
  },
  serviceName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
  },
  infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
  },
  infoText: {
      fontSize: 13,
      color: colors.subtext,
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
  },
  price: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#16a34a',
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
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
  },
  modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      height: '85%',
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
  },
  detailSection: {
      marginBottom: 24,
  },
  detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
  },
  label: {
      fontSize: 14,
      color: colors.subtext,
  },
  value: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      maxWidth: '60%',
      textAlign: 'right',
  },
  detailCard: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
  },
  sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.subtext,
      textTransform: 'uppercase',
      marginBottom: 12,
  },
  serviceTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
  },
  badge: {
      fontSize: 11,
      backgroundColor: colors.card,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.subtext,
  },
  statusSection: {
      marginVertical: 10,
  },
  statusGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
  },
  statusBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      flexGrow: 1,
      alignItems: 'center',
      minWidth: '40%',
  },
  statusBtnText: {
      fontSize: 14,
      fontWeight: '600',
  },
  statusBtnActive: {
      backgroundColor: colors.text, // Will be overridden
  },
  activeIndicator: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      borderRadius: 11,
      opacity: 1,
      zIndex: -1,
  },
  deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 16,
      backgroundColor: '#fee2e2',
      borderRadius: 14,
      marginTop: 20,
  },
  deleteText: {
      color: '#ef4444',
      fontWeight: 'bold',
      fontSize: 15,
  },

});
