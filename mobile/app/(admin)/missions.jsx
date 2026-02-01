import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AdminMissions() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Edit/Add Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    type: 'like',
    reward: '',
    isActive: true
  });

  const fetchMissions = async () => {
    try {
      const res = await api.get('/admin/missions');
      if (res.data.success) {
          setMissions(res.data.missions || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách nhiệm vụ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMissions();
  };

  const filteredMissions = missions.filter(m => {
    const matchesSearch = searchTerm === '' || m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id) => {
    Alert.alert(
        "Xác nhận xóa",
        "Bạn có chắc chắn muốn xóa nhiệm vụ này?",
        [
            { text: "Hủy", style: "cancel" },
            { 
                text: "Xóa", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        const res = await api.post('/admin/mission/delete', { missionId: id });
                        if (res.data.success) {
                            Alert.alert("Thành công", "Đã xóa nhiệm vụ");
                            setMissions(missions.filter(m => m._id !== id));
                        }
                    } catch(e) {
                         Alert.alert("Lỗi", "Đã có lỗi xảy ra");
                    }
                }
            }
        ]
    );
  };

  const openModal = (mission = null) => {
    if (mission) {
      setEditingMission(mission);
      setFormData({
        title: mission.title,
        link: mission.link || '',
        type: mission.type,
        reward: mission.reward.toString(),
        isActive: mission.isActive
      });
    } else {
      setEditingMission(null);
      setFormData({
        title: '',
        link: '',
        type: 'like',
        reward: '',
        isActive: true
      });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.link || !formData.reward) {
        Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin");
        return;
    }

    // Validate link
    // const pattern = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|instagram\.com|tiktok\.com|vt\.tiktok\.com)\/.*$/i;
    // if (!pattern.test(formData.link)) {
    //     Alert.alert("Link không hợp lệ", "Vui lòng nhập link Facebook, TikTok hoặc Instagram hợp lệ");
    //     return;
    // }

    try {
        const payload = { ...formData, reward: Number(formData.reward) };
        const url = editingMission 
            ? '/admin/mission/update'
            : '/admin/mission/create';
        
        if (editingMission) payload.missionId = editingMission._id;

        const res = await api.post(url, payload);

        if (res.data.success) {
             Alert.alert("Thành công", editingMission ? "Đã cập nhật nhiệm vụ" : "Đã tạo nhiệm vụ");
             setModalVisible(false);
             fetchMissions();
        } else {
             Alert.alert("Thất bại", res.data.message || "Thao tác thất bại");
        }
    } catch(e) {
        Alert.alert("Lỗi", "Không thể lưu nhiệm vụ");
    }
  };

  const getIconForType = (type) => {
      switch(type) {
          case 'like': return 'thumbs-up';
          case 'follow': return 'person-add';
          case 'share': return 'share-social';
          case 'comment': return 'chatbubble';
          default: return 'help-circle';
      }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
            <View style={[styles.typeBadge, { 
                backgroundColor: item.type === 'like' ? '#eff6ff' : item.type === 'follow' ? '#fdf2f8' : '#f0fdf4',
                borderColor: item.type === 'like' ? '#bfdbfe' : item.type === 'follow' ? '#fbcfe8' : '#bbf7d0'
            }]}>
                <Ionicons 
                    name={getIconForType(item.type)} 
                    size={14} 
                    color={item.type === 'like' ? '#2563eb' : item.type === 'follow' ? '#db2777' : '#16a34a'}
                />
                <Text style={[styles.typeText, { 
                    color: item.type === 'like' ? '#1d4ed8' : item.type === 'follow' ? '#be185d' : '#15803d' 
                }]}>
                    {item.type.toUpperCase()}
                </Text>
            </View>
        </View>
        {!item.isActive && (
            <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>OFF</Text>
            </View>
        )}
      </View>

      <Text style={styles.missionTitle}>{item.title}</Text>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
             <Ionicons name="link-outline" size={14} color={colors.subtext} />
             <Text style={styles.linkText} numberOfLines={1}>
                {item.link}
             </Text>
        </View>
         <View style={styles.detailItem}>
             <Ionicons name="gift-outline" size={14} color={colors.subtext} />
             <Text style={[styles.rewardText, { color: '#10b981' }]}>
                +{item.reward.toLocaleString('vi-VN')} đ
             </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(item)}>
            <Ionicons name="create-outline" size={18} color={colors.text} />
            <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
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
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản Lý Nhiệm Vụ</Text>
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
                placeholder="Tìm nhiệm vụ..."
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
             {['All', 'like', 'follow', 'share', 'comment'].map(type => (
                 <TouchableOpacity 
                    key={type}
                    style={[styles.filterChip, filterType === type && styles.activeChip]}
                    onPress={() => setFilterType(type)}
                 >
                    <Text style={[styles.chipText, filterType === type && styles.activeChipText]}>
                        {type === 'All' ? 'Tất cả' : type.toUpperCase()}
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
            data={filteredMissions}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkbox-outline" size={64} color={colors.border} />
                    <Text style={styles.emptyText}>Chưa có nhiệm vụ nào</Text>
                </View>
            }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{editingMission ? "Sửa Nhiệm Vụ" : "Tạo Nhiệm Vụ"}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên nhiệm vụ</Text>
                        <TextInput 
                            style={styles.input}
                            value={formData.title}
                            onChangeText={t => setFormData({...formData, title: t})}
                            placeholder="VD: Like Fanpage A"
                            placeholderTextColor={colors.subtext}
                        />
                    </View>

                     <View style={styles.inputGroup}>
                        <Text style={styles.label}>Link cần làm</Text>
                        <TextInput 
                            style={styles.input}
                            value={formData.link}
                            onChangeText={t => setFormData({...formData, link: t})}
                            placeholder="https://facebook.com/..."
                            placeholderTextColor={colors.subtext}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Loại</Text>
                            <View style={styles.radioGroup}>
                                {['like', 'follow', 'share'].map(t => (
                                    <TouchableOpacity 
                                        key={t} 
                                        style={[styles.radioBtn, formData.type === t && styles.radioBtnActive]}
                                        onPress={() => setFormData({...formData, type: t})}
                                    >
                                        <Text style={[styles.radioText, formData.type === t && { color: 'white' }]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.inputGroup}>
                         <Text style={styles.label}>Tiền thưởng (VNĐ)</Text>
                         <TextInput 
                            style={styles.input}
                            value={formData.reward}
                            onChangeText={t => setFormData({...formData, reward: t})}
                            keyboardType="numeric"
                            placeholder="500"
                            placeholderTextColor={colors.subtext}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Kích hoạt</Text>
                        <Switch 
                            value={formData.isActive}
                            onValueChange={v => setFormData({...formData, isActive: v})}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                        <Text style={styles.saveBtnText}>{editingMission ? "Lưu thay đổi" : "Tạo nhiệm vụ"}</Text>
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
      fontSize: 20,
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
      flex: 1,
  },
  typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      gap: 4,
  },
  typeText: {
      fontSize: 11,
      fontWeight: 'bold',
  },
  inactiveBadge: {
      backgroundColor: '#f1f5f9',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
  },
  inactiveText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#64748b',
  },
  missionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
  },
  cardDetails: {
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 6,
  },
  detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  linkText: {
      fontSize: 13,
      color: '#3b82f6',
      flex: 1,
  },
  rewardText: {
      fontSize: 14,
      fontWeight: 'bold',
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
      marginBottom: 20,
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
      marginBottom: 20,
  },
  saveBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
});
