import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminMenu() {
  const { colors, toggleTheme, theme } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { title: 'Quản Lý Dịch Vụ', icon: 'layers-outline', route: '/(admin)/services', color: '#8b5cf6' },
    { title: 'Quản Lý Đơn Hàng', icon: 'cart-outline', route: '/(admin)/orders', color: '#f59e0b' },
    { title: 'Quản Lý Nạp Tiền', icon: 'wallet-outline', route: '/(admin)/deposits', color: '#10b981' },
    { title: 'Quản Lý Người Dùng', icon: 'people-outline', route: '/(admin)/users', color: '#3b82f6' },
    { title: 'Quản Lý Mã Giảm Giá', icon: 'ticket-outline', route: '/(admin)/coupons', color: '#db2777' },
    { title: 'Quản Lý Nhiệm Vụ', icon: 'checkbox-outline', route: '/(admin)/missions', color: '#ef4444' },
    { title: 'Duyệt Nhiệm Vụ', icon: 'fact-check-outline', route: '/(admin)/mission-requests', color: '#ec4899' },
    { title: 'Duyệt Rút Tiền', icon: 'cash-outline', route: '/(admin)/withdrawals', color: '#6366f1' },
    { title: 'Quản Lý Báo Lỗi', icon: 'alert-circle-outline', route: '/(admin)/reports', color: '#f59e0b' },
    { title: 'Tin Nhắn Hỗ Trợ', icon: 'chatbubbles-outline', route: '/(admin)/chats', color: '#3b82f6' },
    { title: 'Cài Đặt Hệ Thống', icon: 'settings-outline', route: '/(admin)/settings', color: '#64748b' },
  ];

  const handleLogout = async () => {
    await logout();
    // Redirect handled by layout
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu</Text>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
               <TouchableOpacity 
                  key={index} 
                  style={styles.menuItem}
                  onPress={() => router.push(item.route)}
                  activeOpacity={0.7}
              >
                  <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.subtext} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
          ))}
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Tùy chọn</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity style={styles.optionItem} onPress={toggleTheme}>
                <View style={[styles.smallIcon, { backgroundColor: colors.background }]}>
                    <Ionicons name={theme === 'dark' ? "sunny" : "moon"} size={18} color={colors.text} />
                </View>
                <Text style={styles.optionText}>Giao diện: {theme === 'dark' ? 'Tối' : 'Sáng'}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
            </TouchableOpacity>
            
            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
                <View style={[styles.smallIcon, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                </View>
                <Text style={[styles.optionText, { color: '#ef4444' }]}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  menuGrid: {
    marginBottom: 32,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  group: {
    marginTop: 8,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.subtext,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  optionContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 60, // Align with text
  },
  smallIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
});
