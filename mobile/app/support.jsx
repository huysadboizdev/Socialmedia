import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

// Assets
import supportGif from '../assets/supportusser.gif';
import zaloGif from '../assets/supportzalo.gif';
import fbGif from '../assets/supportfb.gif';

export default function Support() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleContact = (type) => {
    if (type === 'telegram') {
        Linking.openURL('https://t.me/badboiz123');
    } else if (type === 'zalo') {
        Linking.openURL('https://zalo.me/0763076124');
    } else if (type === 'facebook') {
        Linking.openURL('https://www.facebook.com/huy.haquang.39395/');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
             <Image source={supportGif} style={{ width: 28, height: 28 }} resizeMode="contain" />
             <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
        </View>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Liên hệ với chúng tôi</Text>
            <Text style={styles.text}>
                Nếu bạn gặp bất kỳ vấn đề nào trong quá trình sử dụng, vui lòng liên hệ với đội ngũ hỗ trợ qua các kênh sau:
            </Text>

            <View style={styles.contactOptions}>
                {/* Chat */}
                <TouchableOpacity style={styles.option} onPress={() => router.push('/chat-admin')}>
                    <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                         <Ionicons name="chatbubbles" size={24} color="white" />
                    </View>
                    <Text style={styles.optionText}>Chat trực tuyến</Text>
                </TouchableOpacity>

                {/* Zalo */}
                <TouchableOpacity style={styles.option} onPress={() => handleContact('zalo')}>
                    <Image source={zaloGif} style={{ width: 40, height: 40, borderRadius: 8 }} resizeMode="cover" />
                    <Text style={styles.optionText}>Zalo Admin</Text>
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity style={styles.option} onPress={() => handleContact('facebook')}>
                    <Image source={fbGif} style={{ width: 40, height: 40, borderRadius: 8 }} resizeMode="cover" />
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
    gap: 16,
  },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    color: colors.subtext,
    marginBottom: 20,
    lineHeight: 20,
  },
  contactOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  option: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    color: colors.text,
    fontWeight: '600',
  },
  faqItem: {
    marginBottom: 16,
  },
  question: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  answer: {
     color: colors.subtext,
     fontSize: 13,
     lineHeight: 18,
  }
});
