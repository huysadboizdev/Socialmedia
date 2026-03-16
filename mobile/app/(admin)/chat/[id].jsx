import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, 
    KeyboardAvoidingView, Platform, Alert, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { getMessages, markAdminMessagesAsRead, sendAdminMessage } from '../../../service/userService';

export default function ChatDetailAdmin() {
    const router = useRouter();
    const { id, username } = useLocalSearchParams();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const flatListRef = useRef(null);
    const intervalRef = useRef(null);

    const fetchMessages = async () => {
        if (!id) return;
        try {
            const res = await getMessages(id);
            if (res.success) {
                setMessages(res.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const handleMarkAsRead = async () => {
        if (!id) return;
        try {
            await markAdminMessagesAsRead(id);
        } catch (error) {
            console.error("Mark read error:", error);
        }
    };

    useEffect(() => {
        fetchMessages();
        handleMarkAsRead();
        intervalRef.current = setInterval(fetchMessages, 1000);

        // Keyboard listeners for auto-scroll
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );

        return () => {
            clearInterval(intervalRef.current);
            showSubscription.remove();
        };
    }, [id]);

    const sendMessage = async () => {
        if (!inputText.trim()) return;
        
        const content = inputText;
        const replyId = replyTo?._id;
        
        setInputText('');
        setReplyTo(null);

        // Optimistic update
        const tempMsg = {
             _id: Date.now().toString(),
             content: content,
             sender: 'admin',
             createdAt: new Date().toISOString(),
             replyTo: replyTo
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
             await sendAdminMessage({
                 userId: id,
                 content: content,
                 replyTo: replyId
             });
             fetchMessages();
        } catch (error) {
            console.error("Send error:", error);
            Alert.alert("Lỗi", "Không thể gửi tin nhắn");
        }
    };

    const renderItem = ({ item, index }) => {
        const isAdmin = item.sender === 'admin';
        const date = new Date(item.createdAt);
        const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        // Only show User avatar if the message is from the user AND it's the first message or the previous one was from admin
        const showAvatar = !isAdmin && (index === 0 || messages[index - 1]?.sender === 'admin');

        return (
            <TouchableOpacity 
                activeOpacity={0.8}
                onLongPress={() => setReplyTo(item)}
                style={[styles.msgWrapper, isAdmin ? styles.msgWrapperRight : styles.msgWrapperLeft]}
            >
                {!isAdmin && (
                    <View style={styles.userAvatarContainer}>
                        {showAvatar && (
                            <View style={styles.userAvatar}>
                                <Text style={styles.userAvatarText}>{username?.charAt(0)?.toUpperCase() || 'U'}</Text>
                            </View>
                        )}
                    </View>
                )}
                
                <View style={[
                    styles.msgBubble, 
                    isAdmin ? styles.msgBubbleRight : styles.msgBubbleLeft
                ]}>
                    {/* Quoted Message */}
                    {item.replyTo && typeof item.replyTo === 'object' && (
                        <View style={[styles.quoteContainer, isAdmin ? styles.quoteAdmin : styles.quoteUser]}>
                            <Text style={styles.quoteSender}>
                                {item.replyTo.sender === 'admin' ? 'Bạn' : (username || 'User')}
                            </Text>
                            <Text numberOfLines={1} style={styles.quoteContent}>
                                {item.replyTo.content || ''}
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.msgText, isAdmin ? styles.msgTextRight : styles.msgTextLeft]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.msgTime, isAdmin ? styles.msgTimeRight : styles.msgTimeLeft]}>
                        {timeString}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined} 
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push('/(admin)/chats')} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{username || 'Đoạn chat'}</Text>
                        <Text style={styles.statusText}>Admin Mode</Text>
                    </View>
                    <TouchableOpacity style={styles.headerIcon}>
                         <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Chat Area */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                />

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    {replyTo && (
                        <View style={styles.replyPreview}>
                            <View style={styles.replyBar} />
                            <View style={styles.replyContent}>
                                <Text style={styles.replyLabel}>
                                    Đang trả lời {replyTo.sender === 'admin' ? 'chính mình' : (username || 'User')}
                                </Text>
                                <Text numberOfLines={1} style={styles.replyTextPreview}>
                                    {replyTo.content}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setReplyTo(null)} style={styles.closeReply}>
                                <Ionicons name="close" size={20} color={colors.subtext} />
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    <View style={styles.inputRow}>
                        <TouchableOpacity style={styles.attachBtn}>
                            <Ionicons name="add-circle" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tin nhắn (Admin)..."
                            placeholderTextColor={colors.subtext}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity 
                            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
                            onPress={sendMessage}
                            disabled={!inputText.trim()}
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 0 : 16, 
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
    },
    backBtn: {
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    statusText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },
    headerIcon: {
        padding: 4,
    },
    userAvatarContainer: {
        width: 32,
        marginRight: 8,
        alignSelf: 'flex-end',
        marginBottom: 4,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    msgWrapper: {
        marginBottom: 16,
        width: '100%',
        flexDirection: 'row',
    },
    msgWrapperLeft: {
        justifyContent: 'flex-start',
    },
    msgWrapperRight: {
        justifyContent: 'flex-end',
    },
    msgBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
        position: 'relative',
    },
    msgBubbleLeft: {
        backgroundColor: colors.card,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    msgBubbleRight: {
        backgroundColor: '#a855f7', // Using a distinct purple color for Admin like the web version (#a333ff)
        borderBottomRightRadius: 4,
    },
    msgText: {
        fontSize: 15,
        lineHeight: 20,
    },
    msgTextLeft: {
        color: colors.text,
    },
    msgTextRight: {
        color: 'white',
    },
    msgTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    msgTimeLeft: {
        color: colors.subtext,
    },
    msgTimeRight: {
        color: 'rgba(255,255,255,0.7)',
    },
    quoteContainer: {
        marginBottom: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderLeftWidth: 3,
    },
    quoteAdmin: {
        borderLeftColor: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    quoteUser: {
        borderLeftColor: '#a855f7',
    },
    quoteSender: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 2,
        color: colors.text,
        opacity: 0.8,
    },
    quoteContent: {
        fontSize: 12,
        color: colors.text,
        opacity: 0.8,
    },
    inputContainer: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end', 
        gap: 8,
    },
    attachBtn: {
        padding: 6,
        marginBottom: 2, 
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        color: colors.text,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sendBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2, 
    },
    sendBtnDisabled: {
        backgroundColor: colors.border,
        opacity: 0.5,
    },
    replyPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        marginBottom: 8,
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    replyBar: {
        width: 4,
        height: '100%',
        backgroundColor: '#a855f7',
        borderRadius: 2,
        marginRight: 8,
    },
    replyContent: {
        flex: 1,
    },
    replyLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#a855f7',
    },
    replyTextPreview: {
        fontSize: 12,
        color: colors.subtext,
    },
    closeReply: {
        padding: 4,
    },
});
