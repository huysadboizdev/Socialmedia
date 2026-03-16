import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import api from '../../service/userService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminReports() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('resolved');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      // Using GET as per recent backend change
      const res = await api.get('/admin/reports'); 
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (error) {
      console.log("Error fetching reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleReply = async () => {
      if (!replyMessage.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập nội dung phản hồi');
          return;
      }

      try {
          setSubmitting(true);
          const res = await api.post('/admin/reply-report', {
              orderId: selectedReport._id,
              response: replyMessage,
              status: replyStatus
          });

          if (res.data.success) {
              Alert.alert('Thành công', 'Đã phản hồi thành công');
              setSelectedReport(null);
              setReplyMessage('');
              fetchReports();
          } else {
              Alert.alert('Lỗi', res.data.message || 'Không thể gửi phản hồi');
          }
      } catch (error) {
          console.log('Reply error:', error);
          Alert.alert('Lỗi', 'Lỗi kết nối');
      } finally {
          setSubmitting(false);
      }
  };

  const openReplyModal = (item) => {
      setSelectedReport(item);
      setReplyMessage(item.report?.adminResponse || '');
      setReplyStatus(item.report?.status || 'resolved');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.report?.status === 'resolved' ? '#dcfce7' : '#ffedd5' }]}>
                <Text style={[styles.statusText, { color: item.report?.status === 'resolved' ? '#16a34a' : '#ea580c' }]}>
                    {item.report?.status === 'resolved' ? 'Đã xử lý' : 'Chờ xử lý'}
                </Text>
            </View>
        </View>
        <Text style={styles.date}>
           {item.report?.createdAt ? formatDistanceToNow(new Date(item.report.createdAt), { addSuffix: true, locale: vi }) : ''}
        </Text>
      </View>
      
      <View style={styles.userRow}>
          <Text style={styles.username}>{item.userId?.username}</Text>
          <Text style={styles.serviceName}>{item.service?.name}</Text>
      </View>

      <View style={styles.reportContent}>
          <Text style={styles.reportMessage}>Vấn đề: <Text style={{fontWeight: 'normal', color: colors.text}}>{item.report?.message}</Text></Text>
          {item.report?.note ? (
              <Text style={styles.reportNote}>Ghi chú: <Text style={{fontWeight: 'normal', color: colors.subtext}}>{item.report?.note}</Text></Text>
          ) : null}
      </View>

      <TouchableOpacity 
        style={styles.replyBtn}
        onPress={() => openReplyModal(item)}
      >
          <Text style={styles.replyBtnText}>Phản hồi</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(admin)/menu')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản Lý Báo Lỗi</Text>
        <View style={{width: 28}} /> 
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
            data={reports}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có báo cáo nào.</Text>
                </View>
            }
        />
      )}

      {/* Reply Modal */}
      <Modal visible={!!selectedReport} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
              <View style={[styles.modalContainer, {backgroundColor: colors.background}]}>
                  <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Phản hồi báo cáo</Text>
                      <TouchableOpacity onPress={() => setSelectedReport(null)}>
                          <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.modalBody}>
                      <Text style={[styles.label, {color: colors.text}]}>Trạng thái:</Text>
                      <View style={styles.statusOptions}>
                          <TouchableOpacity 
                            style={[styles.statusOption, replyStatus === 'pending' && {backgroundColor: '#ffedd5', borderColor: '#ea580c'}]}
                            onPress={() => setReplyStatus('pending')}
                          >
                              <Text style={[styles.statusOptionText, replyStatus === 'pending' && {color: '#ea580c'}]}>Đang chờ</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.statusOption, replyStatus === 'resolved' && {backgroundColor: '#dcfce7', borderColor: '#16a34a'}]}
                            onPress={() => setReplyStatus('resolved')}
                          >
                              <Text style={[styles.statusOptionText, replyStatus === 'resolved' && {color: '#16a34a'}]}>Đã xử lý</Text>
                          </TouchableOpacity>
                      </View>

                      <Text style={[styles.label, {color: colors.text, marginTop: 16}]}>Nội dung phản hồi:</Text>
                      <TextInput 
                          style={[styles.input, {color: colors.text, borderColor: colors.border, backgroundColor: colors.card}]}
                          multiline
                          numberOfLines={5}
                          textAlignVertical="top"
                          placeholder="Nhập nội dung phản hồi..."
                          placeholderTextColor={colors.subtext}
                          value={replyMessage}
                          onChangeText={setReplyMessage}
                      />
                  </ScrollView>

                  <View style={styles.modalFooter}>
                      <TouchableOpacity 
                        style={[styles.submitBtn, submitting && {opacity: 0.7}]}
                        onPress={handleReply}
                        disabled={submitting}
                      >
                          {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Gửi Phản Hồi</Text>}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
  },
  statusText: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  date: {
    color: colors.subtext,
    fontSize: 11,
  },
  userRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 8,
  },
  username: {
      fontWeight: '600',
      color: colors.text,
  },
  serviceName: {
      fontSize: 12,
      color: colors.subtext,
  },
  reportContent: {
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 8,
  },
  reportMessage: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#ef4444',
  },
  reportNote: {
      fontSize: 12,
      color: colors.text,
      marginTop: 4,
  },
  replyBtn: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
  },
  replyBtnText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.subtext,
  },
  // Modal
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  modalContainer: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '70%',
      padding: 20,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
  },
  modalBody: {
      flex: 1,
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
  },
  statusOptions: {
      flexDirection: 'row',
      gap: 12,
  },
  statusOption: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e4e4e7',
      alignItems: 'center',
      backgroundColor: '#f4f4f5',
  },
  statusOptionText: {
      fontWeight: '600',
      color: '#71717a',
  },
  input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
  },
  modalFooter: {
      marginTop: 20,
  },
  submitBtn: {
      backgroundColor: '#a855f7',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
  },
  submitBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  }
});
