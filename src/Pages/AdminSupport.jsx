import React, { useState, useEffect } from 'react';
import { api } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { MessageSquare, Clock, CheckCircle2, Send, User, LifeBuoy } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';

export default function AdminSupport() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const data = await api.admin.listTickets();
            setTickets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!reply.trim()) return;
        try {
            await api.admin.replyTicket(selectedTicket.id, reply);
            toast({ title: "Success", description: "Reply sent and ticket resolved." });
            setReply('');
            setSelectedTicket(null);
            fetchTickets();
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Support Queue...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Support Management</h1>
                <p className="text-muted-foreground">Manage help requests and respond to users</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tickets List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Ticket Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y max-h-[70vh] overflow-y-auto">
                            {tickets.map(ticket => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`w-full text-left p-4 hover:bg-accent transition-colors flex flex-col gap-1 ${selectedTicket?.id === ticket.id ? 'bg-accent' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <Badge variant={ticket.status === 'open' ? 'destructive' : 'secondary'}>
                                            {ticket.status}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="font-semibold text-sm line-clamp-1">{ticket.subject}</p>
                                    <p className="text-xs text-muted-foreground">{ticket.username}</p>
                                </button>
                            ))}
                            {tickets.length === 0 && <p className="p-8 text-center text-muted-foreground">No tickets found</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Ticket Detail & Reply */}
                <Card className="lg:col-span-2">
                    {selectedTicket ? (
                        <>
                            <CardHeader className="border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle>{selectedTicket.subject}</CardTitle>
                                    <Badge className="capitalize">{selectedTicket.category}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex gap-4 p-4 rounded-lg bg-muted/50 border">
                                    <User className="h-5 w-5 mt-1" />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{selectedTicket.username}</span>
                                            <span className="text-xs text-muted-foreground">({selectedTicket.email})</span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                                        <div className="text-[10px] text-muted-foreground mt-2">
                                            Submitted: {new Date(selectedTicket.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {selectedTicket.reply && (
                                    <div className="flex gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10 ml-8">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-bold text-primary text-sm">Admin Reply</span>
                                            <p className="text-sm italic">{selectedTicket.reply}</p>
                                            <div className="text-[10px] text-muted-foreground mt-2">
                                                Replied: {new Date(selectedTicket.replied_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedTicket.status === 'open' && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" /> Send Reply
                                        </h3>
                                        <Textarea
                                            placeholder="Type your response here..."
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            rows={5}
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handleReply} className="gap-2">
                                                <Send className="h-4 w-4" /> Resolve Ticket
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="h-full flex items-center justify-center p-12 text-muted-foreground">
                            <div className="text-center space-y-2">
                                <LifeBuoy className="h-12 w-12 mx-auto opacity-20" />
                                <p>Select a ticket from the queue to view details and reply</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
