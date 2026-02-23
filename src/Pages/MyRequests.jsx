import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import { Calendar, MapPin, Clock, Video, CheckCircle, XCircle, Loader2, Tag, ChevronRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';

const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Approved', bg: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', bg: 'bg-red-100 text-red-600' },
};

export default function MyRequests() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const user = api.auth.me();

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['myRequests'],
        queryFn: api.requests.myRequests,
        refetchInterval: 15000,
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <DashboardHeader user={user} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
                        <p className="text-gray-500 mt-1">Track your join requests and access approved events</p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium text-gray-600">No event requests yet</p>
                            <p className="text-sm text-gray-400 mt-1">Browse events and send join requests</p>
                            <Button onClick={() => navigate('/Events')} className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white">
                                Browse Events
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map(req => {
                                const event = req.events;
                                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                                const canJoin = req.status === 'approved' && event?.is_started;

                                return (
                                    <div key={req.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row">
                                        {/* Cover */}
                                        <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0 relative overflow-hidden">
                                            {event?.cover_image ? (
                                                <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                                    <Calendar className="w-10 h-10 text-white/60" />
                                                </div>
                                            )}
                                            {event?.is_started && (
                                                <div className="absolute top-2 left-2">
                                                    <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900">{event?.title || 'Event'}</h3>
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">by {event?.host_name}</p>
                                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                                    {event?.start_date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                                                            {new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                    {event?.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5 text-cyan-500" /> {event.location}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Tag className="w-3.5 h-3.5 text-cyan-500" /> {req.ticket_type}
                                                    </span>
                                                </div>
                                                {req.message && <p className="text-xs text-gray-400 mt-2 italic">Your message: "{req.message}"</p>}
                                            </div>

                                            {/* Action */}
                                            <div className="flex-shrink-0">
                                                {req.status === 'approved' ? (
                                                    <Button
                                                        onClick={() => navigate(`/EventParticipation?eventId=${event?.id}`)}
                                                        className={`${event?.is_started ? 'bg-blue-500 hover:bg-blue-600' : 'bg-cyan-500 hover:bg-cyan-600'} text-white`}>
                                                        {event?.is_started
                                                            ? <><Video className="w-4 h-4 mr-2" />Join Now</>
                                                            : <><Clock className="w-4 h-4 mr-2" />View Status</>}
                                                    </Button>
                                                ) : req.status === 'rejected' ? (
                                                    <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
                                                        <XCircle className="w-4 h-4" /> Request Rejected
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-yellow-600 text-sm font-medium">
                                                        <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} /> Waiting for approval
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
