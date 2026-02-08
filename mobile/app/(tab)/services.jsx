import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform as RNPlatform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../service/userService';

// Assets
import igGif from '../../assets/ig.gif';
import fbGif from '../../assets/fb.gif';
import tiktokGif from '../../assets/tiktok.gif';
// Placeholders for others if not available as GIFs, fallback to icons or standard images if you have them.
// User requested "put where they are in frontend". Frontend has these 3 clearly. 
// For others (Youtube, Shopee, Telegram), I'll stick to Ionicons for now or check if I have GIFs.
// Checking file list: fb.gif, ig.gif, tiktok.gif exist. 

// Platform Config
const PLATFORMS = [
  { id: 'Instagram', name: 'Instagram', type: 'gif', source: igGif, color: '#E1306C' },
  { id: 'Facebook', name: 'Facebook', type: 'gif', source: fbGif, color: '#1877F2' },
  { id: 'TikTok', name: 'TikTok', type: 'gif', source: tiktokGif, color: '#ffffff' },
  { id: 'Youtube', name: 'Youtube', type: 'icon', icon: 'logo-youtube', color: '#FF0000' },
  { id: 'Shopee', name: 'Shopee', type: 'icon', icon: 'cart', color: '#EE4D2D' },
  { id: 'Telegram', name: 'Telegram', type: 'icon', icon: 'paper-plane', color: '#0088cc' },
];

