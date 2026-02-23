import React, { useState } from 'react';
import { api } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Users, TrendingUp, Clock, Plus, ArrowRight, Download
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import StatsCard from '@/Components/Dashboard/StatsCard';
import EventCard from '@/Components/Dashboard/EventCard';
import { Skeleton } from '@/Components/ui/skeleton';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const user = api.auth.me();
  const isHost = user?.role === 'host';

  // ── Host: fetch MY events ──────────────────────────────────
  const { data: myEvents = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['myEvents'],
    queryFn: api.events.myEvents,
    enabled: isHost,
  });

  // ── Host: requests across all events for counting ──────────
  const { data: hostRequests = [] } = useQuery({
    queryKey: ['hostRequests'],
    queryFn: api.requests.allForHost,
    enabled: isHost,
  });

  // ── Attendee: total requests for counting ──────────
  const { data: myRequests = [] } = useQuery({
    queryKey: ['myRequests'],
    queryFn: api.requests.myRequests,
    enabled: !isHost,
  });

  const requestsCount = isHost ? hostRequests.length : myRequests.length;

  // Registration count per event — join_requests counts
  // We'll call forEvent individually; for the dashboard just show participant count globally
  const stats = [
    {
      title: isHost ? 'My Events' : 'Available Events',
      value: myEvents.length,
      icon: CalendarDays,
      trend: 'up', trendValue: 12, color: 'cyan'
    },
    {
      title: isHost ? 'Total Requests' : 'My Requests',
      value: requestsCount,
      icon: Users,
      trend: 'up', trendValue: 24, color: 'purple'
    },
    {
      title: 'Active / Live Events',
      value: myEvents.filter(e => e.status === 'published' || e.status === 'ongoing' || e.is_started).length,
      icon: TrendingUp,
      trend: 'up', trendValue: 8, color: 'green'
    },
    {
      title: 'Upcoming Events',
      value: myEvents.filter(e => e.start_date && new Date(e.start_date) > new Date()).length,
      icon: Clock,
      trend: 'up', trendValue: 5, color: 'orange'
    }
  ];

  // Download helpers — initiate with auth token
  const downloadCSV = (url, filename) => {
    const token = localStorage.getItem('authToken');
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => {
        if (!r.ok) throw new Error('No data available yet.');
        return r.blob();
      })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      })
      .catch(err => alert(err.message));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <DashboardHeader user={user} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6">
          {/* Welcome */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Welcome back{user?.username ? `, ${user.username.split(' ')[0]}` : ''}! 👋
              </h1>
              <p className="text-gray-500">
                {isHost ? "Here's your event management overview." : "Browse and join events below."}
              </p>
            </div>
            {/* Quick report downloads */}
            {isHost && (
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm"
                  onClick={() => downloadCSV(`${BASE_URL}/api/download/participants`, 'participants.csv')}
                  className="text-cyan-700 border-cyan-200 hover:bg-cyan-50">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Participants CSV
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => downloadCSV(`${BASE_URL}/api/download/leaderboard`, 'leaderboard.csv')}
                  className="text-purple-700 border-purple-200 hover:bg-purple-50">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Leaderboard CSV
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => downloadCSV(`${BASE_URL}/api/download/engagement`, 'engagement.csv')}
                  className="text-green-700 border-green-200 hover:bg-green-50">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Engagement CSV
                </Button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => <StatsCard key={i} {...stat} />)}
          </div>

          {/* Events Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isHost ? 'Your Events' : 'Recent Events'}
              </h2>
              <div className="flex items-center gap-3">
                <Link to="/Events">
                  <Button variant="ghost" className="text-cyan-600">
                    View All <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                {isHost && (
                  <Link to="/CreateEvent">
                    <Button className="bg-cyan-500 hover:bg-cyan-600">
                      <Plus className="w-4 h-4 mr-2" /> Create Event
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6">
                    <Skeleton className="h-48 mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : myEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isHost ? 'No events yet' : 'No events available'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isHost ? 'Create your first event to get started' : 'Check the Events page to see what\'s available'}
                </p>
                {isHost && (
                  <Link to="/CreateEvent">
                    <Button className="bg-cyan-500 hover:bg-cyan-600">
                      <Plus className="w-4 h-4 mr-2" /> Create Your First Event
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.slice(0, 6).map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    registrationCount={event._requestCount || 0}
                    onDeleted={refetchEvents}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
