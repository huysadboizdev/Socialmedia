import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Terms() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều khoản dịch vụ</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
            <Text style={styles.text}>
                Chào mừng bạn đến với HUYTICHXANH. Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản sau đây:
            </Text>
            
            <Text style={styles.heading}>1. Chính sách sử dụng</Text>
            <Text style={styles.text}>
                - Không sử dụng dịch vụ cho các mục đích vi phạm pháp luật.
                {'\n'}- Không spam, lạm dụng hệ thống hoặc gây ảnh hưởng đến người dùng khác.
            </Text>

            <Text style={styles.heading}>2. Thanh toán & Hoàn tiền</Text>
            <Text style={styles.text}>
                - Mọi giao dịch nạp tiền đều được xử lý tự động. Trong trường hợp lỗi, vui lòng liên hệ hỗ trợ.
                {'\n'}- Chúng tôi không hoàn tiền cho các dịch vụ đã hoàn thành hoặc đang chạy.
            </Text>

            <Text style={styles.heading}>3. Trách nhiệm người dùng</Text>
            <Text style={styles.text}>
                - Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình.
                {'\n'}- Chúng tôi có quyền khóa tài khoản nếu phát hiện hành vi gian lận.
            </Text>

            <Text style={styles.heading}>4. Thay đổi điều khoản</Text>
            <Text style={styles.text}>
                - Chúng tôi có thể cập nhật các điều khoản này bất cứ lúc nào mà không cần báo trước.
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#18181b',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  heading: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    color: '#a1a1aa',
    lineHeight: 22,
    fontSize: 14,
  }
});
