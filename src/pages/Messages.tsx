import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, Send, MessageCircle, Loader2, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

export default function Messages() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [body, setBody] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [usePolling, setUsePolling] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    const { data: messages = [], isLoading, refetch } = useQuery({
        queryKey: ['messages'],
        queryFn: async () => {
            const res = await apiFetch('/api/messages');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        refetchInterval: usePolling ? 30000 : false // poll every 30s if WS fails
    });

    useEffect(() => {
        if (!user) return;
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            setUsePolling(true);
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        let connected = false;

        const sub = supabase.channel('messages-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload: any) => {
                    if (payload.new.to_user_id === user.id) {
                        refetch();
                        toast.success("New message received");
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    connected = true;
                    setUsePolling(false);
                }
            });

        const timer = setTimeout(() => {
            if (!connected) setUsePolling(true);
        }, 5000);

        return () => {
            clearTimeout(timer);
            supabase.removeChannel(sub);
        };
    }, [user, refetch]);

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await apiFetch('/api/users');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    // Get list of conversation partners
    const otherUsers = users.filter((u: any) => u.id !== user?.id);

    // Auto-select first user
    useEffect(() => {
        if (otherUsers.length > 0 && !selectedUserId) {
            setSelectedUserId(user?.role === 'admin' ? otherUsers[0]?.id : 'admin-1');
        }
    }, [otherUsers.length]);

    // Filter messages for selected conversation
    const conversation = messages.filter((m: any) =>
        (m.fromUserId === user?.id && m.toUserId === selectedUserId) ||
        (m.fromUserId === selectedUserId && m.toUserId === user?.id)
    ).reverse();

    const selectedConvoUser = users.find((u: any) => u.id === selectedUserId);

    const sendMutation = useMutation({
        mutationFn: async () => {
            const res = await apiFetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify({ toUserId: selectedUserId, body })
            });
            if (!res.ok) throw new Error("Failed to send");
            return res.json();
        },
        onSuccess: () => {
            setBody("");
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        },
        onError: () => toast.error("Failed to send message")
    });

    const handleSend = () => {
        if (!body.trim() || !selectedUserId) return;
        sendMutation.mutate();
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation.length]);

    // Mark messages as read when viewing the conversation
    useEffect(() => {
        if (!selectedUserId || !messages.length) return;
        const unreadIds = messages
            .filter((m: any) => m.fromUserId === selectedUserId && m.toUserId === user?.id && !m.isRead)
            .map((m: any) => m.id);

        if (unreadIds.length > 0) {
            Promise.all(unreadIds.map(id => apiFetch(`/api/messages/${id}/read`, { method: 'PATCH' })))
                .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['messages'] });
                })
                .catch(err => console.error("Failed to mark read:", err));
        }
    }, [selectedUserId, messages, user?.id, queryClient]);

    return (
        <MobileLayout>
            <header className="bg-card border-b border-border px-5 pt-6 pb-4 flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-heading font-bold text-foreground">Messages</h1>
                    {selectedConvoUser && (
                        <p className="text-xs text-muted-foreground">{selectedConvoUser.name}</p>
                    )}
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    <MessageCircle className="h-4 w-4" />
                </div>
            </header>

            {/* Conversation selector (admin sees all reps; reps only see admin) */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-border/50">
                {otherUsers.map((u: any) => (
                    <button
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${selectedUserId === u.id ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'}`}
                    >
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black font-heading">
                            {u.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="text-[10px] font-medium text-foreground">{u.name.split(' ')[0]}</span>
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-28">
                {isLoading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
                {conversation.length === 0 && !isLoading && (
                    <div className="text-center py-16">
                        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                )}
                {conversation.map((msg: any) => {
                    const isMine = msg.fromUserId === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border border-border/50 rounded-bl-sm'}`}>
                                {!isMine && (
                                    <p className="text-[10px] font-bold text-primary/70 mb-1">{msg.fromName}</p>
                                )}
                                <p className="text-sm leading-relaxed">{msg.body}</p>
                                <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                    <span className="text-[9px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isMine && <CheckCheck className="h-3 w-3" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* Input Box */}
            <div className="fixed bottom-16 left-0 right-0 max-w-[430px] mx-auto px-4 py-3 bg-card border-t border-border/50">
                <div className="flex gap-2 items-end">
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 resize-none bg-muted rounded-2xl px-4 py-2.5 text-sm font-body outline-none focus:ring-2 focus:ring-primary/40 max-h-32"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!body.trim() || sendMutation.isPending}
                        className="h-10 w-10 rounded-full bg-primary text-primary-foreground p-0 shrink-0"
                    >
                        {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </MobileLayout>
    );
}
