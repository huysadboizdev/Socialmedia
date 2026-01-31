import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Support() {
  const router = useRouter();

  const handleContact = (type) => {
    if (type === 'telegram') {
        Linking.openURL('https://t.me/support_huytichxanh');
    } else if (type === 'zalo') {
        Linking.openURL('https://zalo.me/0123456789');
    } else if (type === 'facebook') {
        Linking.openURL('https://facebook.com/huytichxanh');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Liên hệ với chúng tôi</Text>
            <Text style={styles.text}>
                Nếu bạn gặp bất kỳ vấn đề nào trong quá trình sử dụng, vui lòng liên hệ với đội ngũ hỗ trợ qua các kênh sau:
            </Text>

            <View style={styles.contactOptions}>
                <TouchableOpacity style={styles.option} onPress={() => handleContact('telegram')}>
                    <Ionicons name="paper-plane" size={24} color="#0088cc" />
                    <Text style={styles.optionText}>Telegram</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => handleContact('facebook')}>
                    <Ionicons name="logo-facebook" size={24} color="#1877f2" />
                    <Text style={styles.optionText}>Facebook</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
            <View style={styles.faqItem}>
                <Text style={styles.question}>1. Nạp tiền bao lâu thì có?</Text>
                <Text style={styles.answer}>- Thường là ngay lập tức (1-5 phút) nếu nội dung chuyển khoản đúng. Nếu quá 15 phút chưa nhận được, hãy liên hệ hỗ trợ.</Text>
            </View>
            <View style={styles.faqItem}>
                <Text style={styles.question}>2. Rút tiền như thế nào?</Text>
                <Text style={styles.answer}>- Bạn có thể rút về ngân hàng hoặc đổi sang số dư ví chính. Rút ngân hàng có phí 20%, rút về ví Web miễn phí.</Text>
            </View>
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
    gap: 16,
  },
  card: {
    backgroundColor: '#18181b',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    color: '#a1a1aa',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  option: {
    flex: 1,
    backgroundColor: '#27272a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    color: 'white',
    fontWeight: '600',
  },
  faqItem: {
    marginBottom: 16,
  },
  question: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 4,
  },
  answer: {
     color: '#a1a1aa',
     fontSize: 13,
     lineHeight: 18,
  }
});
