import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null); // Track message being replied to
    const [unreadCount, setUnreadCount] = useState(0);
    const scrollRef = useRef(null);
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user')); 
    const intervalRef = useRef(null);

    const fetchMessages = useCallback(async () => {
        if (!token || !user?._id) return;
        try {
            const res = await axios.get(`${API_URL}/api/message/list?userId=${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMessages(res.data.data);
                const unread = res.data.data.filter(m => m.sender === 'admin' && !m.isRead).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }, [API_URL, token, user?._id]);

    const markAsRead = useCallback(async () => {
        if (!token || !user?._id) return;
        if (unreadCount > 0 && isOpen) {
            try {
                await axios.post(`${API_URL}/api/message/read`, 
                    { userId: user._id, sender: 'user' }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUnreadCount(0);
            } catch (error) {
                console.error("Error marking read:", error);
            }
        }
    }, [API_URL, token, user?._id, unreadCount, isOpen]);

    useEffect(() => {
        if (!token) return;

        if (isOpen) {
            setTimeout(() => {
                fetchMessages();
                markAsRead();
            }, 0);
            intervalRef.current = setInterval(fetchMessages, 1000); 
        } else {
            setTimeout(() => fetchMessages(), 0);
            intervalRef.current = setInterval(fetchMessages, 3000);
        }

        return () => clearInterval(intervalRef.current);
    }, [isOpen, fetchMessages, markAsRead, token]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user?._id) return;

        try {
            const tempMessage = {
                _id: Date.now(),
                content: newMessage,
                sender: 'user',
                userId: user._id,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempMessage]);
            setNewMessage('');

            await axios.post(`${API_URL}/api/message/send`, 
                { userId: user._id, sender: 'user', content: newMessage, replyTo: replyTo?._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setReplyTo(null); // Clear reply after sending
            
            fetchMessages(); 
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Gửi tin nhắn thất bại");
        }
    };

    if (!token) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
             {isOpen && (
                <Card className="w-96 h-[500px] shadow-xl mb-4 flex flex-col animate-in fade-in slide-in-from-bottom-5">
                    <CardHeader className="p-3 border-b bg-primary text-primary-foreground rounded-t-lg flex flex-row justify-between items-center">
                        <div className="font-semibold flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Hỗ trợ trực tuyến
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/90" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.map((msg, index) => (
                                    <div key={msg._id || index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} group`}>
                                        <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <Avatar className="h-8 w-8 mt-1 shrink-0">
                                                <AvatarImage src={msg.sender === 'user' ? user.image : '/admin-avatar.png'} />
                                                <AvatarFallback>{msg.sender === 'user' ? 'U' : 'A'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-1">
                                                {/* Quoted Message */}
                                                {msg.replyTo && (
                                                    <div className={`text-xs p-2 rounded-md mb-1 opacity-80 border-l-2 ${
                                                        msg.sender === 'user' ? 'bg-primary/20 border-primary-foreground' : 'bg-muted/80 border-primary'
                                                    }`}>
                                                        <span className="font-bold block">{msg.replyTo.sender === 'user' ? 'Bạn' : 'Admin'}</span>
                                                        <span className="line-clamp-1">{msg.replyTo.content}</span>
                                                    </div>
                                                )}

                                                <div className={`rounded-2xl px-3 py-2 text-sm relative group/msg ${
                                                    msg.sender === 'user' 
                                                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                                                    : 'bg-muted rounded-bl-none'
                                                }`}>
                                                    {msg.content}
                                                    
                                                    {/* Reply Button on Hover */}
                                                    <button 
                                                        onClick={() => setReplyTo(msg)}
                                                        className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded-full ${
                                                            msg.sender === 'user' ? '-left-8' : '-right-8'
                                                        }`}
                                                        title="Trả lời"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px] text-muted-foreground">reply</span>
                                                    </button>
                                                </div>
                                                
                                                {/* Timestamp */}
                                                <span className={`text-[10px] text-muted-foreground px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground text-sm mt-10">
                                        Chat với admin để được hỗ trợ.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-2 border-t flex-col items-stretch gap-2">
                        {replyTo && (
                            <div className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded-lg border-l-2 border-primary">
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-semibold">Đang trả lời {replyTo.sender === 'user' ? 'chính mình' : 'Admin'}:</span>
                                    <span className="truncate text-muted-foreground">{replyTo.content}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyTo(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                            <Input 
                                placeholder="Nhập tin nhắn..." 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            <Button 
                onClick={() => setIsOpen(!isOpen)} 
                className="rounded-full h-12 w-12 shadow-lg relative"
                size="icon"
            >
                {isOpen ? <X /> : <MessageCircle />}
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </Button>
        </div>
    );
};

export default ChatWidget;
