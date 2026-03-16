import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, Image, TextInput, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../service/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AdminMissionRequests() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('pending'); // pending | history
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Image Viewer
  const [viewingImage, setViewingImage] = useState(null);

  // Reject Modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const fetchRequests = async () => {
    try {
      const endpoint = activeTab === 'pending' ? '/admin/mission/pending' : '/admin/mission/history';
      const res = await api.get(endpoint);
      if (res.data.success) {
          setRequests(res.data.submissions || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = (id) => {
      Alert.alert(
          "Duyệt nhiệm vụ",
          "Xác nhận duyệt và cộng tiền cho thành viên?",
          [
              { text: "Hủy", style: "cancel" },
              {
                  text: "Duyệt ngay",
                  onPress: async () => {
                      try {
                          const res = await api.post('/admin/mission/approve', { submissionId: id });
                          if (res.data.success) {
                              Alert.alert("Thành công", "Đã duyệt nhiệm vụ");
                              fetchRequests(); // Refresh list
                          } else {
                              Alert.alert("Thất bại", res.data.message);
                          }
                      } catch (_e) {
                          Alert.alert("Lỗi", "Không thể duyệt nhiệm vụ");
                      }
                  }
              }
          ]
      );
  };

  const openRejectModal = (id) => {
      setSelectedRequestId(id);
      setRejectReason('');
      setRejectModalVisible(true);
  };

  const handleReject = async () => {
      if (!rejectReason.trim()) {
          Alert.alert("Thiếu thông tin", "Vui lòng nhập lý do từ chối");
          return;
      }
      
      try {
          const res = await api.post('/admin/mission/reject', { 
              submissionId: selectedRequestId,
              note: rejectReason 
          });
          
          if (res.data.success) {
              setRejectModalVisible(false);
              Alert.alert("Thành công", "Đã từ chối nhiệm vụ");
              fetchRequests();
          } else {
              Alert.alert("Thất bại", res.data.message);
          }
      } catch (_e) {
          Alert.alert("Lỗi", "Không thể từ chối nhiệm vụ");
      }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
             <View style={styles.avatar}>
                 <Text style={styles.avatarText}>{item.userId?.username?.charAt(0).toUpperCase() || 'U'}</Text>
             </View>
             <View>
                 <Text style={styles.username}>{item.userId?.username || 'Unknown User'}</Text>
                 <Text style={styles.time}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
             </View>
        </View>
        <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>+{item.missionId?.reward?.toLocaleString()} đ</Text>
        </View>
      </View>

      <View style={styles.missionInfo}>
          <Text style={styles.missionLabel}>Nhiệm vụ:</Text>
          <Text style={styles.missionTitle} numberOfLines={1}>{item.missionId?.title || 'Nhiệm vụ đã xóa'}</Text>
      </View>

      <View style={styles.proofSection}>
          <Text style={styles.proofLabel}>Bằng chứng:</Text>
          <TouchableOpacity onPress={() => setViewingImage(item.imageProof)}>
              <Image 
                source={{ uri: item.imageProof }} 
                style={styles.proofThumb} 
                resizeMode="cover"
              />
              <View style={styles.zoomOverlay}>
                  <Ionicons name="scan-outline" size={16} color="white" />
              </View>
          </TouchableOpacity>
      </View>

      {activeTab === 'pending' ? (
          <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => openRejectModal(item._id)}>
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                  <Text style={[styles.btnText, { color: '#ef4444' }]}>Từ Chối</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleApprove(item._id)}>
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
                       {item.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                   </Text>
               </View>
               {item.adminNote && (
                   <Text style={styles.noteText} numberOfLines={1}>Lý do: {item.adminNote}</Text>
               )}
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
            <Text style={styles.headerTitle}>Duyệt Nhiệm Vụ</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]} 
            onPress={() => setActiveTab('pending')}
          >
              <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Chờ Duyệt</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
            onPress={() => setActiveTab('history')}
          >
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Lịch Sử</Text>
          </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList 
            data={requests}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="file-tray-outline" size={64} color={colors.border} />
                    <Text style={styles.emptyText}>
                        {activeTab === 'pending' ? 'Không có yêu cầu nào' : 'Chưa có lịch sử'}
                    </Text>
                </View>
            }
        />
      )}

      {/* Image Viewer Modal */}
      <Modal visible={!!viewingImage} transparent animationType="fade">
          <View style={styles.imageModal}>
              <TouchableOpacity style={styles.closeImageBtn} onPress={() => setViewingImage(null)}>
                  <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              {viewingImage && (
                  <Image 
                    source={{ uri: viewingImage }} 
                    style={styles.fullImage} 
                    resizeMode="contain"
                  />
              )}
          </View>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Từ chối nhiệm vụ</Text>
                  <Text style={styles.label}>Lý do từ chối:</Text>
                  <TextInput 
                      style={styles.input}
                      placeholder="VD: Ảnh không rõ, sai nhiệm vụ..."
                      placeholderTextColor={colors.subtext}
                      value={rejectReason}
                      onChangeText={setRejectReason}
                      autoFocus
                  />
                  <View style={styles.modalActions}>
                      <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => setRejectModalVisible(false)}>
                          <Text style={styles.modalBtnText}>Hủy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.modalBtn, styles.btnConfirmReject]} onPress={handleReject}>
                          <Text style={[styles.modalBtnText, { color: 'white' }]}>Từ Chối</Text>
                      </TouchableOpacity>
                  </View>
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
      alignItems: 'center',
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
  rewardBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: '#f0fdf4',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#bbf7d0',
  },
  rewardText: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#15803d',
  },
  missionInfo: {
      marginBottom: 12,
  },
  missionLabel: {
      fontSize: 12,
      color: colors.subtext,
      marginBottom: 2,
  },
  missionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
  },
  proofSection: {
      marginBottom: 16,
  },
  proofLabel: {
      fontSize: 12,
      color: colors.subtext,
      marginBottom: 6,
  },
  proofThumb: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
  },
  zoomOverlay: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
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
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
  },
  statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      gap: 6,
  },
  statusText: {
      fontSize: 13,
      fontWeight: 'bold',
  },
  noteText: {
      fontSize: 12,
      color: colors.subtext,
      flex: 1,
      textAlign: 'right',
      marginLeft: 12,
      fontStyle: 'italic',
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
  // Image Modal
  imageModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  closeImageBtn: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      padding: 10,
  },
  fullImage: {
      width: width,
      height: height * 0.8,
  },
  // Reject Modal
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      padding: 24,
  },
  modalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
  },
  label: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
  },
  input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      color: colors.text,
      marginBottom: 20,
  },
  modalActions: {
      flexDirection: 'row',
      gap: 12,
  },
  modalBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
  },
  btnCancel: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
  },
  btnConfirmReject: {
      backgroundColor: '#ef4444',
  },
  modalBtnText: {
      fontWeight: 'bold',
      color: colors.text,
  },
});
