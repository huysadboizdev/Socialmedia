import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

// Assets
import dieukhoanGif from '../assets/dieukhoan.gif';

export default function Terms() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Image source={dieukhoanGif} style={{ width: 28, height: 28 }} resizeMode="contain" />
            <Text style={styles.headerTitle}>Điều khoản dịch vụ</Text>
        </View>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
        <Text style={styles.text}>
            Chào mừng bạn đến với ứng dụng của chúng tôi. Khi sử dụng dịch vụ, bạn đồng ý với các điều khoản dưới đây.
        </Text>

        <Text style={styles.sectionTitle}>2. Quyền và trách nhiệm</Text>
        <Text style={styles.text}>
            - Chúng tôi cam kết bảo mật thông tin cá nhân của bạn.
            {'\n'}- Bạn chịu trách nhiệm về các hoạt động trên tài khoản của mình.
            {'\n'}- Nghiêm cấm sử dụng bug, cheat hoặc các hành vi gian lận.
        </Text>

        <Text style={styles.sectionTitle}>3. Dịch vụ và thanh toán</Text>
        <Text style={styles.text}>
            - Các dịch vụ mạng xã hội được xử lý tự động.
            {'\n'}- Tiền đã nạp không được hoàn lại trừ khi có lỗi từ hệ thống.
            {'\n'}- Vui lòng kiểm tra kỹ đơn hàng trước khi thanh toán.
        </Text>

        <Text style={styles.sectionTitle}>4. Thay đổi điều khoản</Text>
        <Text style={styles.text}>
            Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào mà không cần báo trước. Vui lòng cập nhật thường xuyên.
        </Text>
        
        <View style={{height: 40}} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: { // Add this as it is used in the component
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
  },
  text: {
    color: colors.subtext,
    lineHeight: 22,
    fontSize: 14,
  }
});
