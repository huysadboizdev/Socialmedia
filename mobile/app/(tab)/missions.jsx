import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../service/userService';
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';

export default function Missions() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // list, received
  const [submitting, setSubmitting] = useState(false);
  
  // Withdrawal State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('web'); // 'web' or 'bank'
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState(null);

  const pickQrCode = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Cần quyền truy cập ảnh để tải lên QR');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setQrCodeImage(result.assets[0]);
    }
  };
  
  


  useEffect(() => {
    fetchMissions();
  }, [activeTab]);

  const fetchMissions = async () => {
    try {
        const res = await api.get('/user/missions');
        if (res.data.success) {
            setMissions(res.data.missions);
        }
    } catch (e) {
        console.log("Fetch missions error", e);
    } finally {
        setLoading(false);
    }
  };

  const handleAccept = async (missionId) => {
    try {
        const res = await api.post('/user/mission/accept', { missionId });
        if (res.data.success) {
            Alert.alert('Thành công', 'Đã nhận nhiệm vụ!');
            fetchMissions();
            setActiveTab('received');
        } else {
            Alert.alert('Lỗi', res.data.message);
        }
    } catch (e) {
        Alert.alert('Lỗi', 'Không thể nhận nhiệm vụ');
    }
  };

  const handleDoMission = async (mission) => {
    try {
         // Record click
         await api.post('/user/mission/click', { missionId: mission._id });
         // Open Link
         Linking.openURL(mission.link);
    } catch (e) {
        console.log("Click error", e);
        Linking.openURL(mission.link); // Try opening anyway
    }
  };

  const pickImage = async (missionId) => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Rất tiếc, chúng tôi cần quyền truy cập thư viện ảnh để tải lên bằng chứng!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadProof(missionId, result.assets[0]);
    }
  };

  const uploadProof = async (missionId, asset) => {
      setSubmitting(true);
      try {
          const formData = new FormData();
          formData.append('missionId', missionId);
          
          // Append image
          // React Native FormData expects specific object shape for files
          const uriParts = asset.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];

          formData.append('imageProof', {
            uri: asset.uri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
          });

          // Upload requires multipart/form-data
          // userService api instance sets Content-Type to application/json by default
          // We need to override it for this request
          const res = await api.post('/user/mission/submit', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });

          if (res.data.success) {
              Alert.alert('Thành công', 'Đã gửi bằng chứng thành công!');
              fetchMissions();
          } else {
              Alert.alert('Lỗi', res.data.message);
          }
      } catch (e) {
          Alert.alert('Lỗi', 'Tải lên thất bại');
          console.log(e);
      } finally {
          setSubmitting(false);
      }
  };



  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 10000) {
        Alert.alert('Lỗi', 'Số tiền rút tối thiểu là 10.000 VND');
        return;
    }

    if (withdrawMethod === 'bank') {
        if (!bankName || !bankAccount || !qrCodeImage) {
            Alert.alert('Lỗi', 'Vui lòng điền tên ngân hàng, số tài khoản và tải ảnh QR');
            return;
        }
    }
    
    setSubmitting(true);
    try {
        const formData = new FormData();
        formData.append('amount', amount);
        formData.append('method', withdrawMethod);
        
        if (withdrawMethod === 'bank') {
            formData.append('bankName', bankName);
            formData.append('bankAccount', bankAccount);
            
            const uriParts = qrCodeImage.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('qrCodeFile', {
                uri: qrCodeImage.uri,
                name: `qrcode.${fileType}`,
                type: `image/${fileType}`,
            });
        }

        const res = await api.post('/user/mission/withdraw', formData, {
            headers: { 'Content-Type': 'multipart/form-data' } 
        });

        if (res.data.success) {
            Alert.alert('Thành công', withdrawMethod === 'web' ? 'Đã rút về số dư chính!' : 'Yêu cầu rút tiền đang chờ duyệt!');
            setShowWithdraw(false);
            setWithdrawAmount('');
            setBankName('');
            setBankAccount('');
            setQrCodeImage(null);
            // Reload user info if needed
            fetchMissions(); // Indirectly refreshes data if needed or trigger global refresh
        } else {
             Alert.alert('Lỗi', res.data.message);
        }
    } catch (e) {
        Alert.alert('Lỗi', 'Rút tiền thất bại');
        console.log(e);
    } finally {
        setSubmitting(false);
    }
  };

  const handleAttendance = async () => {
    try {
        setLoading(true);
        const res = await api.post('/user/attendance');
        if (res.data.success) {
            Alert.alert('Điểm danh', res.data.message);
            // Refresh user info to update balance/streak
            const { getUserInfo } = require('../../service/userService'); 
            // Note: best to expose refreshUser from AuthContext, but for now we rely on simple state update or app reload
            // Actually, let's try to update missions or balance if we can. 
            // Ideally AuthContext should provide a way to reload user.
            // For now, we just fetch missions again which triggers a re-render maybe
        } else {
             Alert.alert('Thông báo', res.data.message);
        }
    } catch (e) {
        Alert.alert('Lỗi', 'Điểm danh thất bại');
        console.log(e);
    } finally {
        setLoading(false);
    }
  };

  const filteredMissions = activeTab === 'list' 
    ? missions.filter(m => m.status === 'available')
    : missions.filter(m => m.status !== 'available');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhiệm vụ</Text>
        <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdraw(true)}>
             <Ionicons name="wallet-outline" size={20} color="white" />
             <Text style={styles.withdrawText}>{(user?.missionBalance || 0).toLocaleString()} đ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        
        {/* Attendance Banner */}
        <View style={styles.attendanceCard}>
             <View>
                 <Text style={styles.attendanceTitle}>Điểm danh hàng ngày</Text>
                 <Text style={styles.attendanceSub}>
                    Chuỗi: <Text style={{color: '#f97316', fontWeight: 'bold'}}>{user?.attendance?.streak || 0} ngày</Text>
                 </Text>
             </View>
             <TouchableOpacity style={styles.attendanceBtn} onPress={handleAttendance}>
                 <Text style={styles.attendanceBtnText}>Điểm danh</Text>
             </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
           <TouchableOpacity 
              style={[styles.tab, activeTab === 'list' && styles.activeTab]}
              onPress={() => setActiveTab('list')}
           >
               <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>Có sẵn</Text>
           </TouchableOpacity>
           <TouchableOpacity 
              style={[styles.tab, activeTab === 'received' && styles.activeTab]}
              onPress={() => setActiveTab('received')}
           >
               <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>Của tôi</Text>
           </TouchableOpacity>
        </View>
        {loading ? (
             <ActivityIndicator color="#8b5cf6" size="large" />
        ) : filteredMissions.length === 0 ? (
             <Text style={styles.emptyText}>Không có nhiệm vụ nào.</Text>
        ) : (
             filteredMissions.map(mission => (
                 <View key={mission._id} style={styles.card}>
                     <View style={styles.cardIcon}>
                         <Ionicons 
                            name={mission.type === 'like' ? 'thumbs-up' : mission.type === 'follow' ? 'person-add' : 'share-social'} 
                            size={24} 
                            color="#8b5cf6" 
                         />
                     </View>
                     <View style={styles.cardContent}>
                         <Text style={styles.cardTitle}>{mission.title}</Text>
                         <Text style={styles.cardReward}>+{mission.reward?.toLocaleString()} đ</Text>
                         {mission.status !== 'available' && (
                             <Text style={[
                                 styles.statusBadge, 
                                 mission.status === 'approved' ? { color: '#10b981' } :
                                 mission.status === 'rejected' ? { color: '#ef4444' } :
                                 { color: '#f59e0b' }
                             ]}>
                                 {mission.status.toUpperCase()}
                             </Text>
                         )}
                     </View>
                     
                     <View style={styles.actions}>
                         {mission.status === 'available' && (
                             <TouchableOpacity 
                                style={styles.actionBtn}
                                onPress={() => handleAccept(mission._id)}
                             >
                                 <Text style={styles.actionBtnText}>Nhận</Text>
                             </TouchableOpacity>
                         )}

                         {(mission.status === 'accepted' || mission.status === 'rejected') && (
                             <View style={{ gap: 8 }}>
                                 <TouchableOpacity 
                                    style={[styles.actionBtn, { backgroundColor: '#3f3f46' }]}
                                    onPress={() => handleDoMission(mission)}
                                 >
                                     <Text style={styles.actionBtnText}>Thực hiện</Text>
                                 </TouchableOpacity>
                                 <TouchableOpacity 
                                    style={styles.actionBtn}
                                    onPress={() => pickImage(mission._id)}
                                    disabled={submitting}
                                 >
                                     {submitting ? <ActivityIndicator size="small" color="white"/> : <Text style={styles.actionBtnText}>Gửi duyệt</Text>}
                                 </TouchableOpacity>
                             </View>
                         )}
                     </View>
                 </View>
             ))
        )}
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={showWithdraw} transparent animationType="slide">
          <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Rút tiền về ví</Text>
                  
                  {/* Withdrawal Method Tabs */}
                  <View style={styles.methodTabs}>
                      <TouchableOpacity 
                          style={[styles.methodTab, withdrawMethod === 'web' && styles.activeMethodTab]}
                          onPress={() => setWithdrawMethod('web')}
                      >
                          <Text style={[styles.methodTabText, withdrawMethod === 'web' && styles.activeMethodTabText]}>Ví Web</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          style={[styles.methodTab, withdrawMethod === 'bank' && styles.activeMethodTab]}
                          onPress={() => setWithdrawMethod('bank')}
                      >
                          <Text style={[styles.methodTabText, withdrawMethod === 'bank' && styles.activeMethodTabText]}>Ngân hàng</Text>
                      </TouchableOpacity>
                  </View>

                  {withdrawMethod === 'web' ? (
                      <View>
                          <Text style={styles.modalSub}>Chuyển tiền từ nhiệm vụ sang số dư chính (Miễn phí).</Text>
                          <TextInput 
                              style={styles.input}
                              value={withdrawAmount}
                              onChangeText={setWithdrawAmount}
                              placeholder="Số tiền (tối thiểu 10.000)"
                              placeholderTextColor="#71717a"
                              keyboardType="numeric"
                          />
                      </View>
                  ) : (
                      <ScrollView style={{ maxHeight: 300 }}>
                          <Text style={styles.modalSub}>Rút về ngân hàng (Phí 20%).</Text>
                          <TextInput 
                              style={styles.input}
                              value={withdrawAmount}
                              onChangeText={setWithdrawAmount}
                              placeholder="Số tiền (tối thiểu 10.000)"
                              placeholderTextColor="#71717a"
                              keyboardType="numeric"
                          />
                          <TextInput 
                              style={styles.input}
                              value={bankName}
                              onChangeText={setBankName}
                              placeholder="Tên ngân hàng (VD: MBBank)"
                              placeholderTextColor="#71717a"
                          />
                          <TextInput 
                              style={styles.input}
                              value={bankAccount}
                              onChangeText={setBankAccount}
                              placeholder="Số tài khoản"
                              placeholderTextColor="#71717a"
                              keyboardType="numeric"
                          />
                           <TouchableOpacity style={styles.uploadBtn} onPress={pickQrCode}>
                              <Ionicons name="qr-code-outline" size={20} color="white" />
                              <Text style={styles.uploadBtnText}>
                                  {qrCodeImage ? 'Đã chọn ảnh QR' : 'Tải lên QR nhận tiền'}
                              </Text>
                          </TouchableOpacity>
                      </ScrollView>
                  )}

                  <View style={styles.modalActions}>
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowWithdraw(false); setQrCodeImage(null); }}>
                          <Text style={styles.cancelText}>Hủy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.confirmBtn} 
                        onPress={handleWithdraw}
                        disabled={submitting}
                      >
                           {submitting ? <ActivityIndicator color="white"/> : <Text style={styles.confirmText}>Xác nhận</Text>}
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  withdrawText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    marginRight: 20,
    paddingBottom: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#8b5cf6',
  },
  tabText: {
    color: '#71717a',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  list: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  emptyText: {
    color: '#71717a',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardReward: {
    color: '#10b981', // green-500
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actions: {
    // 
  },
  actionBtn: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSub: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#27272a',
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
  methodTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#09090b',
    borderRadius: 8,
    padding: 4,
  },
  methodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeMethodTab: {
    backgroundColor: '#8b5cf6',
  },
  methodTabText: {
    color: '#71717a',
    fontWeight: '600',
  },
  activeMethodTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 20,
  },
  uploadBtnText: {
    color: '#a1a1aa',
    fontWeight: '500',
  },
  attendanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18181b', // zinc-900
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 20,
  },
  attendanceTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  attendanceSub: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  attendanceBtn: {
    backgroundColor: '#f97316', // orange-500
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  attendanceBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
