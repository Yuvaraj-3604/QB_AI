import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    ArrowLeft,
    Send,
    HelpCircle,
    MessageSquare,
    Mail,
    Phone,
    FileText,
    Check
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { api } from '@/api/base44Client';

export default function HelpSupport() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        subject: '',
        category: '',
        message: ''
    });
    const [myTickets, setMyTickets] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const user = api.auth.me();

    useEffect(() => {
        if (user) fetchSupportHistory();
    }, []);

    const fetchSupportHistory = async () => {
        setLoadingHistory(true);
        try {
            // We'll add this to base44Client
            const data = await api.support.getMyRequests();
            setMyTickets(data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.support.sendRequest(formData);
            setSubmitted(true);
            setFormData({ subject: '', category: '', message: '' });
            fetchSupportHistory(); // Refresh history
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error('Support submission failed:', error);
            alert('Failed to send support request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <DashboardHeader user={user} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

                <main className="p-6 max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
                        <p className="text-gray-500 mt-2">Get assistance with your QuestBridge account and events.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Info Cards */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Email Support</h3>
                                <p className="text-sm text-gray-500 mt-1 mb-3">Drop us an email. We usually reply within 24 hours.</p>
                                <a href="mailto:admin.qb.ai@gmail.com" className="text-sm text-cyan-600 font-medium hover:underline">
                                    admin.qb.ai@gmail.com
                                </a>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Documentation</h3>
                                <p className="text-sm text-gray-500 mt-1 mb-3">Browse our detailed guides and API documentation.</p>
                                <a href="https://docs.questbridge.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 font-medium hover:underline">
                                    View Documentation
                                </a>
                            </div>
                        </div>

                        {/* Support Form */}
                        <div className="md:col-span-2">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Send us a message</h2>
                                </div>

                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3"
                                    >
                                        <Check className="w-5 h-5 mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">Support Request Sent</h4>
                                            <p className="text-sm">We've received your message and our team will get back to you shortly.</p>
                                        </div>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">What do you need help with?</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="account">Account & Billing</SelectItem>
                                                    <SelectItem value="events">Event Management</SelectItem>
                                                    <SelectItem value="attendees">Attendee Issues</SelectItem>
                                                    <SelectItem value="zoom">Zoom Integration</SelectItem>
                                                    <SelectItem value="technical">Technical Bug</SelectItem>
                                                    <SelectItem value="other">Other Query</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Brief summary of your issue"
                                                value={formData.subject}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Detailed Description</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Please provide as much detail as possible to help us assist you faster..."
                                            className="min-h-[150px] resize-y"
                                            value={formData.message}
                                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <Button
                                            type="submit"
                                            className="bg-cyan-500 hover:bg-cyan-600 text-white min-w-[150px]"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Request
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Support History Section */}
                    <div className="mt-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">My Support History</h2>
                        </div>

                        {loadingHistory ? (
                            <div className="text-center py-12">
                                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
                                <p className="text-gray-500 mt-4 font-medium">Loading your requests...</p>
                            </div>
                        ) : myTickets.length > 0 ? (
                            <div className="space-y-4">
                                {myTickets.map(ticket => (
                                    <div key={ticket.id} className={`p-6 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${ticket.status === 'resolved' ? 'border-green-100' : 'border-gray-100'}`}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {ticket.status}
                                                </div>
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase">
                                                {ticket.category}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">{ticket.subject}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 md:line-clamp-none">{ticket.message}</p>

                                        {ticket.reply && (
                                            <div className="mt-4 p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs font-bold text-cyan-700">Official Admin Response</span>
                                                </div>
                                                <p className="text-sm text-cyan-800 italic">{ticket.reply}</p>
                                                <div className="text-[10px] text-cyan-600 mt-2 font-medium">
                                                    Replied on {new Date(ticket.replied_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">You haven't submitted any support requests yet.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
