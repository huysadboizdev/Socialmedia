import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AdminSettings() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState({
    title: '',
    items: []
  });
  const [membershipConfig, setMembershipConfig] = useState({
    tiers: [
      { name: 'Thành viên', threshold: 0, discount: 0 },
      { name: 'Cộng tác viên', threshold: 5000000, discount: 0.1 },
      { name: 'Nhà phân phối', threshold: 20000000, discount: 0.3 }
    ]
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [resAnnounce, resMember] = await Promise.all([
         api.get('/user/announcement'),
         api.get('/admin/membership-config')
      ]);

      if (resAnnounce.data.success && resAnnounce.data.announcement) {
        setAnnouncement(resAnnounce.data.announcement);
      }
      if (resMember.data.success && resMember.data.config) {
        setMembershipConfig(resMember.data.config);
      }
    } catch (_error) {
      console.error(_error);
      Alert.alert("Lỗi", "Không thể tải cài đặt");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [resAnnounce, resMember] = await Promise.all([
          api.post('/admin/announcement', { value: announcement }),
          api.post('/admin/membership-config', { value: membershipConfig })
      ]);
      
      if (resAnnounce.data.success && resMember.data.success) {
        Alert.alert("Thành công", "Cập nhật cài đặt thành công!");
      } else {
        Alert.alert("Cảnh báo", "Có lỗi xảy ra khi lưu một số cài đặt.");
      }
    } catch (_error) {
      Alert.alert("Lỗi", "Không thể lưu cài đặt");
    } finally {
      setSaving(false);
    }
  };

  const handleFixBalances = () => {
      Alert.alert(
          "CẢNH BÁO",
          "Thao tác này sẽ quét toàn bộ thành viên và sửa các số dư bị lỗi 'khổng lồ'. Bạn có chắc chắn muốn thực hiện?",
          [
              { text: "Hủy", style: "cancel" },
              {
                  text: "Thực hiện",
                  style: "destructive",
                  onPress: async () => {
                      try {
                          const res = await api.post('/admin/fix-balances');
                          if (res.data.success) {
                              Alert.alert("Thành công", `Đã sửa xong ${res.data.fixed} tài khoản bị lỗi!`);
                          }
                      } catch (_e) {
                          Alert.alert("Lỗi", "Không thể thực hiện");
                      }
                  }
              }
          ]
      );
  };

  const addItem = () => {
      setAnnouncement({
          ...announcement,
          items: [...announcement.items, { icon: '✨', text: 'Nội dung mới' }]
      });
  };

  const removeItem = (index) => {
      const newItems = announcement.items.filter((_, i) => i !== index);
      setAnnouncement({ ...announcement, items: newItems });
  };

  const updateItem = (index, field, value) => {
      const newItems = [...announcement.items];
      newItems[index][field] = value;
      setAnnouncement({ ...announcement, items: newItems });
  };

  const addTier = () => {
      setMembershipConfig({
          ...membershipConfig,
          tiers: [...membershipConfig.tiers, { name: 'Cấp bậc mới', threshold: 0, discount: 0 }]
      });
  };

  const removeTier = (index) => {
      const newTiers = membershipConfig.tiers.filter((_, i) => i !== index);
      setMembershipConfig({ ...membershipConfig, tiers: newTiers });
  };

  const updateTier = (index, field, value) => {
      const newTiers = [...membershipConfig.tiers];
      if (field === 'threshold' || field === 'discount') {
         // Allow dot or comma parsing if needed, but for now just raw value parsing
         // If user inputs '10' for discount, convert to 0.1 for backend?
         // On web input is 0.1 directly. Let's assume user inputs 0.1 or we handle formatting in UI.
         newTiers[index][field] = value;
      } else {
         newTiers[index][field] = value;
      }
      setMembershipConfig({ ...membershipConfig, tiers: newTiers });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.push('/(admin)/menu')}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cài Đặt Hệ Thống</Text>
        </View>
        <TouchableOpacity 
            style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={saving}
        >
            {saving ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.saveBtnText}>Lưu</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
            
            {/* Announcement Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="megaphone" size={20} color="#a855f7" />
                    <Text style={styles.sectionTitle}>Thông Báo Startup</Text>
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tiêu đề</Text>
                    <TextInput 
                        style={styles.input}
                        value={announcement.title}
                        onChangeText={t => setAnnouncement({...announcement, title: t})}
                        placeholder="Nhập tiêu đề..."
                        placeholderTextColor={colors.subtext}
                    />
                </View>

                <View style={styles.itemsHeader}>
                    <Text style={styles.label}>Nội dung chi tiết</Text>
                    <TouchableOpacity onPress={addItem}>
                        <Text style={styles.addText}>+ Thêm dòng</Text>
                    </TouchableOpacity>
                </View>

                {announcement.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <TextInput 
                            style={styles.iconInput}
                            value={item.icon}
                            onChangeText={t => updateItem(index, 'icon', t)}
                            placeholder="Emoji"
                        />
                        <TextInput 
                            style={styles.textInput}
                            value={item.text}
                            onChangeText={t => updateItem(index, 'text', t)}
                            placeholder="Nội dung..."
                            placeholderTextColor={colors.subtext}
                        />
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => removeItem(index)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* Membership Tiers Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="ribbon" size={20} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Cấp Bậc & Chiết Khấu</Text>
                </View>

                <View style={styles.itemsHeader}>
                    <Text style={styles.label}>Cấu hình cấp bậc</Text>
                    <TouchableOpacity onPress={addTier}>
                        <Text style={[styles.addText, { color: '#3b82f6' }]}>+ Thêm cấp</Text>
                    </TouchableOpacity>
                </View>

                {membershipConfig.tiers.map((tier, index) => (
                    <View key={`tier-${index}`} style={styles.tierCard}>
                        <View style={styles.tierHeader}>
                             <Text style={styles.tierIndex}>Cấp {index + 1}</Text>
                             <TouchableOpacity onPress={() => removeTier(index)}>
                                 <Ionicons name="close-circle" size={24} color="#ef4444" />
                             </TouchableOpacity>
                        </View>
                        
                        <View style={styles.inputGroup}>
                           <Text style={styles.tierLabel}>Tên Cấp Bậc</Text>
                           <TextInput 
                               style={styles.input}
                               value={tier.name}
                               onChangeText={t => updateTier(index, 'name', t)}
                               placeholder="VD: Thành viên"
                               placeholderTextColor={colors.subtext}
                           />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                               <Text style={styles.tierLabel}>Mốc Nạp (VNĐ)</Text>
                               <TextInput 
                                   style={styles.input}
                                   value={String(tier.threshold)}
                                   onChangeText={t => {
                                       const num = t.replace(/[^0-9]/g, '');
                                       updateTier(index, 'threshold', Number(num));
                                   }}
                                   placeholder="0"
                                   keyboardType="numeric"
                               />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                               <Text style={styles.tierLabel}>Chiết Khấu (%)</Text>
                               <TextInput 
                                   style={styles.input}
                                   value={String(tier.discount * 100)} // Store as 0.1, display as 10
                                   onChangeText={t => {
                                       const num = t.replace(/[^0-9.]/g, '');
                                       updateTier(index, 'discount', Number(num) / 100);
                                   }}
                                   placeholder="0"
                                   keyboardType="numeric"
                               />
                            </View>
                        </View>
                        <Text style={styles.tierHint}>
                            Nạp từ {(tier.threshold || 0).toLocaleString()}đ - Giảm {(tier.discount * 100).toFixed(0)}%
                        </Text>
                    </View>
                ))}
            </View>

            {/* Emergency Tools */}
            <View style={[styles.section, { borderColor: '#fee2e2', backgroundColor: '#fef2f2' }]}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="warning" size={20} color="#ef4444" />
                    <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Công Cụ Khẩn Cấp</Text>
                </View>
                <Text style={styles.warningText}>
                    Sử dụng công cụ này để sửa các số dư bị lỗi hiển thị con số quá lớn do lỗi hệ thống cũ.
                </Text>
                <TouchableOpacity style={styles.fixBtn} onPress={handleFixBalances}>
                    <Ionicons name="construct" size={18} color="white" />
                    <Text style={styles.fixBtnText}>Sửa Lỗi Số Dư</Text>
                </TouchableOpacity>
            </View>

            {/* Coming Soon */}
            <View style={[styles.section, { opacity: 0.6 }]}>
                 <View style={styles.sectionHeader}>
                    <Ionicons name="search" size={20} color={colors.subtext} />
                    <Text style={styles.sectionTitle}>Cài Đặt SEO</Text>
                </View>
                <Text style={styles.comingSoonText}>Tính năng đang phát triển...</Text>
            </View>

             <View style={[styles.section, { opacity: 0.6 }]}>
                 <View style={styles.sectionHeader}>
                    <Ionicons name="card" size={20} color={colors.subtext} />
                    <Text style={styles.sectionTitle}>Cài Đặt Thanh Toán</Text>
                </View>
                <Text style={styles.comingSoonText}>Tính năng đang phát triển...</Text>
            </View>

        </ScrollView>
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
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
  },
  headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
  },
  saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: 60,
      alignItems: 'center',
      justifyContent: 'center',
  },
  saveBtnText: {
      color: 'white',
      fontWeight: 'bold',
  },
  content: {
      padding: 20,
      gap: 20,
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  section: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
  },
  sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
  },
  sectionTitle: {
      fontSize: 16,
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
      borderRadius: 10,
      padding: 12,
      color: colors.text,
  },
  itemsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  addText: {
      fontSize: 13,
      fontWeight: 'bold',
      color: colors.primary,
  },
  itemRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
  },
  iconInput: {
      width: 50,
      textAlign: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
  },
  textInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
  },
  deleteBtn: {
      width: 44,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fef2f2',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#fca5a5',
  },
  warningText: {
      fontSize: 13,
      color: '#b91c1c',
      marginBottom: 12,
      lineHeight: 18,
  },
  fixBtn: {
      backgroundColor: '#ef4444',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 12,
      gap: 8,
  },
  fixBtnText: {
      color: 'white',
      fontWeight: 'bold',
  },
  comingSoonText: {
      fontStyle: 'italic',
      color: colors.subtext,
      fontSize: 13,
  },
  tierCard: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
  },
  tierHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
  },
  tierIndex: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.primary,
  },
  tierLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.subtext,
      marginBottom: 6,
  },
  tierHint: {
      fontSize: 11,
      color: colors.subtext,
      fontStyle: 'italic',
      marginTop: -4,
      textAlign: 'right'
  }
});
