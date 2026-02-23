import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@/api/base44Client';
import {
    CheckCircle, XCircle, Clock, Users, Loader2,
    ChevronDown, Video, Play, StopCircle, Calendar, Link2
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { useToast } from '@/Components/ui/use-toast';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600', icon: XCircle },
};

const TICKET_TYPES = ['general', 'vip', 'premium', 'student', 'speaker'];

export default function HostRequests() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const eventId = searchParams.get('eventId');
    const user = api.auth.me();

    // ── Fetch host's events ──────────────────────────────────
    const { data: myEvents = [], isLoading: eventsLoading } = useQuery({
        queryKey: ['myEvents'],
        queryFn: api.events.myEvents,
    });

    const [selectedEventId, setSelectedEventId] = useState(eventId || '');
    const activeEventId = selectedEventId || myEvents[0]?.id || '';

    // ── Fetch requests for selected event ───────────────────
    const { data: requests = [], isLoading: reqLoading, refetch } = useQuery({
        queryKey: ['requests', activeEventId],
        queryFn: () => api.requests.forEvent(activeEventId),
        enabled: !!activeEventId,
    });

    const activeEvent = myEvents.find(e => e.id === activeEventId);

    // ── Update request mutation ──────────────────────────────
    const updateMutation = useMutation({
        mutationFn: ({ id, status, ticket_type }) =>
            api.requests.updateStatus(id, status, ticket_type),
        onSuccess: (_, { status }) => {
            toast({ title: `Request ${status}`, description: `The request has been ${status}.` });
            queryClient.invalidateQueries(['requests', activeEventId]);
        },
        onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    // ── Start event mutation ─────────────────────────────────
    const startMutation = useMutation({
        mutationFn: ({ id, zoomData }) => api.events.start(id, zoomData),
        onSuccess: () => {
            toast({ title: '🎉 Event Started!', description: 'Participants can now join.' });
            queryClient.invalidateQueries(['myEvents']);
        },
        onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const endMutation = useMutation({
        mutationFn: (id) => api.events.end(id),
        onSuccess: () => {
            toast({ title: 'Event Ended', description: 'The event has been marked as completed.' });
            queryClient.invalidateQueries(['myEvents']);
        },
    });

    // ── Zoom start modal ─────────────────────────────────────
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [zoomForm, setZoomForm] = useState({ zoom_meeting_id: '', zoom_password: '', zoom_meeting_url: '' });
    const [zoomLoading, setZoomLoading] = useState(false);

    const handleStart = async () => {
        setZoomLoading(true);
        try {
            const zoomResp = await api.zoom.createMeeting({
                topic: activeEvent?.title,
                startTime: activeEvent?.start_date,
                duration: 60
            });
            await startMutation.mutateAsync({
                id: activeEventId,
                zoomData: {
                    zoom_meeting_url: zoomResp.meeting_url,
                    zoom_meeting_id: String(zoomResp.meeting_id),
                    zoom_password: zoomResp.password || ''
                }
            });
        } catch {
            // Auto-generate failed → show manual entry modal
            setZoomLoading(false);
            setShowZoomModal(true);
        } finally {
            setZoomLoading(false);
        }
    };

    const handleManualStart = async () => {
        setZoomLoading(true);
        try {
            await startMutation.mutateAsync({
                id: activeEventId,
                zoomData: {
                    zoom_meeting_url: zoomForm.zoom_meeting_url ||
                        (zoomForm.zoom_meeting_id ? `https://zoom.us/j/${zoomForm.zoom_meeting_id}` : ''),
                    zoom_meeting_id: zoomForm.zoom_meeting_id,
                    zoom_password: zoomForm.zoom_password
                }
            });
            setShowZoomModal(false);
        } catch (err) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setZoomLoading(false);
        }
    };

    const handleStartWithoutZoom = async () => {
        await startMutation.mutateAsync({ id: activeEventId, zoomData: {} });
        setShowZoomModal(false);
    };


    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedCount = requests.filter(r => r.status === 'approved').length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <DashboardHeader user={user} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Join Requests</h1>
                        <p className="text-gray-500 mt-1">Review and manage attendee requests for your events</p>
                    </div>

                    {/* Event Selector */}
                    {myEvents.length > 1 && (
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Select Event</label>
                            <div className="relative w-72">
                                <select
                                    value={activeEventId}
                                    onChange={e => setSelectedEventId(e.target.value)}
                                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    {myEvents.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {activeEvent && (
                        <>
                            {/* Event Control Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-bold text-gray-900 text-lg">{activeEvent.title}</h2>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        {activeEvent.start_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(activeEvent.start_date).toLocaleString('en-IN')}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1"><Users className="w-4 h-4" />{approvedCount} approved</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{pendingCount} pending</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {activeEvent.is_started ? (
                                        <Button onClick={() => endMutation.mutate(activeEventId)}
                                            variant="outline" className="border-red-200 text-red-600 hover:bg-red-50"
                                            disabled={endMutation.isPending}>
                                            <StopCircle className="w-4 h-4 mr-2" /> End Event
                                        </Button>
                                    ) : (
                                        <Button onClick={handleStart}
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                            disabled={startMutation.isPending || zoomLoading}>
                                            {(startMutation.isPending || zoomLoading)
                                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting...</>
                                                : <><Play className="w-4 h-4 mr-2" />Start Event</>}
                                        </Button>
                                    )}
                                    {activeEvent.is_started && activeEvent.zoom_meeting_url && (
                                        <a href={activeEvent.zoom_meeting_url} target="_blank" rel="noreferrer">
                                            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                                <Video className="w-4 h-4 mr-2" /> Join Zoom
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Requests List */}
                            {reqLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
                                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No requests yet</p>
                                    <p className="text-sm mt-1">Share the event link to get attendees</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {requests.map(req => {
                                        const cfg = STATUS_CONFIG[req.status];
                                        const Icon = cfg.icon;
                                        return (
                                            <div key={req.id}
                                                className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col md:flex-row md:items-center gap-4">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {req.user_name?.charAt(0).toUpperCase() || '?'}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900">{req.user_name}</p>
                                                    <p className="text-sm text-gray-500">{req.user_email}</p>
                                                    {req.message && (
                                                        <p className="text-sm text-gray-600 mt-1 italic">"{req.message}"</p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(req.created_at).toLocaleString('en-IN')}
                                                    </p>
                                                </div>

                                                {/* Status + Actions */}
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.color}`}>
                                                        <Icon className="w-3.5 h-3.5" /> {cfg.label}
                                                    </span>

                                                    {req.status === 'pending' && (
                                                        <>
                                                            <select
                                                                defaultValue="general"
                                                                id={`ticket-${req.id}`}
                                                                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                                                {TICKET_TYPES.map(t => (
                                                                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                                                ))}
                                                            </select>
                                                            <Button size="sm"
                                                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-3"
                                                                disabled={updateMutation.isPending}
                                                                onClick={() => {
                                                                    const ticket = document.getElementById(`ticket-${req.id}`).value;
                                                                    updateMutation.mutate({ id: req.id, status: 'approved', ticket_type: ticket });
                                                                }}>
                                                                Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline"
                                                                className="border-red-200 text-red-600 hover:bg-red-50 text-xs px-3"
                                                                disabled={updateMutation.isPending}
                                                                onClick={() => updateMutation.mutate({ id: req.id, status: 'rejected' })}>
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* ── Zoom Manual Entry Modal ──────────────────────── */}
            {showZoomModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Video className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Add Zoom Meeting</h3>
                                    <p className="text-sm text-gray-500">Enter your Zoom meeting details</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Meeting ID *</label>
                                <Input
                                    placeholder="e.g. 123 456 7890"
                                    value={zoomForm.zoom_meeting_id}
                                    onChange={e => setZoomForm(p => ({ ...p, zoom_meeting_id: e.target.value.replace(/\s/g, '') }))}
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Password <span className="text-gray-400 font-normal">(optional)</span></label>
                                <Input
                                    placeholder="Meeting password"
                                    value={zoomForm.zoom_password}
                                    onChange={e => setZoomForm(p => ({ ...p, zoom_password: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Meeting URL <span className="text-gray-400 font-normal">(optional)</span></label>
                                <Input
                                    placeholder="https://zoom.us/j/..."
                                    value={zoomForm.zoom_meeting_url}
                                    onChange={e => setZoomForm(p => ({ ...p, zoom_meeting_url: e.target.value }))}
                                />
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                                <strong>💡 Tip:</strong> The Meeting ID lets us embed Zoom directly in attendees' browsers so they don't need to switch apps.
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex flex-col gap-2">
                            <Button
                                onClick={handleManualStart}
                                disabled={!zoomForm.zoom_meeting_id || zoomLoading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white">
                                {zoomLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting...</> : <><Play className="w-4 h-4 mr-2" />Start with Zoom</>}
                            </Button>
                            <Button variant="outline" onClick={handleStartWithoutZoom} disabled={zoomLoading}
                                className="w-full text-gray-500">
                                Start without Zoom
                            </Button>
                            <button onClick={() => setShowZoomModal(false)}
                                className="text-sm text-gray-400 hover:text-gray-600 text-center mt-1">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
