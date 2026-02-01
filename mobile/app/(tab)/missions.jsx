import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Modal, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../service/userService';
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';

// Assets
import nhiemvuGif from '../../assets/nhiemvu.gif';

export default function Missions() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
  const [email, setEmail] = useState(''); // Added email state
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
          const uriParts = asset.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];

          formData.append('imageProof', {
            uri: asset.uri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
          });

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
            if (email) {
                formData.append('email', email); // Include email
            }
            
            const uriParts = qrCodeImage.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('qrCode', { // Corrected field name
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
            setEmail('');
            setQrCodeImage(null);
            fetchMissions();
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
            fetchMissions(); // Indirectly refresh
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={nhiemvuGif} style={{ width: 32, height: 32 }} resizeMode="contain" />
            <Text style={styles.headerTitle}>Nhiệm vụ</Text>
        </View>
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
             <ActivityIndicator color={colors.primary} size="large" />
        ) : filteredMissions.length === 0 ? (
             <Text style={styles.emptyText}>Không có nhiệm vụ nào.</Text>
        ) : (
             filteredMissions.map(mission => (
                 <View key={mission._id} style={styles.card}>
                     <View style={styles.cardIcon}>
                         <Ionicons 
                            name={mission.type === 'like' ? 'thumbs-up' : mission.type === 'follow' ? 'person-add' : 'share-social'} 
                            size={24} 
                            color={colors.primary} 
                         />
                     </View>
                     <View style={styles.cardContent}>
                         <Text style={styles.cardTitle}>{mission.title}</Text>
                         <Text style={styles.cardReward}>+{mission.reward?.toLocaleString()} đ</Text>
                         {mission.status !== 'available' && (
                             <Text style={[
                                 styles.statusBadge, 
                                 mission.status === 'approved' ? { color: colors.success } :
                                 mission.status === 'rejected' ? { color: colors.danger } :
                                 { color: colors.warning }
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
                                    style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
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
                              placeholderTextColor={colors.subtext}
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
                              placeholderTextColor={colors.subtext}
                              keyboardType="numeric"
                          />
                          <TextInput 
                              style={styles.input}
                              value={bankName}
                              onChangeText={setBankName}
                              placeholder="Tên ngân hàng (VD: MBBank)"
                              placeholderTextColor={colors.subtext}
                          />
                          <TextInput 
                              style={styles.input}
                              value={bankAccount}
                              onChangeText={setBankAccount}
                              placeholder="Số tài khoản"
                              placeholderTextColor={colors.subtext}
                              keyboardType="numeric"
                          />
                           <TextInput 
                              style={styles.input}
                              value={email}
                              onChangeText={setEmail}
                              placeholder="Email nhận thông báo"
                              placeholderTextColor={colors.subtext}
                              keyboardType="email-address"
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

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
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
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.subtext,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text,
  },
  list: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  emptyText: {
    color: colors.subtext,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardReward: {
    color: colors.success, // green-500
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSub: {
    color: colors.subtext,
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
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
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
  methodTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
  },
  methodTabText: {
    color: colors.subtext,
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
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 20,
  },
  uploadBtnText: {
    color: colors.subtext,
    fontWeight: '500',
  },
  attendanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card, // zinc-900
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  attendanceTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  attendanceSub: {
    color: colors.subtext,
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
