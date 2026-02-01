import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminUsers() {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    fullName: '',
    email: '',
    isBlocked: false,
    balance: 0
  });

  // Balance Modal State
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/all-user');
      if (res.data.success) {
          setUsers(res.data.users);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const filteredUsers = users.filter(user => 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteUser = (userId, username) => {
    Alert.alert(
        "Xác nhận xóa",
        `Bạn có chắc chắn muốn xóa người dùng "${username}" không?`,
        [
            { text: "Hủy", style: "cancel" },
            { 
                text: "Xóa", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        const res = await api.post('/admin/delete-user', { userId });
                        if (res.data.success) {
                            Alert.alert("Thành công", `Đã xóa ${username}`);
                            setUsers(users.filter(u => u._id !== userId));
                        } else {
                            Alert.alert("Thất bại", res.data.message || "Không thể xóa");
                        }
                    } catch(e) {
                         Alert.alert("Lỗi", "Đã có lỗi xảy ra");
                    }
                }
            }
        ]
    );
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      fullName: user.fullName || '',
      email: user.email,
      isBlocked: user.isBlocked,
      balance: user.balance
    });
    setEditModalVisible(true);
  };

  const handleUpdateUser = async () => {
    try {
        const res = await api.post('/admin/edit-user', {
             userId: selectedUser._id,
             ...editForm
        });
        if (res.data.success) {
             setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...editForm } : u));
             setEditModalVisible(false);
             Alert.alert("Thành công", "Cập nhật thông tin thành công");
        } else {
             Alert.alert("Thất bại", res.data.message || "Cập nhật thất bại");
        }
    } catch(e) {
        Alert.alert("Lỗi", "Không thể cập nhật thông tin");
    }
  };
  
  const openBalanceModal = (user) => {
    setSelectedUser(user);
    setAdjustAmount('');
    setBalanceModalVisible(true);
  };

  const handleAdjustBalance = async () => {
    const amount = parseInt(adjustAmount);
    if (isNaN(amount)) {
        Alert.alert("Lỗi", "Vui lòng nhập số hợp lệ");
        return;
    }
    
    try {
        const res = await api.post('/admin/adjust-balance', { userId: selectedUser._id, amount });
        if (res.data.success) {
             setUsers(users.map(u => u._id === selectedUser._id ? { ...u, balance: res.data.newBalance } : u));
             setBalanceModalVisible(false);
             Alert.alert("Thành công", `Đã ${amount > 0 ? 'cộng' : 'trừ'} tiền thành công`);
        } else {
             Alert.alert("Thất bại", res.data.message);
        }
    } catch(e) {
         Alert.alert("Lỗi", "Không thể điều chỉnh số dư");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => openEditModal(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
            <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={colors.subtext} />
            </View>
            <View>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
            </View>
        </View>
        <TouchableOpacity onPress={() => openBalanceModal(item)}>
             <View style={[styles.balanceBadge, { backgroundColor: item.balance > 0 ? '#f0fdf4' : colors.secondary }]}>
                <Text style={[styles.balanceText, { color: item.balance > 0 ? '#16a34a' : colors.subtext }]}>
                    {item.balance.toLocaleString('vi-VN')} đ
                </Text>
            </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardFooter}>
         <View style={[styles.statusBadge, { backgroundColor: item.isBlocked ? '#fee2e2' : '#dcfce7' }]}>
            <View style={[styles.statusDot, { backgroundColor: item.isBlocked ? '#ef4444' : '#22c55e' }]} />
            <Text style={[styles.statusText, { color: item.isBlocked ? '#b91c1c' : '#15803d' }]}>
                {item.isBlocked ? 'Blocked' : 'Active'}
            </Text>
        </View>
        
        <View style={styles.actions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(item)}>
                <Ionicons name="create-outline" size={18} color={colors.subtext} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteUser(item._id, item.username)}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý người dùng</Text>
        <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="filter" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.subtext} />
        <TextInput 
            style={styles.searchInput}
            placeholder="Tìm theo username hoặc email..."
            placeholderTextColor={colors.subtext}
            value={searchTerm}
            onChangeText={setSearchTerm}
            clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList 
            data={filteredUsers}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={64} color={colors.border} />
                    <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
                </View>
            }
        />
      )}

      {/* Edit User Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Cập nhật thông tin</Text>
                    <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                        <Ionicons name="close" size={24} color={colors.subtext} />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput 
                        style={[styles.input, styles.disabledInput]} 
                        value={editForm.username} 
                        editable={false} 
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput 
                        style={styles.input} 
                        value={editForm.fullName} 
                        onChangeText={t => setEditForm({...editForm, fullName: t})}
                        placeholder="Nhập họ tên"
                        placeholderTextColor={colors.subtext}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput 
                        style={styles.input} 
                        value={editForm.email} 
                        onChangeText={t => setEditForm({...editForm, email: t})} 
                        placeholder="Nhập email"
                        placeholderTextColor={colors.subtext}
                        keyboardType="email-address"
                    />
                </View>

               <TouchableOpacity 
                    style={[styles.statusRow, { borderColor: editForm.isBlocked ? '#fee2e2' : colors.border }]} 
                    onPress={() => setEditForm({...editForm, isBlocked: !editForm.isBlocked})}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.iconBox, { backgroundColor: editForm.isBlocked ? '#fee2e2' : '#dcfce7' }]}>
                            <Ionicons 
                                name={editForm.isBlocked ? "lock-closed" : "lock-open"} 
                                size={20} 
                                color={editForm.isBlocked ? "#ef4444" : "#16a34a"} 
                            />
                        </View>
                        <View>
                            <Text style={styles.statusLabel}>Trạng thái</Text>
                            <Text style={[styles.statusValue, { color: editForm.isBlocked ? '#ef4444' : '#16a34a' }]}>
                                {editForm.isBlocked ? 'Đang bị khóa' : 'Đang hoạt động'}
                            </Text>
                        </View>
                    </View>
                    <Ionicons 
                        name={editForm.isBlocked ? "toggle" : "toggle-outline"} 
                        size={32} 
                        color={editForm.isBlocked ? "#ef4444" : colors.subtext} 
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUser}>
                    <Text style={styles.saveText}>Lưu thay đổi</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Balance Modal */}
       <Modal visible={balanceModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: 340 }]}>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <View style={[styles.iconBox, { backgroundColor: '#dcfce7', width: 64, height: 64, borderRadius: 32, marginBottom: 16 }]}>
                         <Ionicons name="wallet" size={32} color="#16a34a" />
                    </View>
                    <Text style={styles.modalTitle}>Điều chỉnh số dư</Text>
                    <Text style={{ color: colors.subtext, textAlign: 'center' }}>
                        {selectedUser?.username}
                    </Text>
                </View>

                <TextInput 
                    style={[styles.input, { textAlign: 'center', fontSize: 24, fontWeight: 'bold', height: 60 }]} 
                    placeholder="0" 
                    placeholderTextColor={colors.subtext}
                    value={adjustAmount} 
                    onChangeText={setAdjustAmount} 
                    keyboardType="numeric"
                    autoFocus
                />
                <Text style={{ textAlign: 'center', fontSize: 12, color: colors.subtext, marginTop: 8, marginBottom: 24 }}>
                    Dương (+) để cộng, Âm (-) để trừ
                </Text>

                <View style={styles.modalButtons}>
                     <TouchableOpacity style={styles.cancelButton} onPress={() => setBalanceModalVisible(false)}>
                        <Text style={styles.cancelText}>Đóng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.saveButton, { flex: 1, marginTop: 0 }]} onPress={handleAdjustBalance}>
                        <Text style={styles.saveText}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (colors, theme) => StyleSheet.create({
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
  filterBtn: {
      padding: 8,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    marginLeft: 10,
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
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  email: {
    color: colors.subtext,
    fontSize: 13,
  },
  balanceBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
  },
  balanceText: {
      fontSize: 13,
      fontWeight: 'bold',
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
  },
  statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 6,
  },
  statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
  },
  statusText: {
      fontSize: 12,
      fontWeight: '600',
  },
  actions: {
      flexDirection: 'row',
      gap: 8,
  },
  iconBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 60,
      opacity: 0.5,
  },
  emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.subtext,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end', // Bottom sheet style for main edit
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputGroup: {
      marginBottom: 16,
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
    padding: 14,
    color: colors.text,
    fontSize: 16,
  },
  disabledInput: {
      backgroundColor: colors.secondary,
      opacity: 0.7,
  },
  statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 24,
  },
  iconBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
  },
  statusLabel: {
      fontSize: 14,
      color: colors.subtext,
      marginBottom: 2,
  },
  statusValue: {
      fontSize: 15,
      fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    flex: 1,
  },
  cancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
