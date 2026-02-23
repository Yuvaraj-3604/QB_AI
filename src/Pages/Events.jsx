import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import {
  Calendar, MapPin, Users, Clock, Tag, Globe, Search,
  ChevronRight, Loader2, CheckCircle, XCircle, Send
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';

// ── Join Request Modal ─────────────────────────────────────────
function JoinModal({ event, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.requests.send(event.id, message);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const user = api.auth.me();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="relative h-32 rounded-t-2xl overflow-hidden">
          {event.cover_image ? (
            <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-end p-4">
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{event.title}</h2>
              <p className="text-white/80 text-sm">{event.host_name || 'Host'}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 text-lg leading-none">
            ×
          </button>
        </div>

        <div className="p-5">
          {/* Event meta */}
          <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
            {event.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {event.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" /> {event.is_free ? 'Free' : `₹${event.ticket_price}`}
            </span>
          </div>

          {error && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Joining as</label>
              <Input value={`${user?.username || ''} (${user?.email || ''})`} disabled
                className="bg-gray-50 text-gray-600 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Message to host <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Why do you want to join this event?"
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              />
            </div>
            <Button type="submit" disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Send className="w-4 h-4 mr-2" />Send Join Request</>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Main Events Page ───────────────────────────────────────────
export default function Events() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(null);
  const user = api.auth.me();
  const isHost = user?.role === 'host';

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: api.events.list,
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ['myRequests'],
    queryFn: api.requests.myRequests,
    enabled: !isHost && !!user,
  });

  const requestedEventIds = new Set(myRequests.map(r => r.event_id));

  const filtered = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = {
    published: 'bg-green-100 text-green-700',
    ongoing: 'bg-blue-100 text-blue-700',
    draft: 'bg-gray-100 text-gray-600',
    completed: 'bg-slate-100 text-slate-500',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <DashboardHeader user={user} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-500 mt-1">
                {isHost ? 'Create and manage events' : 'Discover and join events'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search events..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64 bg-white" />
              </div>
              {isHost && (
                <Button onClick={() => navigate('/CreateEvent')}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  + Create Event
                </Button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {joinSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Join request sent!</p>
                <p className="text-green-700 text-sm">Your request has been sent to the host of <strong>{joinSuccess}</strong>. You'll be notified once approved.</p>
              </div>
              <button onClick={() => setJoinSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">✕</button>
            </div>
          )}

          {/* Events Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm mt-1">
                {isHost ? 'Create your first event to get started.' : 'Check back later for upcoming events.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(event => {
                const hasRequested = requestedEventIds.has(event.id);
                const isOwner = isHost && event.host_id === user?.id;

                return (
                  <div key={event.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                    {/* Cover */}
                    <div className="h-44 relative overflow-hidden">
                      {event.cover_image ? (
                        <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400/80 to-purple-500/80 flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-white/60" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[event.status] || statusColor.draft}`}>
                          {event.status}
                        </span>
                      </div>
                      {event.is_started && (
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white animate-pulse">
                            🔴 LIVE
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">{event.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">by {event.host_name || 'Unknown Host'}</p>

                      <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                        {event.start_date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                            {new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-cyan-500" /> {event.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-500" /> Max {event.max_attendees} attendees
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-cyan-500" />
                          {event.is_free ? <span className="text-green-600 font-semibold">Free</span> : `₹${event.ticket_price}`}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-auto">
                        {isOwner ? (
                          <Button variant="outline" size="sm" className="w-full"
                            onClick={() => navigate(`/EventDetails?id=${event.id}`)}>
                            Manage Event <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : hasRequested ? (
                          <Button disabled size="sm" className="w-full bg-gray-100 text-gray-400 cursor-not-allowed">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Request Sent
                          </Button>
                        ) : (
                          <Button size="sm"
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                            onClick={() => setSelectedEvent(event)}
                            disabled={event.status === 'cancelled' || event.status === 'completed'}>
                            Interested to Join
                          </Button>
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

      {/* Join Modal */}
      {selectedEvent && (
        <JoinModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={() => {
            setJoinSuccess(selectedEvent.title);
            setSelectedEvent(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
