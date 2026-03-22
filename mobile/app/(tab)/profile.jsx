import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import api from '../../service/userService';

// Assets
import lichsuGif from '../../assets/lichsugd.gif';
import allGif from '../../assets/alll_list.gif';
import supportGif from '../../assets/supportusser.gif';
import dieukhoanGif from '../../assets/dieukhoan.gif';
import { generate2FA, verifySetup2FA, disable2FA } from '../../service/userService';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, colors } = useTheme();
  const router = useRouter();
  const styles = getStyles(colors);
  
  const [activeTab, setActiveTab] = useState('info'); // info, 2fa, password
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(user);
  
  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  
  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 2FA States
  const [isPendingEmail, setIsPendingEmail] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  useEffect(() => {
    if (user) {
        setUserData(user);
        setFullName(user.fullName || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append("fullName", fullName);

        const res = await api.put('/user/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        if (res.data.success) {
            Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
            setUserData(prev => ({ ...prev, fullName }));
        } else {
            Alert.alert('Lỗi', res.data.message || 'Cập nhật thất bại');
        }
    } catch (e) {
        Alert.alert('Lỗi', e.response?.data?.message || 'Không thể cập nhật hồ sơ');
    } finally {
        setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
        return;
    }
    setLoading(true);
    try {
        const res = await api.put('/user/password', {
             oldPassword: currentPassword,
             newPassword1: newPassword,
             newPassword2: confirmPassword
        });

        if (res.data.success) {
             Alert.alert('Thành công', 'Đổi mật khẩu thành công');
             setCurrentPassword('');
             setNewPassword('');
             setConfirmPassword('');
        } else {
             Alert.alert('Lỗi', res.data.message || 'Mật khẩu hiện tại không đúng');
        }
    } catch (e) {
        Alert.alert('Lỗi', e.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
        setLoading(false);
    }
  };

  const handleGenerate2FA = async (method) => {
    setLoading(true);
    try {
        const res = await generate2FA(method);
        if (res.success) {
            setIsPendingEmail(true);
            Alert.alert('Thành công', res.message);
        } else {
            Alert.alert('Lỗi', res.message || "Lỗi tạo 2FA");
        }
    } catch (error) {
        Alert.alert('Lỗi', error.message || "Lỗi tạo 2FA");
    } finally {
        setLoading(false);
    }
  };

  const handleVerifySetup2FA = async () => {
    if (!verifyCode) return Alert.alert('Lỗi', "Vui lòng nhập mã xác nhận");
    setLoading(true);
    try {
        const res = await verifySetup2FA(verifyCode);
        if (res.success) {
            Alert.alert('Thành công', res.message);
            setIsPendingEmail(false);
            setVerifyCode("");
            // Refresh user data to update UI
            const refreshRes = await api.get('/user/me');
            if (refreshRes.data.success) {
                setUserData(refreshRes.data.user);
            }
        } else {
            Alert.alert('Lỗi', res.message || "Mã không hợp lệ");
        }
    } catch (error) {
        Alert.alert('Lỗi', error.message || "Mã không hợp lệ");
    } finally {
        setLoading(false);
    }
  };

  const handleDisable2FAAction = async () => {
    setLoading(true);
    try {
        const res = await disable2FA(verifyCode || null);
        if (res.success) {
            if (res.pendingEmail) {
                setIsPendingEmail(true);
                Alert.alert('Thông báo', res.message);
            } else {
                Alert.alert('Thành công', res.message);
                setIsPendingEmail(false);
                setVerifyCode("");
                // Refresh user data to update UI
                const refreshRes = await api.get('/user/me');
                if (refreshRes.data.success) {
                    setUserData(refreshRes.data.user);
                }
            }
        } else {
            Alert.alert('Lỗi', res.message || "Lỗi thao tác 2FA");
        }
    } catch (error) {
        Alert.alert('Lỗi', error.message || "Lỗi thao tác 2FA");
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất?',
        [
            { text: 'Hủy', style: 'cancel' },
            { 
                text: 'Đăng xuất', 
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    // Router redirect is handled by AuthContext
                }
            }
        ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
                <Ionicons name={theme === 'dark' ? "sunny-outline" : "moon-outline"} size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                <Ionicons name="log-out-outline" size={24} color={colors.danger} />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
                {userData?.image ? (
                    <Image source={{ uri: userData.image }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                         <Text style={styles.avatarText}>{userData?.username?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                )}
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>THÀNH VIÊN</Text>
                </View>
            </View>
            <Text style={styles.username}>{userData?.username}</Text>
            <Text style={styles.email}>{userData?.email}</Text>
            <Text style={styles.balance}>{(userData?.balance || 0).toLocaleString('vi-VN')} VNĐ</Text>
        </View>

        {/* Management Menu */}
        <View style={styles.menuSection}>
            <Text style={styles.menuTitle}>Quản lý chung</Text>
            
            {user?.role === 'admin' && (
                 <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(admin)')}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#8b5cf6' + '20' }]}>
                        <Ionicons name="shield-checkmark" size={20} color="#8b5cf6" />
                    </View>
                    <Text style={styles.menuText}>Admin Panel</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/history')}>
                <View style={styles.menuIconBox}>
                    <Image source={lichsuGif} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
                <Text style={styles.menuText}>Lịch sử giao dịch</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Image source={allGif} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
                <Text style={styles.menuText}>Tất cả tiến trình</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/support')}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Image source={supportGif} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
                <Text style={styles.menuText}>Hỗ trợ khách hàng</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/terms')}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                    <Image source={dieukhoanGif} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
                <Text style={styles.menuText}>Điều khoản dịch vụ</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'info' && styles.activeTab]}
                onPress={() => setActiveTab('info')}
            >
                <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Thông tin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === '2fa' && styles.activeTab]}
                onPress={() => setActiveTab('2fa')}
            >
                <Text style={[styles.tabText, activeTab === '2fa' && styles.activeTabText]}>Bảo vệ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'password' && styles.activeTab]}
                onPress={() => setActiveTab('password')}
            >
                <Text style={[styles.tabText, activeTab === 'password' && styles.activeTabText]}>Mật khẩu</Text>
            </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'info' ? (
            <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput 
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Cập nhật họ tên của bạn"
                        placeholderTextColor={colors.subtext}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tên đăng nhập</Text>
                    <TextInput 
                        style={[styles.input, styles.disabledInput]}
                        value={userData?.username}
                        editable={false}
                    />
                </View>
                 <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput 
                        style={[styles.input, styles.disabledInput]}
                        value={userData?.email}
                        editable={false}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Lưu thay đổi</Text>}
                </TouchableOpacity>
            </View>
        ) : activeTab === '2fa' ? (
            <View style={styles.formSection}>
                <View style={[styles.infoBox, { backgroundColor: userData?.is2FAEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Ionicons 
                            name={userData?.is2FAEnabled ? "shield-checkmark" : "shield-outline"} 
                            size={24} 
                            color={userData?.is2FAEnabled ? colors.success : colors.primary} 
                        />
                        <Text style={[styles.infoTitle, { color: userData?.is2FAEnabled ? colors.success : colors.primary, marginBottom: 0 }]}>
                            {userData?.is2FAEnabled ? "Đã bật bảo mật 2 lớp" : "Chưa bật bảo mật 2 lớp"}
                        </Text>
                    </View>
                    <Text style={[styles.infoText, { fontSize: 12, opacity: 0.7 }]}>
                        {userData?.is2FAEnabled 
                            ? `Tài khoản của bạn đang được bảo vệ bằng mã xác nhận gửi qua email: ${userData.email}`
                            : "Sử dụng Email để nhận mã xác thực mỗi khi thực hiện các giao dịch quan trọng hoặc thay đổi cấu hình tài khoản."}
                    </Text>
                </View>

                {userData?.is2FAEnabled ? (
                    <View style={{ gap: 16, marginTop: 12 }}>
                        {!isPendingEmail ? (
                            <TouchableOpacity 
                                style={[styles.saveButton, { backgroundColor: colors.card, borderEndWidth: 1, borderColor: colors.danger }]}
                                onPress={handleDisable2FAAction}
                                disabled={loading}
                            >
                                <Text style={[styles.saveButtonText, { color: colors.danger }]}>Tắt 2FA qua Email</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nhập mã xác nhận để tắt 2FA</Text>
                                    <TextInput 
                                        style={styles.input}
                                        value={verifyCode}
                                        onChangeText={setVerifyCode}
                                        placeholder="000000"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        placeholderTextColor={colors.subtext}
                                    />
                                </View>
                                <TouchableOpacity 
                                    style={[styles.saveButton, { backgroundColor: colors.danger }]}
                                    onPress={handleDisable2FAAction}
                                    disabled={loading || !verifyCode}
                                >
                                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Xác nhận tắt 2FA</Text>}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                ) : (
                    <View style={{ gap: 16, marginTop: 12 }}>
                        {!isPendingEmail ? (
                            <TouchableOpacity 
                                style={styles.saveButton}
                                onPress={() => handleGenerate2FA('email')}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Kích hoạt 2FA qua Email</Text>}
                            </TouchableOpacity>
                        ) : (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nhập mã OTP gửi tới Email</Text>
                                    <TextInput 
                                        style={styles.input}
                                        value={verifyCode}
                                        onChangeText={setVerifyCode}
                                        placeholder="000000"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        placeholderTextColor={colors.subtext}
                                    />
                                </View>
                                <TouchableOpacity 
                                    style={styles.saveButton}
                                    onPress={handleVerifySetup2FA}
                                    disabled={loading || !verifyCode}
                                >
                                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Kích hoạt ngay</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setIsPendingEmail(false)}
                                    style={{ alignSelf: 'center' }}
                                >
                                    <Text style={{ color: colors.subtext, fontSize: 12 }}>Hủy bỏ</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>
        ) : (
            <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mật khẩu hiện tại</Text>
                    <TextInput 
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        placeholderTextColor={colors.subtext}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mật khẩu mới</Text>
                    <TextInput 
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholderTextColor={colors.subtext}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Xác nhận mật khẩu</Text>
                    <TextInput 
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholderTextColor={colors.subtext}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>}
                </TouchableOpacity>
            </View>
        )}

      </ScrollView>

    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  logoutButton: {
      // deprecated by iconButton
  },
  iconButton: {
      padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2e1065', // still hardcoded slightly
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#5b21b6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.background,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ddd6fe',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 8,
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.subtext,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  formSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: colors.secondary,
    color: colors.subtext,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuSection: {
    marginBottom: 24,
    gap: 12,
  },
  menuTitle: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});
