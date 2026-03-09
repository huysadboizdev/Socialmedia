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

const MissionTimer = ({ clickedAt, onExpire, styles }) => {
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!clickedAt) return 0;
        const deadline = new Date(clickedAt).getTime() + 3 * 60 * 1000;
        return Math.max(0, deadline - Date.now());
    });

    useEffect(() => {
        if (!clickedAt) return;
        const deadline = new Date(clickedAt).getTime() + 3 * 60 * 1000;
        const timer = setInterval(() => {
            const remaining = Math.max(0, deadline - Date.now());
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
                if (onExpire) onExpire();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [clickedAt, onExpire]);

    if (!clickedAt) return null;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const isUrgent = minutes === 0 && seconds < 30;

    return (
        <View style={[styles.timerContainer, isUrgent ? styles.timerUrgent : styles.timerNormal]}>
            <Ionicons name="timer-outline" size={16} color={isUrgent ? 'white' : '#ea580c'} />
            <Text style={[styles.timerText, isUrgent ? { color: 'white' } : { color: '#ea580c' }]}>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </Text>
        </View>
    );
};

export default function Missions() {
  const { user, refreshUser } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // list, received
  const [submitting, setSubmitting] = useState(false);
  const [focusedMissionId, setFocusedMissionId] = useState(null);
  
  // Withdrawal State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('web'); // 'web' or 'bank'
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [email, setEmail] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState(null);

  // Instruction Modal State
  const [showInstruction, setShowInstruction] = useState(false);
  const [instructionMission, setInstructionMission] = useState(null);

  const pickQrCode = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Cần quyền truy cập ảnh để tải lên QR');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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

  const clearFocus = () => {
      setFocusedMissionId(null);
  };

  const handleLinkClick = async (mission) => {
    try {
      const res = await api.post('/user/mission/click', { missionId: mission._id });
      if (res.data.success) {
          const supported = await Linking.canOpenURL(mission.link);
          if (supported) {
              await Linking.openURL(mission.link);
          } else {
              Alert.alert('Lỗi', 'Không thể mở liên kết này trên thiết bị của bạn: ' + mission.link);
          }
          setFocusedMissionId(mission._id);
          fetchMissions(); // Refresh for clickedAt
      } else {
          Alert.alert('Lỗi', res.data.message || 'Lỗi khi ghi nhận click');
      }
    } catch (error) {
       console.log("Click error", error);
       try {
           const supported = await Linking.canOpenURL(mission.link);
           if (supported) {
               await Linking.openURL(mission.link);
           }
       } catch (err) {
           console.log("Linking error fallback", err);
       }
    }
  };

  const handleAccept = async (missionId) => {
    try {
        const res = await api.post('/user/mission/accept', { missionId });
        if (res.data.success) {
            Alert.alert('Thành công', 'Đã nhận nhiệm vụ!');
            setShowInstruction(false); // Close modal
            fetchMissions();
            setActiveTab('received');
        } else {
            Alert.alert('Lỗi', res.data.message);
        }
    } catch (_e) {
        Alert.alert('Lỗi', 'Không thể nhận nhiệm vụ');
    }
  };

  const pickImage = async (missionId) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Rất tiếc, chúng tôi cần quyền truy cập thư viện ảnh để tải lên bằng chứng!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
              clearFocus();
              fetchMissions();
              // Refresh user balance if context provides a refresh function
              if (typeof refreshUser === 'function') refreshUser();
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
        if (!bankName || !bankAccount) {
            Alert.alert('Lỗi', 'Vui lòng điền tên ngân hàng và số tài khoản');
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
                formData.append('email', email);
            }
            if (qrCodeImage) {
                 const uriParts = qrCodeImage.uri.split('.');
                 const fileType = uriParts[uriParts.length - 1];
                 formData.append('qrCode', {
                    uri: qrCodeImage.uri,
                    name: `qrcode.${fileType}`,
                    type: `image/${fileType}`,
                });
            }
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
            fetchMissions(); // Update balance
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
            fetchMissions();
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

  const activeMission = missions.find(m => m._id === focusedMissionId);

  const allFilteredMissions = activeTab === 'list' 
    ? missions.filter(m => m.status === 'available')
    : missions.filter(m => m.status !== 'available');

  const filteredMissions = focusedMissionId 
    ? (activeMission ? [activeMission] : allFilteredMissions)
    : allFilteredMissions;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={nhiemvuGif} style={{ width: 32, height: 32 }} resizeMode="contain" />
            <Text style={styles.headerTitle}>Nhiệm vụ</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 8}}>
            <TouchableOpacity 
                style={[styles.withdrawBtn, {backgroundColor: 'white', borderWidth: 1, borderColor: colors.border}]} 
                onPress={() => {
                   setInstructionMission(null);
                   setShowInstruction(true);
                }}
            >
                <Ionicons name="book-outline" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdraw(true)}>
                <Ionicons name="wallet-outline" size={20} color="white" />
                <Text style={styles.withdrawText}>{(user?.missionBalance || 0).toLocaleString()} đ</Text>
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        
        {/* Attendance Banner */}
        {!focusedMissionId && (
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
        )}

        {!focusedMissionId && (
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
        )}

        {/* Focused Header */}
        {focusedMissionId && (
             <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                 <TouchableOpacity onPress={clearFocus} style={{flexDirection: 'row', alignItems: 'center'}}>
                     <Ionicons name="arrow-back" size={24} color={colors.primary} />
                     <Text style={{color: colors.primary, fontWeight: 'bold', marginLeft: 4}}>Quay lại</Text>
                 </TouchableOpacity>

                 <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
                     <MissionTimer 
                        clickedAt={activeMission?.clickedAt} 
                        styles={styles}
                        onExpire={() => {
                            Alert.alert("Hết hạn", "Nhiệm vụ đã hết thời gian làm.");
                            fetchMissions();
                        }} 
                     />
                     <View style={styles.doingBadge}>
                        <View style={styles.doingDot} />
                        <Text style={styles.doingText}>ĐANG LÀM</Text>
                     </View>
                 </View>
             </View>
        )}

        {loading ? (
             <ActivityIndicator color={colors.primary} size="large" />
        ) : filteredMissions.length === 0 ? (
             <Text style={styles.emptyText}>Không có nhiệm vụ nào.</Text>
        ) : (
             filteredMissions.map(mission => {
                 const isExpired = mission.clickedAt && mission.status !== 'approved' && mission.status !== 'pending' && 
                              (Date.now() - new Date(mission.clickedAt).getTime() > 3 * 60 * 1000);
                 
                 return (
                 <View key={mission._id} style={[
                     styles.card,
                     focusedMissionId === mission._id && { borderColor: '#ef4444', borderWidth: 1 }
                 ]}>
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
                         {mission.status !== 'available' && !isExpired && (
                             <TouchableOpacity onPress={() => handleLinkClick(mission)}>
                                <Text style={{color: '#3b82f6', fontSize: 12, textDecorationLine: 'underline'}}>Link nhiệm vụ</Text>
                             </TouchableOpacity>
                         )}
                     </View>
                     
                     <View style={styles.actions}>
                         {/* EXPIRED */}
                         {isExpired && (
                             <View style={[styles.statusTag, {backgroundColor: '#fef2f2', borderColor: '#fca5a5'}]}>
                                 <Ionicons name="close-circle" size={14} color="#b91c1c" />
                                 <Text style={{color: '#b91c1c', fontSize: 10, fontWeight: 'bold'}}>Thất bại</Text>
                             </View>
                         )}

                         {/* AVAILABLE */}
                         {!isExpired && mission.status === 'available' && (
                             <TouchableOpacity 
                                style={styles.actionBtn}
                                onPress={() => {
                                    setInstructionMission(mission);
                                    setShowInstruction(true);
                                }}
                             >
                                 <Ionicons name="add-circle-outline" size={16} color="white" style={{marginRight: 4}}/>
                                 <Text style={styles.actionBtnText}>Nhận</Text>
                             </TouchableOpacity>
                         )}

                         {/* ACCEPTED / REJECTED */}
                         {!isExpired && (mission.status === 'accepted' || mission.status === 'rejected') && (
                             <View style={{ gap: 8, alignItems: 'flex-end' }}>
                                 <View style={{flexDirection: 'row', gap: 6}}>
                                     <TouchableOpacity 
                                        style={[styles.actionBtn, { backgroundColor: colors.secondary, paddingHorizontal: 12 }]}
                                        onPress={() => handleLinkClick(mission)}
                                     >
                                         <Ionicons name="open-outline" size={16} color="white" />
                                     </TouchableOpacity>
                                     <TouchableOpacity 
                                        style={[styles.actionBtn, { paddingHorizontal: 12, backgroundColor: '#f3e8ff' }]}
                                        onPress={() => {
                                             setInstructionMission(mission);
                                             setShowInstruction(true);
                                        }}
                                     >
                                         <Ionicons name="book" size={16} color={colors.primary} />
                                     </TouchableOpacity>
                                 </View>
                                 
                                 <TouchableOpacity 
                                    style={[styles.actionBtn, {width: '100%'}]}
                                    onPress={() => pickImage(mission._id)}
                                    disabled={submitting}
                                 >
                                     {submitting ? <ActivityIndicator size="small" color="white"/> : (
                                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                                            <Ionicons name="cloud-upload-outline" size={16} color="white" />
                                            <Text style={styles.actionBtnText}>Gửi ảnh</Text>
                                        </View>
                                     )}
                                 </TouchableOpacity>
                             </View>
                         )}

                         {/* PENDING */}
                         {!isExpired && mission.status === 'pending' && (
                             <View style={[styles.statusTag, {backgroundColor: '#fefce8', borderColor: '#fde047'}]}>
                                 <Ionicons name="hourglass-outline" size={14} color="#a16207" />
                                 <Text style={{color: '#a16207', fontSize: 10, fontWeight: 'bold'}}>Chờ duyệt 24h</Text>
                             </View>
                         )}

                         {/* APPROVED */}
                         {mission.status === 'approved' && (
                             <View style={[styles.statusTag, {backgroundColor: '#f0fdf4', borderColor: '#86efac'}]}>
                                 <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                                 <Text style={{color: '#15803d', fontSize: 10, fontWeight: 'bold'}}>Đã xong</Text>
                             </View>
                         )}

                         {!isExpired && mission.status === 'rejected' && (
                            <Text style={{color: '#ef4444', fontSize: 10, fontWeight: 'bold', marginTop: 4, textAlign: 'center'}}>Bị từ chối</Text>
                         )}
                     </View>
                 </View>
             )})
        )}
      </ScrollView>

      {/* Instruction Modal */}
      <Modal visible={showInstruction} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.container, {backgroundColor: colors.background}]}>
              <View style={styles.header}>
                  <Text style={styles.headerTitle}>Hướng dẫn làm nhiệm vụ</Text>
                  <TouchableOpacity onPress={() => setShowInstruction(false)}>
                      <Ionicons name="close-circle" size={28} color={colors.text} />
                  </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{padding: 20}}>
                  <View style={styles.stepCard}>
                      <View style={styles.stepIndex}><Text style={styles.stepIndexText}>1</Text></View>
                      <View style={{flex: 1}}>
                          <Text style={[styles.stepTitle, {color: colors.text}]}>Truy cập liên kết</Text>
                          <Text style={[styles.stepDesc, {color: colors.subtext}]}>
                              Nhấn vào nút <Text style={{fontWeight: 'bold', color: colors.primary}}>"Link nhiệm vụ"</Text> hoặc <Text style={{fontWeight: 'bold', color: colors.primary}}>"Thực hiện"</Text> để mở trang web/ứng dụng cần tương tác.
                              (Sẽ mở ứng dụng Facebook/TikTok/.. theo yêu cầu).
                          </Text>
                      </View>
                  </View>

                  <View style={styles.stepCard}>
                      <View style={styles.stepIndex}><Text style={styles.stepIndexText}>2</Text></View>
                      <View style={{flex: 1}}>
                          <Text style={[styles.stepTitle, {color: colors.text}]}>Thực hiện tương tác</Text>
                          <Text style={[styles.stepDesc, {color: colors.subtext}]}>
                              Thực hiện đúng yêu cầu: <Text style={{fontWeight: 'bold', color: '#3b82f6'}}>Like</Text>, <Text style={{fontWeight: 'bold', color: '#db2777'}}>Follow</Text>, hoặc <Text style={{fontWeight: 'bold', color: '#7c3aed'}}>Share</Text> bài viết/trang cá nhân đó.
                          </Text>
                      </View>
                  </View>

                  <View style={styles.stepCard}>
                      <View style={styles.stepIndex}><Text style={styles.stepIndexText}>3</Text></View>
                      <View style={{flex: 1}}>
                          <Text style={[styles.stepTitle, {color: colors.text}]}>Chụp ảnh bằng chứng</Text>
                          <Text style={[styles.stepDesc, {color: colors.subtext}]}>
                               Chụp màn hình điện thoại.
                               {'\n'}- Phải thấy rõ <Text style={{color: '#ef4444', fontWeight: 'bold'}}>thanh trạng thái</Text> trên cùng (giờ, pin, sóng).
                               {'\n'}- <Text style={{fontWeight: 'bold'}}>KHÔNG</Text> tải ảnh đã cắt (crop).
                               {'\n'}- Ảnh phải chụp toàn bộ giao diện ứng dụng.
                          </Text>
                      </View>
                  </View>

                  <View style={[styles.stepCard, {backgroundColor: '#fef2f2', borderColor: '#fee2e2'}]}>
                      <View style={{flex: 1}}>
                          <Text style={[styles.stepTitle, {color: '#ef4444', flexDirection: 'row', alignItems: 'center', gap: 8}]}>
                              <Ionicons name="warning" size={18} color="#ef4444"/> Lưu ý quan trọng
                          </Text>
                          <Text style={[styles.stepDesc, {color: '#b91c1c'}]}>
                              - Không dùng ảnh cũ hoặc ảnh mạng. {'\n'}
                              - Thời gian nộp bài phải trùng khớp với thời gian chụp. {'\n'}
                              - Nếu phát hiện gian lận sẽ bị khóa tài khoản vĩnh viễn. {'\n'}
                              - Mỗi nhiệm vụ có thời hạn 3 phút.
                          </Text>
                      </View>
                  </View>

                  <View style={{flexDirection: 'row', gap: 12, marginTop: 24}}>
                      <TouchableOpacity 
                        style={[styles.confirmBtn, {backgroundColor: colors.secondary, flex: 1}]}
                        onPress={() => setShowInstruction(false)}
                      >
                          <Text style={[styles.confirmText, {color: colors.text}]}>
                              {instructionMission && instructionMission.status === 'available' ? 'Hủy bỏ' : 'Đóng'}
                          </Text>
                      </TouchableOpacity>

                      {instructionMission && instructionMission.status === 'available' && (
                          <TouchableOpacity 
                            style={[styles.confirmBtn, {flex: 1}]}
                            onPress={() => handleAccept(instructionMission._id)}
                          >
                              <Text style={styles.confirmText}>Đồng ý và Tiếp tục</Text>
                          </TouchableOpacity>
                      )}
                  </View>
              </ScrollView>
          </View>
      </Modal>

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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
  },
  timerNormal: {
    backgroundColor: '#ffedd5',
    borderColor: '#fed7aa',
  },
  timerUrgent: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  timerText: {
    fontWeight: 'bold',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  doingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fee2e2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  doingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  doingText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 10,
  },
  stepCard: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndexText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  stepPlaceholder: {
      height: 150,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 48,
      marginBottom: 24,
  }
});
