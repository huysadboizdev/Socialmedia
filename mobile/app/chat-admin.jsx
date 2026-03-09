
import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, 
    KeyboardAvoidingView, Platform, Alert, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getMessages, markMessagesAsRead, sendMessage as sendChatMessage } from '../service/userService';

export default function ChatAdmin() {
    const router = useRouter();
    const { user, refreshUnreadCount } = useContext(AuthContext);
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const flatListRef = useRef(null);
    const intervalRef = useRef(null);

    // Hardcode API_URL if not imported correctly, but usually available in context or config
    // In mobile usually we use IP, let's assume AuthContext has it or I use the same as other files.
    // Checking other files, they import API_URL usually from context or defines it.
    // I will check how other files do it. app/orders.jsx uses imports from service.
    // For now I'll use the URL from context or a default one.

    const fetchMessages = async () => {
        if (!user?._id) return;
        try {
            // Using the exposed API_URL or getting it from somewhere. 
            // Since I cannot see a global config easily, I will rely on replacing this if needed.
            // But wait, in `useAdminChat.js` frontend used `import.meta.env`. Mobile uses `process.env` or constants.
            // I'll grab it from AuthContext if available or defaults.
            // Actually, in `app/_layout.jsx`, no API_URL is visibly passed. 
            // Let's assume a common config or hardcode for now based on previous context ? 
            // I'll check `service/userService.js` later if needed. For now assume standard axios.
            
            // To be safe, I will use the path commonly used in this project.
            // Let's look at `service/userService.js`? No I can't view it now.
            // I will use `http://10.0.2.2:5000` or whatever is configured.
            // For now let's assume the component will work with axios base URL if configured, 
            // OR I will just use a relative path if interceptors are set. 
            // If not, I'll need the full URL. 
            // RE-Checking `app/orders.jsx`... It uses `service/orderService`.
            // I will try to use a direct axios call with the likely backend URL. 
            // Ideally should use a service, but for a single file this is faster.
            
            // const backendUrl = 'https://social-media-api-steel.vercel.app'; // Based on typical Vercel deployment or local?
            // User said "d:\FNPRJ\Socialmedia", implies local dev. 
            // I will use a placeholder and fix if needed, but wait. user provided `VITE_BACKEND_URL` in frontend.
            // Mobile usually needs explicit IP.
            // I'll assume the axios instance or global config is handled, OR I will just use the one from `context/AuthContext` if it exists.
            
            // let's assume we can get it or just use the production/dev url. 
            // I'll use a const here for easy change.
             // const BASE_URL = 'http://192.168.1.5:5000'; // Example local IP, user might change.
             // Actually, I should check `constants` or `service` folder.
             
            const res = await getMessages(user._id);
            
            if (res.success) {
                setMessages(res.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const handleMarkAsRead = async () => {
        if (!user?._id) return;
        try {
            await markMessagesAsRead(user._id);
            if (refreshUnreadCount) refreshUnreadCount();
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
    }, []);

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
             sender: 'user',
             createdAt: new Date().toISOString(),
             replyTo: replyTo
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
             await sendChatMessage({
                 userId: user._id,
                 sender: 'user',
                 content: content,
                 replyTo: replyId
             });
             fetchMessages();
        } catch (error) {
            console.error("Send error:", error);
            Alert.alert("Lỗi", "Không thể gửi tin nhắn");
        }
    };

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        const date = new Date(item.createdAt);
        const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

        return (
            <TouchableOpacity 
                activeOpacity={0.8}
                onLongPress={() => setReplyTo(item)}
                style={[styles.msgWrapper, isUser ? styles.msgWrapperRight : styles.msgWrapperLeft]}
            >
                {!isUser && (
                    <View style={styles.adminAvatar}>
                        <Ionicons name="person" size={16} color="white" />
                    </View>
                )}
                <View style={[
                    styles.msgBubble, 
                    isUser ? styles.msgBubbleRight : styles.msgBubbleLeft
                ]}>
                    {/* Quoted Message */}
                    {item.replyTo && typeof item.replyTo === 'object' && (
                        <View style={[styles.quoteContainer, isUser ? styles.quoteUser : styles.quoteAdmin]}>
                            <Text style={styles.quoteSender}>
                                {item.replyTo.sender === 'user' ? 'Bạn' : 'Admin'}
                            </Text>
                            <Text numberOfLines={1} style={styles.quoteContent}>
                                {item.replyTo.content || ''}
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.msgText, isUser ? styles.msgTextRight : styles.msgTextLeft]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.msgTime, isUser ? styles.msgTimeRight : styles.msgTimeLeft]}>
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
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Hỗ trợ trực tuyến</Text>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Thường phản hồi ngay</Text>
                        </View>
                    </View>
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
                                    Đang trả lời {replyTo.sender === 'user' ? 'chính mình' : 'Admin'}
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
                            placeholder="Nhập tin nhắn..."
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
        paddingTop: Platform.OS === 'ios' ? 0 : 16, // Adjust for SafeAreaView edges
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
    },
    adminAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        alignSelf: 'flex-end', // Align with bottom of bubble
        marginBottom: 4,
    },
    backBtn: {
        marginRight: 16,
    },
    headerInfo: {
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e', // green-500
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: colors.subtext,
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
        backgroundColor: colors.primary, // Using primary color
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
    quoteUser: {
        borderLeftColor: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    quoteAdmin: {
        borderLeftColor: colors.primary,
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
        alignItems: 'flex-end', // Align icons with the bottom of multiline text
        gap: 8,
    },
    attachBtn: {
        padding: 6,
        marginBottom: 2, // Align with bottom of input
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
        marginBottom: 2, // Align with bottom of input
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
        backgroundColor: colors.primary,
        borderRadius: 2,
        marginRight: 8,
    },
    replyContent: {
        flex: 1,
    },
    replyLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
    },
    replyTextPreview: {
        fontSize: 12,
        color: colors.subtext,
    },
    closeReply: {
        padding: 4,
    },
});
