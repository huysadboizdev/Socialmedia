import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AdminServices() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Edit/Add Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Facebook',
    category: 'Tăng Like',
    price: '',
    speed: '',
    description: '',
    isActive: true,
    isMaintenance: false
  });

  const fetchServices = async () => {
    try {
      const res = await api.get('/admin/list');
      if (res.data.success) {
          setServices(res.data.services || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' || service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'All' || service.platform === filterPlatform;
    const matchesCategory = filterCategory === 'All' || service.category === filterCategory;
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const handleDelete = (serviceId, name) => {
    Alert.alert(
        "Xác nhận xóa",
        `Bạn có chắc chắn muốn xóa dịch vụ "${name}"?`,
        [
            { text: "Hủy", style: "cancel" },
            { 
                text: "Xóa", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        const res = await api.post('/admin/delete-service', { serviceId });
                        if (res.data.success) {
                            Alert.alert("Thành công", "Đã xóa dịch vụ");
                            setServices(services.filter(s => s._id !== serviceId));
                        } else {
                            Alert.alert("Thất bại", res.data.message || "Không thể xóa");
                        }
                    } catch(_e) {
                         Alert.alert("Lỗi", "Đã có lỗi xảy ra");
                    }
                }
            }
        ]
    );
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        platform: service.platform,
        category: service.category,
        price: service.price.toString(),
        speed: service.speed,
        description: service.description || '',
        isActive: service.isActive !== false,
        isMaintenance: service.isMaintenance === true
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        platform: 'Facebook',
        category: 'Tăng Like',
        price: '',
        speed: '',
        description: '',
        isActive: true,
        isMaintenance: false
      });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.speed) {
        Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ tên, giá và tốc độ");
        return;
    }

    try {
        const payload = { ...formData, price: Number(formData.price) };
        let res;
        
        if (editingService) {
            res = await api.post('/admin/edit-service', {
                ...payload,
                serviceId: editingService._id
            });
        } else {
            res = await api.post('/admin/add-service', payload);
        }

        if (res.data.success) {
             Alert.alert("Thành công", editingService ? "Đã cập nhật dịch vụ" : "Đã thêm dịch vụ mới");
             setModalVisible(false);
             fetchServices();
        } else {
             Alert.alert("Thất bại", res.data.message || "Thao tác thất bại");
        }
    } catch(_e) {
        Alert.alert("Lỗi", "Không thể lưu dịch vụ");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
            <View style={[styles.platformBadge, { 
                backgroundColor: 
                    item.platform === 'Facebook' ? '#eff6ff' : 
                    item.platform === 'TikTok' ? '#F3F4F6' : 
                    item.platform === 'Instagram' ? '#fdf2f8' :
                    item.platform === 'YouTube' ? '#fef2f2' :
                    item.platform === 'Locket' ? '#fffbeb' :
                    item.platform === 'Spotify' ? '#f0fdf4' :
                    '#f8fafc',
                borderColor: 
                    item.platform === 'Facebook' ? '#bfdbfe' : 
                    item.platform === 'TikTok' ? '#E5E7EB' : 
                    item.platform === 'Instagram' ? '#fbcfe8' :
                    item.platform === 'YouTube' ? '#fecaca' :
                    item.platform === 'Locket' ? '#fde68a' :
                    item.platform === 'Spotify' ? '#bbf7d0' :
                    '#e2e8f0'
            }]}>
                <Ionicons 
                    name={
                        item.platform === 'Facebook' ? "logo-facebook" : 
                        item.platform === 'TikTok' ? "logo-tiktok" : 
                        item.platform === 'Instagram' ? "logo-instagram" :
                        item.platform === 'YouTube' ? "logo-youtube" :
                        item.platform === 'Apple' ? "logo-apple" :
                        "star"
                    } 
                    size={14} 
                    color={
                        item.platform === 'Facebook' ? '#2563eb' : 
                        item.platform === 'TikTok' ? '#374151' : 
                        item.platform === 'Instagram' ? '#db2777' :
                        item.platform === 'YouTube' ? '#ef4444' :
                        item.platform === 'Locket' ? '#d97706' :
                        item.platform === 'Spotify' ? '#16a34a' :
                        '#4b5563'
                    } 
                />
                <Text style={[styles.platformText, { 
                    color: 
                        item.platform === 'Facebook' ? '#1d4ed8' : 
                        item.platform === 'TikTok' ? '#374151' : 
                        item.platform === 'Instagram' ? '#be185d' :
                        item.platform === 'YouTube' ? '#dc2626' :
                        item.platform === 'Locket' ? '#b45309' :
                        item.platform === 'Spotify' ? '#15803d' :
                        '#374151'
                }]}>
                    {item.platform}
                </Text>
            </View>
            <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 6}}>
             {!item.isActive && (
                <View style={[styles.statusBadge, { backgroundColor: '#f1f5f9' }]}>
                    <Text style={[styles.statusText, { color: '#64748b' }]}>OFF</Text>
                </View>
             )}
             {item.isMaintenance && (
                <View style={[styles.statusBadge, { backgroundColor: '#fff7ed' }]}>
                    <Text style={[styles.statusText, { color: '#ea580c' }]}>Bảo trì</Text>
                </View>
             )}
        </View>
      </View>

      <Text style={styles.serviceName}>{item.name}</Text>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
             <Ionicons name="pricetag-outline" size={14} color={colors.subtext} />
             <Text style={[styles.detailText, { color: '#8b5cf6', fontWeight: 'bold' }]}>
                {item.price.toLocaleString('vi-VN')} đ
             </Text>
        </View>
        <View style={styles.detailItem}>
             <Ionicons name="speedometer-outline" size={14} color={colors.subtext} />
             <Text style={styles.detailText} numberOfLines={1}>
                {item.speed}
             </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(item)}>
            <Ionicons name="create-outline" size={18} color={colors.text} />
            <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id, item.name)}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.push('/(admin)/menu')}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dịch vụ</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
            <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.subtext} />
            <TextInput 
                style={styles.searchInput}
                placeholder="Tìm dịch vụ..."
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
             {['All', 'Facebook', 'TikTok', 'Instagram', 'YouTube', 'Locket', 'Spotify', 'Apple'].map(platform => (
                 <TouchableOpacity 
                    key={platform}
                    style={[styles.filterChip, filterPlatform === platform && styles.activeChip]}
                    onPress={() => setFilterPlatform(platform)}
                 >
                    <Text style={[styles.chipText, filterPlatform === platform && styles.activeChipText]}>
                        {platform === 'All' ? 'Tất cả' : platform}
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
            data={filteredServices}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="layers-outline" size={64} color={colors.border} />
                    <Text style={styles.emptyText}>Không có dịch vụ nào</Text>
                </View>
            }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{editingService ? "Sửa dịch vụ" : "Thêm dịch vụ"}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Nền tảng</Text>
                             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.radioGroup}>
                                    {['Facebook', 'TikTok', 'Instagram', 'YouTube', 'Locket', 'Spotify', 'Apple'].map(p => (
                                        <TouchableOpacity 
                                            key={p} 
                                            style={[styles.radioBtn, formData.platform === p && styles.radioBtnActive]}
                                            onPress={() => setFormData({...formData, platform: p})}
                                        >
                                            <Text style={[styles.radioText, formData.platform === p && { color: 'white' }]}>{p}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên dịch vụ</Text>
                        <TextInput 
                            style={styles.input}
                            value={formData.name}
                            onChangeText={t => setFormData({...formData, name: t})}
                            placeholder="VD: Server 1 (Like Việt)"
                            placeholderTextColor={colors.subtext}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Danh mục</Text>
                         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.radioGroup}>
                                {['Tăng Like', 'Tăng Theo Dõi', 'Tăng Share', 'Tích Xanh', 'Premium', 'Chứng Chỉ'].map(c => (
                                    <TouchableOpacity 
                                        key={c} 
                                        style={[styles.radioBtn, formData.category === c && styles.radioBtnActive]}
                                        onPress={() => setFormData({...formData, category: c})}
                                    >
                                        <Text style={[styles.radioText, formData.category === c && { color: 'white' }]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.row}>
                         <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Giá (đ)</Text>
                             <TextInput 
                                style={styles.input}
                                value={formData.price}
                                onChangeText={t => setFormData({...formData, price: t})}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.subtext}
                            />
                        </View>
                    </View>

                    {formData.category !== 'Premium' && formData.category !== 'Chứng Chỉ' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tốc độ</Text>
                            <TextInput 
                                style={styles.input}
                                value={formData.speed}
                                onChangeText={t => setFormData({...formData, speed: t})}
                                placeholder="VD: Nhanh, 5k/ngày"
                                placeholderTextColor={colors.subtext}
                            />
                        </View>
                    )}
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mô tả</Text>
                        <TextInput 
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={formData.description}
                            onChangeText={t => setFormData({...formData, description: t})}
                            placeholder="Mô tả chi tiết..."
                            placeholderTextColor={colors.subtext}
                            multiline
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Hiển thị dịch vụ (Active)</Text>
                        <Switch 
                            value={formData.isActive}
                            onValueChange={v => setFormData({...formData, isActive: v})}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>
                    
                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Chế độ bảo trì</Text>
                        <Switch 
                            value={formData.isMaintenance}
                            onValueChange={v => setFormData({...formData, isMaintenance: v})}
                            trackColor={{ false: colors.border, true: '#f97316' }}
                        />
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                        <Text style={styles.saveBtnText}>{editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}</Text>
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
      alignItems: 'flex-start',
      marginBottom: 10,
  },
  headerLeft: {
      gap: 4,
      flex: 1,
  },
  platformBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      gap: 4,
  },
  platformText: {
      fontSize: 11,
      fontWeight: 'bold',
  },
  categoryText: {
      fontSize: 12,
      colors: colors.subtext,
      marginLeft: 2,
  },
  statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
  },
  statusText: {
      fontSize: 10,
      fontWeight: 'Bold',
      textTransform: 'uppercase',
  },
  serviceName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      lineHeight: 22,
  },
  cardDetails: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
  },
  detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  detailText: {
      fontSize: 13,
      color: colors.text,
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
      paddingVertical: 4,
      paddingHorizontal: 8,
  },
  actionText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
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
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
  },
  radioBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
  },
  radioText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
  },
  switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
