import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../service/userService';

export default function Deposit() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null); // { url, content, amount }
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);



  // Restore pending deposit logic (simplified for mobile: just simplified flow for now)
  // We can add AsyncStorage persistence later if needed.

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
        setShowQR(false);
        setQrData(null);
        setTimeLeft(null);
        Alert.alert('Hết hạn', 'Giao dịch đã hết hạn. Vui lòng tạo mã mới.');
        return;
    }
    const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Polling logic
  useEffect(() => {
    if (!showQR || !qrData) return;

    const checkStatus = async () => {
        try {
            const res = await api.get(`/payment/check-status/${qrData.content}`);
            if (res.data && res.data.status === 'approved') {
                Alert.alert('Thành công', `Nạp thành công ${parseInt(res.data.amount).toLocaleString('vi-VN')} VND!`);
                setShowQR(false);
                setAmount('');
                setQrData(null);
                setTimeLeft(null);
                // Trigger balance refresh?? AuthContext might update if we re-fetch
            }
        } catch (_e) {
            // ignore
        }
    };

    const poll = setInterval(checkStatus, 3000);
    return () => clearInterval(poll);
  }, [showQR, qrData]);

  const handleAmountChange = (text) => {
    const value = text.replace(/[^0-9]/g, '');
    setAmount(value ? parseInt(value, 10).toLocaleString('vi-VN') : '');
    if (showQR) {
        setShowQR(false); // Reset if amount changes
        setQrData(null);
        setTimeLeft(null);
    }
  };

  const handleCreateQR = async () => {
    const value = parseInt(amount.replace(/\./g, ''), 10);
    
    if (!value || value < 10000) {
        Alert.alert('Lỗi', 'Số tiền nạp tối thiểu là 10.000 VND');
        return;
    }
    if (value > 100000000) {
        Alert.alert('Lỗi', 'Số tiền nạp tối đa là 100.000.000 VND');
        return;
    }

    setLoading(true);

    // Generate Content
    const randomDigits = Math.floor(100 + Math.random() * 900);
    const content = `HUYTICHXANH${randomDigits}`;
    
    // Generate URL
    const url = `https://qr.sepay.vn/img?bank=TPBank&acc=HUYDEV204&template=compact&amount=${value}&des=${content}`;

    setQrData({
        url,
        content,
        amount: value
    });
    setShowQR(true);
    setTimeLeft(600); // 10 mins

    // Save pending to backend
    try {
        await api.post('/user/deposit', {
            userId: user?._id || user?.id, // Handle both cases just in case
            amount: value,
            content: content
        });
    } catch (e) {
        console.log('Error creating pending deposit:', e);
        Alert.alert('Cảnh báo', 'Không thể lưu giao dịch chờ, nhưng bạn vẫn có thể chuyển khoản.');
    } finally { 
        setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Đã sao chép', 'Đã sao chép vào bộ nhớ tạm');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Banner */}
        <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.banner}
        >
            <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>NẠP TIỀN</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>RATE 1:1</Text>
                </View>
                <Text style={styles.bannerSubtitle}>Tự động 24/7</Text>
            </View>
        </LinearGradient>

        <View style={styles.formCard}>
            <Text style={styles.label}>Số tiền muốn nạp</Text>
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input}
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="Ví dụ: 50.000"
                    placeholderTextColor={colors.subtext}
                    keyboardType="numeric"
                />
                <Text style={styles.currency}>VND</Text>
            </View>
            <Text style={styles.helperText}>Tối thiểu: 10.000 VND - Tối đa: 100.000.000 VND</Text>

            <TouchableOpacity 
                style={styles.button}
                onPress={handleCreateQR}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>{showQR ? 'Tạo lại QR' : 'Tạo mã QR'}</Text>
                )}
            </TouchableOpacity>
        </View>

        {showQR && qrData && (
            <View style={styles.qrCard}>
                <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>
                
                <View style={styles.qrContainer}>
                    <Image 
                        source={{ uri: qrData.url }} 
                        style={styles.qrImage} 
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Ngân hàng:</Text>
                        <Text style={styles.detailValue}>TPBank</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Số tài khoản:</Text>
                        <View style={styles.copyRow}>
                            <Text style={styles.detailValue}>HUYDEV204</Text>
                            <TouchableOpacity onPress={() => copyToClipboard('HUYDEV204')}>
                                <Ionicons name="copy-outline" size={16} color={colors.info} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tên chủ TK:</Text>
                        <Text style={styles.detailValue}>HA QUANG HUY</Text>
                    </View>

                    <View style={styles.divider} />

                     <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Số tiền:</Text>
                        <Text style={[styles.detailValue, { color: colors.success }]}>{qrData.amount.toLocaleString('vi-VN')} VND</Text>
                    </View>

                     <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Nội dung:</Text>
                        <View style={styles.copyRow}>
                            <Text style={[styles.detailValue, { color: colors.danger }]}>{qrData.content}</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(qrData.content)}>
                                <Ionicons name="copy-outline" size={16} color={colors.info} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Hết hạn trong:</Text>
                    <Text style={styles.timerValue}>{timeLeft ? formatTime(timeLeft) : '00:00'}</Text>
                </View>

                <Text style={styles.note}>
                    * Vui lòng chuyển khoản đúng nội dung trên để được cộng tiền tự động.
                </Text>
            </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  banner: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  bannerContent: {
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f97316', // orange-500
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    color: '#fb923c', // orange-400
    fontWeight: '700',
    fontSize: 12,
  },
  bannerSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    paddingRight: 60,
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  currency: {
    position: 'absolute',
    right: 16,
    top: 18,
    color: colors.subtext,
    fontWeight: 'bold',
  },
  helperText: {
    color: colors.subtext,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#f97316', // orange-500
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  qrCard: {
    // backgroundColor: 'white', // removed duplicate
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  qrTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  qrContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: 'white', // QR image background should stay white
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: colors.secondary, // zinc-100 or zinc-700
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: colors.subtext,
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    color: colors.text, // zinc-900 or white
    fontSize: 14,
    fontWeight: 'bold',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background === '#09090b' ? 'rgba(249, 115, 22, 0.1)' : '#fff7ed', // orange-50 adapted
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.background === '#09090b' ? '#f97316' : '#ffedd5',
  },
  timerLabel: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 12,
  },
  timerValue: {
    color: '#c2410c', // orange-700
    fontWeight: 'bold',
    fontSize: 14,
  },
  note: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
