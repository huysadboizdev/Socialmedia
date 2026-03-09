import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { 
    Search, Send, User, X, Reply, 
    MoreHorizontal, SquarePen, Phone, Video, Info,
    PlusCircle, Image as ImageIcon, Smile, ThumbsUp,
    Mic, Gift, Sticker
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminChat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'groups'
    const scrollRef = useRef(null);
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('token');
    
    // FETCH CONVERSATIONS
    const fetchConversations = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/message/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setConversations(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    }, [API_URL, token]);

    // FETCH MESSAGES
    const fetchMessages = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const res = await axios.get(`${API_URL}/api/message/list?userId=${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }, [API_URL, token]);

    useEffect(() => {
        setTimeout(() => fetchConversations(), 0);
        const id = setInterval(fetchConversations, 2000);
        return () => clearInterval(id);
    }, [fetchConversations]);

    useEffect(() => {
        if (selectedUser) {
            setTimeout(() => fetchMessages(selectedUser._id), 0);
            const id = setInterval(() => fetchMessages(selectedUser._id), 1000);
            return () => clearInterval(id);
        }
    }, [selectedUser, fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        try {
            await axios.post(`${API_URL}/api/message/read`, 
                { userId: user._id, sender: 'admin' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setConversations(prev => prev.map(c => 
                c._id === user._id ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!replyMessage.trim() || !selectedUser) return;

        const content = replyMessage;
        setReplyMessage('');
        const tempId = Date.now();

        try {
            const tempMessage = {
                _id: tempId,
                content: content,
                sender: 'admin',
                userId: selectedUser._id,
                createdAt: new Date().toISOString(),
                replyTo: replyTo
            };
            setMessages(prev => [...prev, tempMessage]);
            setReplyTo(null);

            await axios.post(`${API_URL}/api/message/send`, 
                { userId: selectedUser._id, sender: 'admin', content: content, replyTo: replyTo?._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            fetchMessages(selectedUser._id);
            fetchConversations(); 
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally remove temp message or show error
        }
    };

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = c.username?.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeFilter === 'unread') return matchesSearch && c.unreadCount > 0;
        return matchesSearch;
    });

    // Helper for bubble rounding
    const getBubbleRadius = (msg, index, messages) => {
        const prevMsg = messages[index - 1];
        const nextMsg = messages[index + 1];
        const isSameSenderPrev = prevMsg?.sender === msg.sender;
        const isSameSenderNext = nextMsg?.sender === msg.sender;

        if (msg.sender === 'admin') {
            return {
                borderTopRightRadius: isSameSenderPrev ? '4px' : '18px',
                borderBottomRightRadius: isSameSenderNext ? '4px' : '18px',
                borderTopLeftRadius: '18px',
                borderBottomLeftRadius: '18px',
            };
        } else {
            return {
                borderTopLeftRadius: isSameSenderPrev ? '4px' : '18px',
                borderBottomLeftRadius: isSameSenderNext ? '4px' : '18px',
                borderTopRightRadius: '18px',
                borderBottomRightRadius: '18px',
            };
        }
    };

    return (
        <div className="flex h-[calc(100vh-3.5rem)] w-full bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <div className="w-[360px] flex flex-col border-r border-border bg-background">
                {/* Fixed Sidebar Header Area */}
                <div className="p-4 space-y-4 border-b bg-background shadow-sm">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Đoạn chat</h1>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full bg-secondary hover:bg-muted text-foreground">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full bg-secondary hover:bg-muted text-foreground">
                                <SquarePen className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input 
                            placeholder="Tìm kiếm trên Messenger" 
                            className="w-full bg-secondary rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground border-none" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <button 
                            onClick={() => setActiveFilter('all')}
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeFilter === 'all' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground hover:bg-muted'}`}
                        >
                            Tất cả
                        </button>
                        <button 
                            onClick={() => setActiveFilter('unread')}
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeFilter === 'unread' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground hover:bg-muted'}`}
                        >
                            Chưa đọc
                        </button>
                    </div>
                </div>

                {/* Scrollable Conversations List */}
                <ScrollArea className="flex-1 px-2 py-2">
                    <div className="space-y-1">
                        {filteredConversations.map(conv => (
                            <button
                                key={conv._id}
                                onClick={() => handleSelectUser({ _id: conv._id, username: conv.username, image: conv.image })}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors group ${selectedUser?._id === conv._id ? 'bg-primary/10' : 'hover:bg-accent'}`}
                            >
                                <div className="relative shrink-0">
                                    <Avatar className="h-14 w-14 border border-border">
                                        <AvatarImage src={conv.image} />
                                        <AvatarFallback className="bg-muted text-foreground text-xl">
                                            {conv.username?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 border-4 border-background rounded-full" title="Online" />
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <span className={`font-medium truncate ${conv.unreadCount > 0 ? 'text-primary font-bold' : 'text-foreground'}`}>
                                            {conv.username || 'User'}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
                                            {conv.lastMessage?.createdAt && formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false, locale: vi })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <p className={`text-[13px] truncate ${conv.unreadCount > 0 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                            {conv.lastMessage?.sender === 'admin' ? 'Bạn: ' : ''}{conv.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
                                        </p>
                                        {conv.unreadCount > 0 && <div className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
                {selectedUser ? (
                    <>
                        {/* Fixed Chat Header */}
                        <div className="shrink-0 h-[60px] px-4 border-b border-border flex items-center justify-between shadow-sm bg-background">
                            <div className="flex items-center gap-3 cursor-pointer hover:bg-muted p-1 rounded-lg transition-colors">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedUser.image} />
                                    <AvatarFallback className="bg-muted">{selectedUser.username?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground leading-none">{selectedUser.username}</h3>
                                    <span className="text-[11px] text-muted-foreground">Đang hoạt động</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-primary hover:bg-muted rounded-full">
                                    <Phone className="h-5 w-5 fill-current" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-primary hover:bg-muted rounded-full">
                                    <Video className="h-5 w-5 fill-current" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-primary hover:bg-muted rounded-full">
                                    <Info className="h-5 w-5 fill-current" />
                                </Button>
                            </div>
                        </div>
                        
                        {/* Scrollable Messages Area */}
                        <div className="flex-1 min-h-0">
                            <ScrollArea className="h-full px-4" ref={scrollRef}>
                                <div className="py-6 flex flex-col gap-1">
                                {messages.map((msg, index) => {
                                    const isSent = msg.sender === 'admin';
                                    const showAvatar =  msg.sender !== 'admin' && (index === 0 || messages[index-1]?.sender !== msg.sender);
                                    const isLastInGroup = index === messages.length - 1 || messages[index+1]?.sender !== msg.sender;
                                    
                                    return (
                                        <div key={msg._id || index} className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} mb-0.5`}>
                                            <div className={`flex items-end gap-2 max-w-[70%] ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {!isSent ? (
                                                    <div className="w-8 shrink-0">
                                                        {showAvatar && (
                                                            <Avatar className="h-7 w-7">
                                                                <AvatarImage src={selectedUser.image} />
                                                                <AvatarFallback className="text-[10px] bg-muted">{selectedUser.username?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </div>
                                                ) : null}

                                                <div className="flex flex-col group relative">
                                                    {/* Quoted Message */}
                                                    {msg.replyTo && (
                                                        <div className={`text-[11px] px-3 py-1 rounded-t-xl mb-[-4px] opacity-60 ${
                                                            isSent ? 'bg-muted text-foreground self-end mr-1' : 'bg-secondary text-muted-foreground'
                                                        }`}>
                                                            {msg.replyTo.content}
                                                        </div>
                                                    )}

                                                    <div 
                                                        style={getBubbleRadius(msg, index, messages)}
                                                        className={`px-3 py-2 text-[15px] transition-all group-hover:brightness-95 ${
                                                            isSent 
                                                            ? 'bg-[#a333ff] text-white' 
                                                            : 'bg-muted text-foreground'
                                                        }`}
                                                    >
                                                        {msg.content}
                                                    </div>

                                                    {/* Hover Actions */}
                                                    <button 
                                                        onClick={() => setReplyTo(msg)}
                                                        className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-accent rounded-full bg-background/80 shadow-sm border border-border ${
                                                            isSent ? '-left-10' : '-right-10'
                                                        }`}
                                                        title="Trả lời"
                                                    >
                                                        <Reply className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </button>
                                                </div>
                                            </div>
                                            {isLastInGroup && isSent && (
                                                 <span className="text-[10px] text-muted-foreground mt-1 mr-2 italic">
                                                    Đã gửi {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                 </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                        </div>

                        {/* Fixed Input Area */}
                        <div className="shrink-0 p-3 bg-background border-t">
                            {replyTo && (
                                <div className="mx-2 mb-2 flex items-center justify-between text-[11px] bg-secondary px-3 py-2 rounded-t-2xl border-b border-border">
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-muted-foreground">Đang trả lời {replyTo.sender === 'admin' ? 'chính mình' : selectedUser.username}</span>
                                        <span className="truncate text-foreground italic">{replyTo.content}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-muted" onClick={() => setReplyTo(null)}>
                                        <X className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <div className="flex items-center mr-1">
                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-muted rounded-full h-9 w-9">
                                        <PlusCircle className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-muted rounded-full h-9 w-9">
                                        <ImageIcon className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-muted rounded-full h-9 w-9">
                                        <Sticker className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-muted rounded-full h-9 w-9">
                                        <Gift className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="flex-1 bg-secondary rounded-full flex items-center px-3 py-1.5 min-h-[36px]">
                                    <form onSubmit={handleSendMessage} className="flex-1">
                                        <input 
                                            placeholder="Aa" 
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            className="w-full bg-transparent border-none focus:outline-none text-[15px] text-foreground placeholder:text-muted-foreground"
                                        />
                                    </form>
                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-transparent h-7 w-7">
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="flex items-center ml-1">
                                    {replyMessage.trim() ? (
                                        <Button 
                                            onClick={handleSendMessage} 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-primary hover:bg-muted rounded-full h-9 w-9"
                                        >
                                            <Send className="h-5 w-5 fill-current" />
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="icon" className="text-primary hover:bg-muted rounded-full h-9 w-9">
                                            <ThumbsUp className="h-5 w-5 fill-current" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <Send className="h-10 w-10 text-primary opacity-50" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Bắt đầu cuộc trò chuyện</h2>
                        <p className="text-muted-foreground max-w-[300px]">Chọn một người từ danh sách bên trái để bắt đầu trao đổi tin nhắn.</p>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default AdminChat;
