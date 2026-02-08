import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import api from '../service/userService';

export default function ReportOrder() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập vấn đề bạn gặp phải');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/orders/${orderId}/report`, {
        message,
        note
      });

      if (res.data.success) {
        Alert.alert('Thành công', 'Đã gửi báo cáo thành công', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Lỗi', res.data.message || 'Không thể gửi báo cáo');
      }
    } catch (error) {
      console.log('Report error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo Lỗi Đơn Hàng</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
           <Text style={styles.label}>Mã đơn hàng</Text>
           <Text style={styles.orderId}>#{String(orderId).slice(-6).toUpperCase()}</Text>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Vấn đề gặp phải <Text style={{color: 'red'}}>*</Text></Text>
            <TextInput
                style={styles.input}
                placeholder="Ví dụ: Đơn hàng bị lỗi, chưa nhận được..."
                placeholderTextColor={colors.subtext}
                value={message}
                onChangeText={setMessage}
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Chi tiết/Ghi chú thêm</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả chi tiết vấn đề..."
                placeholderTextColor={colors.subtext}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />
        </View>

        <TouchableOpacity 
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
        >
            {submitting ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.submitText}>Gửi Báo Cáo</Text>
            )}
        </TouchableOpacity>
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
      padding: 20,
      gap: 20,
  },
  infoBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
  },
  label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
  },
  orderId: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 16,
  },
  formGroup: {
      gap: 4,
  },
  input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      color: colors.text,
      fontSize: 15,
  },
  textArea: {
      minHeight: 120,
  },
  submitBtn: {
      backgroundColor: '#ef4444',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
  },
  submitText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  }
});