export default function Services() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  
  //Tabs
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'history'

  // ... (rest of state items are unchanged, just re-declaring to keep context for replace)
  // Actually, replace_file_content replaces a block. I should find a stable block.
  // The block starts at imports and goes down to PLATFORMS and start of Component.

  // Selection State
  const [activePlatform, setActivePlatform] = useState('Instagram');
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [discount, setDiscount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const [orders, setOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
        fetchHistory();
    }
  }, [activeTab, activePlatform]);

  const fetchServices = async () => {
    try {
        const res = await api.post('/user/service', { action: 'getServices' });
        if (res.data.success) {
            setServices(res.data.services);
        }
    } catch (e) {
        console.error("Fetch services error", e);
        Alert.alert('Error', 'Failed to load services');
    } finally {
        setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
        const res = await api.post('/user/service', { action: 'getOrderHistory' });
        if (res.data.success) {
             const allOrders = res.data.orders;
             setOrders(allOrders.filter(o => o.service?.platform === activePlatform));
        }
    } catch (e) {
         console.log("Fetch history error", e);
    } finally {
        setLoadingHistory(false);
    }
  };

  // Filter logic
  const platformServices = services.filter(s => s.platform === activePlatform && s.isActive !== false);
  
  const categories = [...new Set(platformServices.map(s => s.category))];
  
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
        setActiveCategory(categories[0]);
    } else if (categories.length === 0) {
        setActiveCategory(null);
    }
  }, [activePlatform, services]);

  const displayServices = platformServices.filter(s => s.category === activeCategory);

  useEffect(() => {
    if (displayServices.length > 0) {
         if (!selectedService || !displayServices.find(s => s._id === selectedService._id)) {
             setSelectedService(displayServices[0]);
         }
    } else {
        setSelectedService(null);
    }
  }, [activeCategory, displayServices]);


  const handleSubmit = async () => {
    if (!selectedService) return;
    if (!link && activeCategory !== 'Tích Xanh') { 
        Alert.alert('Lỗi', 'Vui lòng nhập link hợp lệ');
        return;
    }

    let qty = parseInt(quantity);
    let details = { discount };

    if (activeCategory === 'Tích Xanh') {
        if (!username || !password || !contactInfo || !link) {
             Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin (Link Profile, Tài khoản, Mật khẩu, Liên hệ)');
             return;
        }
        if (!username.toLowerCase().endsWith('@gmail.com')) {
             Alert.alert('Lỗi', 'Tài khoản phải là địa chỉ Gmail (@gmail.com)');
             return;
        }
        qty = 1; 
        details = {
            ...details,
            username,
            password,
            twoFaCode,
            contactInfo
        };
    } else {
        if (!qty || qty < 1000) {
            Alert.alert('Lỗi', 'Số lượng tối thiểu là 1000');
            return;
        }
    }

    setSubmitting(true);
    try {
        const res = await api.post('/user/service', {
            action: 'createOrder',
            serviceId: selectedService._id,
            quantity: qty,
            link: link,
            note: note,
            details: details, 
            userId: user?._id 
        });

        if (res.data.success) {
            Alert.alert('Thành công', 'Đặt đơn hàng thành công!');
            setLink('');
            setQuantity('');
            setNote('');
            setDiscount('');
            setUsername('');
            setPassword('');
            setTwoFaCode('');
            setContactInfo('');

            if (activeTab === 'history') fetchHistory(); 
        } else {
            Alert.alert('Lỗi', res.data.message || 'Đặt đơn thất bại');
        }
    } catch (_e) {
        Alert.alert('Lỗi', 'Lỗi kết nối');
    } finally {
        setSubmitting(false);
    }
  };

  const totalPrice = selectedService ? (activeCategory === 'Tích Xanh' ? 1 : (parseInt(quantity) || 0)) * selectedService.price : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <Text style={styles.headerTitle}>Dịch vụ</Text>

        {/* Platform Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformScroll}>
            {PLATFORMS.map(p => (
                <TouchableOpacity 
                    key={p.id}
                    style={[
                        styles.platformTab,
                        activePlatform === p.id && { backgroundColor: p.color + '20', borderColor: p.color }
                    ]}
                    onPress={() => { setActivePlatform(p.id); setActiveCategory(null); }}
                >
                    {p.type === 'gif' ? (
                        <Image source={p.source} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    ) : (
                        <Ionicons name={p.icon} size={20} color={activePlatform === p.id ? p.color : '#71717a'} />
                    )}
                    <Text style={[
                        styles.platformText,
                        activePlatform === p.id && { color: p.color, fontWeight: 'bold' }
                    ]}>{p.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>

        {/* View Tabs (Create / History) */}
        <View style={styles.viewTabs}>
            <TouchableOpacity 
                style={[styles.viewTab, activeTab === 'create' && styles.activeViewTab]}
                onPress={() => setActiveTab('create')}
            >
                <Text style={[styles.viewTabText, activeTab === 'create' && styles.activeViewTabText]}>Tạo đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.viewTab, activeTab === 'history' && styles.activeViewTab]}
                onPress={() => setActiveTab('history')}
            >
                 <Text style={[styles.viewTabText, activeTab === 'history' && styles.activeViewTabText]}>Lịch sử</Text>
            </TouchableOpacity>
        </View>

        {activeTab === 'create' ? (
             loading ? (
                <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 40 }} />
            ) : (
                <>
                    {/* Category Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {categories.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[
                                    styles.categoryChip,
                                    activeCategory === c && styles.activeCategoryChip
                                ]}
                                onPress={() => setActiveCategory(c)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    activeCategory === c && styles.activeCategoryText
                                ]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                        {categories.length === 0 && (
                            <Text style={styles.emptyText}>Không có dịch vụ nào cho nền tảng này.</Text>
                        )}
                    </ScrollView>
    
                    {/* Service Selection */}
                    {selectedService && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Chọn máy chủ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serverScroll}>
                                {displayServices.map(s => (
                                    <TouchableOpacity
                                        key={s._id}
                                        style={[
                                            styles.serverCard,
                                            selectedService?._id === s._id && styles.activeServerCard
                                        ]}
                                        onPress={() => setSelectedService(s)}
                                        disabled={s.isMaintenance}
                                    >
                                        <View style={styles.serverHeader}>
                                             <View style={[
                                                 styles.radioInner,
                                                 selectedService?._id === s._id && styles.radioActive
                                             ]} />
                                             <Text style={styles.serverName}>{s.name} - {s.price}đ</Text>
                                        </View>
                                        <Text style={styles.serverDesc} numberOfLines={2}>{s.description || s.label || 'Không có mô tả'}</Text>
                                        {s.isMaintenance && <Text style={styles.maintenanceText}>Bảo trì</Text>}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
    
                    {/* Order Form */}
                {selectedService && (
                    <View style={styles.formCard}>
                        {/* Target Link/URL */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{activeCategory === 'Tích Xanh' ? 'Link Profile/Brand' : 'Link / UID'}</Text>
                            <TextInput 
                                style={styles.input}
                                value={link}
                                onChangeText={setLink}
                                placeholder="https://..."
                                placeholderTextColor="#52525b"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Blue Tick Special Fields */}
                        {activeCategory === 'Tích Xanh' ? (
                            <>
                                <View style={styles.rowInputs}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Tài khoản (Gmail)</Text>
                                        <TextInput 
                                            style={styles.input}
                                            value={username}
                                            onChangeText={setUsername}
                                            placeholder="email@gmail.com"
                                            placeholderTextColor="#52525b"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Mật khẩu</Text>
                                        <TextInput 
                                            style={styles.input}
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="******"
                                            placeholderTextColor="#52525b"
                                            secureTextEntry
                                        />
                                    </View>
                                </View>
                                
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Mã 2FA (Nếu có)</Text>
                                    <TextInput 
                                        style={styles.input}
                                        value={twoFaCode}
                                        onChangeText={setTwoFaCode}
                                        placeholder="123456"
                                        placeholderTextColor="#52525b"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Liên hệ (FB/Zalo)</Text>
                                    <TextInput 
                                        style={styles.input}
                                        value={contactInfo}
                                        onChangeText={setContactInfo}
                                        placeholder="Link FB hoặc số Zalo"
                                        placeholderTextColor="#52525b"
                                    />
                                </View>
                            </>
                        ) : (
                            /* Standard Fields */
                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Số lượng (Tối thiểu 1000)</Text>
                                    <TextInput 
                                        style={styles.input}
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        placeholder="1000"
                                        placeholderTextColor="#52525b"
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Mã giảm giá</Text>
                                    <TextInput 
                                        style={styles.input}
                                        value={discount}
                                        onChangeText={setDiscount}
                                        placeholder="CODE"
                                        placeholderTextColor="#52525b"
                                        autoCapitalize="characters"
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ghi chú (Tùy chọn)</Text>
                            <TextInput 
                                style={[styles.input, { height: 80 }]}
                                value={note}
                                onChangeText={setNote}
                                placeholder="Ghi chú..."
                                placeholderTextColor={colors.subtext}
                                multiline
                            />
                        </View>

                        <View style={styles.totalContainer}>
                             <Text style={styles.totalLabel}>Tổng cộng:</Text>
                             <Text style={styles.totalValue}>{totalPrice.toLocaleString('vi-VN')} VND</Text>
                        </View>

                        <TouchableOpacity 
                            style={[
                                styles.submitButton,
                                (submitting || selectedService.isMaintenance) && styles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={submitting || selectedService.isMaintenance}
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>Thanh toán</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
                </>
            )
        ) : (
            <View style={styles.historyContainer}>
                 {loadingHistory ? (
                     <ActivityIndicator color="#8b5cf6" size="large" />
                 ) : orders.length === 0 ? (
                     <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào cho {activePlatform}</Text>
                 ) : (
                    <View style={{ width: '100%', gap: 12 }}>
                        {orders.map(order => (
                            <View key={order._id} style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ color: colors.subtext, fontSize: 12 }}>#{order._id.slice(-6)}</Text>
                                    <Text style={{ color: order.status === 'Completed' ? colors.success : colors.warning, fontWeight: 'bold' }}>{order.status}</Text>
                                </View>
                                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{order.service?.name || 'Dịch vụ không xác định'}</Text>
                                <Text style={{ color: colors.subtext, marginTop: 4 }}>Số lượng: {order.quantity}</Text>
                                <Text style={{ color: colors.subtext }}>Tổng: {order.totalPrice?.toLocaleString('vi-VN')}đ</Text>
                            </View>
                        ))}
                    </View>
                 )}
            </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // zinc-950
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  platformScroll: {
    maxHeight: 50,
    marginBottom: 20,
  },
  platformTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    backgroundColor: colors.card,
  },
  platformText: {
    color: colors.subtext,
    fontWeight: '600',
    fontSize: 14,
  },
  categoryScroll: {
    maxHeight: 40,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card, // zinc-900
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCategoryChip: {
    backgroundColor: colors.primary, // violet-500
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.subtext,
    fontWeight: '600',
    fontSize: 12,
  },
  activeCategoryText: {
    color: 'white',
  },
  emptyText: {
    color: colors.subtext,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  serverScroll: {
    // horizontal
  },
  serverCard: {
    width: 280,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
    gap: 8,
  },
  activeServerCard: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  serverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.subtext,
  },
  radioActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  serverName: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  serverDesc: {
    color: colors.subtext,
    fontSize: 12,
    lineHeight: 18,
  },
  maintenanceText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    color: colors.subtext,
    fontSize: 16,
  },
  totalValue: {
    color: colors.warning, // yellow-400
    fontSize: 20,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#4c1d95',
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  viewTabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 20,
    padding: 4,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeViewTab: {
    backgroundColor: colors.border,
  },
  viewTabText: {
    color: colors.subtext,
    fontWeight: '600',
  },
  activeViewTabText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  historyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
