import React, { useState } from 'react';
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
    FileText
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call for support ticket
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ subject: '', category: '', message: '' });

            // Reset success message after 5 seconds
            setTimeout(() => setSubmitted(false), 5000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

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
                                <a href="mailto:support@questbridge.ai" className="text-sm text-cyan-600 font-medium hover:underline">
                                    support@questbridge.ai
                                </a>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Documentation</h3>
                                <p className="text-sm text-gray-500 mt-1 mb-3">Browse our detailed guides and API documentation.</p>
                                <a href="#" className="text-sm text-purple-600 font-medium hover:underline">
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
                </main>
            </div>
        </div>
    );
}
