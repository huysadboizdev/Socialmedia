import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AdminCoupons() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percent', // 'percent' or 'amount'
    discountValue: '',
    totalQuantity: '',
    expiryDate: '' // Keep as string for simple date entry YYYY-MM-DD
  });

  const [editingCoupon, setEditingCoupon] = useState(null);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      if (res.data && res.data.success) {
          setCoupons(res.data.coupons || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoupons();
  };

  const filteredCoupons = coupons.filter(c => 
    searchTerm === '' || c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id, code) => {
    Alert.alert(
        "Xác nhận xóa",
        `Bạn có chắc chắn muốn xóa mã "${code}"?`,
        [
            { text: "Hủy", style: "cancel" },
            { 
                text: "Xóa", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        const res = await api.delete(`/admin/coupons/${id}`);
                        if (res.data && res.data.success) {
                            Alert.alert("Thành công", "Đã xóa mã giảm giá");
                            setCoupons(coupons.filter(c => c._id !== id));
                        } else {
                            Alert.alert("Thất bại", res.data?.message || "Không thể xóa");
                        }
                    } catch(_e) {
                         Alert.alert("Lỗi", "Đã có lỗi xảy ra");
                    }
                }
            }
        ]
    );
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
        const res = await api.put(`/admin/coupons/${id}/status`, { isActive: !currentStatus });
        if (res.data && res.data.success) {
            setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        } else {
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
        }
    } catch (_error) {
        Alert.alert("Lỗi", "Đã có lỗi xảy ra");
    }
  };

  const openAddModal = () => {
    setFormData({
      code: '',
      discountType: 'percent',
      discountValue: '',
      totalQuantity: '',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 1 week
    });
    setAddModalVisible(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
        code: coupon.code,
        discountType: coupon.discountPercent > 0 ? 'percent' : 'amount',
        discountValue: coupon.discountPercent > 0 ? String(coupon.discountPercent) : String(coupon.discountAmount),
        totalQuantity: String(coupon.totalQuantity),
        expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0]
    });
    setEditModalVisible(true);
  };

  const handleSubmit = async (isEdit = false) => {
    if (!formData.code || !formData.discountValue || !formData.totalQuantity || !formData.expiryDate) {
        Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin");
        return;
    }

    try {
        const payload = {
            code: formData.code.toUpperCase(),
            totalQuantity: parseInt(formData.totalQuantity.replace(/[^0-9]/g, '')),
            expiryDate: new Date(formData.expiryDate).toISOString(),
            discountPercent: formData.discountType === 'percent' ? parseInt(formData.discountValue.replace(/[^0-9]/g, '')) : 0,
            discountAmount: formData.discountType === 'amount' ? parseInt(formData.discountValue.replace(/[^0-9]/g, '')) : 0
        };

        let res;
        if (isEdit) {
            res = await api.put(`/admin/coupons/${editingCoupon._id}`, payload);
        } else {
            res = await api.post('/admin/coupons', payload);
        }

        if (res.data && res.data.success) {
             Alert.alert("Thành công", isEdit ? "Đã cập nhật mã giảm giá" : "Đã tạo mã giảm giá");
             setAddModalVisible(false);
             setEditModalVisible(false);
             fetchCoupons();
        } else {
             Alert.alert("Thất bại", res.data?.message || "Thao tác thất bại");
        }
    } catch(err) {
        Alert.alert("Lỗi", err?.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  const renderItem = ({ item }) => {
    const isExpired = new Date(item.expiryDate) < new Date();
    
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.codeContainer}>
                    <Ionicons name="ticket" size={16} color={colors.primary} />
                    <Text style={styles.codeText}>{item.code}</Text>
                </View>
                <View style={{flexDirection: 'row', gap: 6, alignItems: 'center'}}>
                    {isExpired && (
                        <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
                            <Text style={[styles.statusText, { color: '#ef4444' }]}>Hết hạn</Text>
                        </View>
                    )}
                    <Switch 
                        value={item.isActive}
                        onValueChange={() => handleToggleStatus(item._id, item.isActive)}
                        trackColor={{ false: colors.border, true: '#10b981' }}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                </View>
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Giảm giá:</Text>
                    <Text style={[styles.detailValue, { color: item.discountPercent > 0 ? '#06b6d4' : '#8b5cf6', fontWeight: 'bold' }]}>
                        {item.discountPercent > 0 ? `${item.discountPercent}%` : `${item.discountAmount?.toLocaleString('vi-VN')} đ`}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sử dụng:</Text>
                    <Text style={styles.detailValue}>
                        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.usedQuantity}</Text> / {item.totalQuantity}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Hạn dùng:</Text>
                    <Text style={[styles.detailValue, isExpired && { color: '#ef4444' }]}>
                        {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]} onPress={() => openEditModal(item)}>
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id, item.code)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Xóa</Text>
                </TouchableOpacity>
            </View>
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
            <Text style={styles.headerTitle}>Mã giảm giá</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.subtext} />
            <TextInput 
                style={styles.searchInput}
                placeholder="Tìm mã..."
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
            data={filteredCoupons}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="ticket-outline" size={64} color={colors.border} />
                    <Text style={styles.emptyText}>Chưa có mã giảm giá nào</Text>
                </View>
            }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={addModalVisible || editModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{editModalVisible ? "Chỉnh sửa mã" : "Thêm Mã Mới"}</Text>
                    <TouchableOpacity onPress={() => { setAddModalVisible(false); setEditModalVisible(false); }}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mã giảm giá (CODE)</Text>
                        <TextInput 
                            style={styles.input}
                            value={formData.code}
                            onChangeText={t => setFormData({...formData, code: t})}
                            placeholder="VD: WELCOME10"
                            placeholderTextColor={colors.subtext}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Loại giảm giá</Text>
                            <View style={styles.radioGroup}>
                                {[{ id: 'percent', label: '%' }, { id: 'amount', label: 'VNĐ' }].map(type => (
                                    <TouchableOpacity 
                                        key={type.id} 
                                        style={[styles.radioBtn, formData.discountType === type.id && styles.radioBtnActive]}
                                        onPress={() => setFormData({...formData, discountType: type.id})}
                                    >
                                        <Text style={[styles.radioText, formData.discountType === type.id && { color: 'white' }]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Giá trị giảm</Text>
                             <TextInput 
                                style={styles.input}
                                value={formData.discountValue}
                                onChangeText={t => setFormData({...formData, discountValue: t})}
                                keyboardType="numeric"
                                placeholder={formData.discountType === 'percent' ? "VD: 10" : "VD: 20000"}
                                placeholderTextColor={colors.subtext}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Số lượng</Text>
                             <TextInput 
                                style={styles.input}
                                value={formData.totalQuantity}
                                onChangeText={t => setFormData({...formData, totalQuantity: t})}
                                keyboardType="numeric"
                                placeholder="VD: 100"
                                placeholderTextColor={colors.subtext}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ngày hết hạn (YYYY-MM-DD)</Text>
                        <TextInput 
                            style={styles.input}
                            value={formData.expiryDate}
                            onChangeText={t => setFormData({...formData, expiryDate: t})}
                            placeholder="VD: 2024-12-31"
                            placeholderTextColor={colors.subtext}
                        />
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={() => handleSubmit(editModalVisible)}>
                        <Text style={styles.saveBtnText}>{editModalVisible ? "Cập nhật" : "Tạo mã giảm giá"}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
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
  addBtn: {
      width: 40, 
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInputWrapper: {
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
  listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
  card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
  },
  codeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
  },
  codeText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
  },
  statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      justifyContent: 'center',
  },
  statusText: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  cardDetails: {
      gap: 8,
      marginBottom: 16,
  },
  detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  detailLabel: {
      fontSize: 14,
      color: colors.subtext,
  },
  detailValue: {
      fontSize: 14,
      color: colors.subtext,
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
  },
  actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: '#fee2e2',
      borderRadius: 8,
  },
  actionText: {
      fontSize: 13,
      fontWeight: '600',
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
      maxHeight: '90%',
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
  inputGroup: {
      marginBottom: 16,
  },
  row: {
      flexDirection: 'row',
      gap: 12,
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
  },
  input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      color: colors.text,
  },
  radioGroup: {
      flexDirection: 'row',
      gap: 8,
  },
  radioBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
  },
  radioBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
  },
  radioText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
  },
  saveBtn: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 20,
  },
  saveBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
});
