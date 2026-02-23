import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import {
    Maximize2, Minimize2, Clock, Video, XCircle, Tag,
    ArrowLeft, Loader2, Gamepad2, ChevronLeft, ChevronRight,
    Calendar, MapPin, Users, Wifi, WifiOff, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import QuizGame from '@/Components/Engagement/QuizGame';
import ConnectDotsGame from '@/Components/Engagement/ConnectDotsGame';

// ── Zoom embed URL builder ────────────────────────────────────
function buildZoomEmbedUrl(meetingId, password, userName) {
    if (!meetingId) return null;
    const cleanId = String(meetingId).replace(/\s/g, '');
    const params = new URLSearchParams();
    if (password) params.set('pwd', password);
    if (userName) params.set('uname', encodeURIComponent(userName));
    return `https://zoom.us/wc/${cleanId}/join?${params.toString()}`;
}

// ── Game tab content ──────────────────────────────────────────
const GAMES = [
    { id: 'quiz', label: 'Quiz', component: QuizGame },
    { id: 'dots', label: 'Connect Dots', component: ConnectDotsGame },
];

function GamesPanel({ collapsed, onToggle }) {
    const [activeGame, setActiveGame] = useState('quiz');
    const ActiveComponent = GAMES.find(g => g.id === activeGame)?.component || QuizGame;

    return (
        <div className={`
            flex flex-col bg-slate-900 border-l border-slate-700
            transition-all duration-300
            ${collapsed ? 'w-0 overflow-hidden' : 'w-80 min-w-[20rem]'}
        `}>
            {/* Panel Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800 flex-shrink-0">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-semibold text-sm">Event Games</span>
                <button onClick={onToggle} className="ml-auto text-slate-400 hover:text-white transition-colors">
                    <PanelLeftOpen className="w-4 h-4" />
                </button>
            </div>

            {/* Game Selector */}
            <div className="flex border-b border-slate-700 flex-shrink-0">
                {GAMES.map(g => (
                    <button
                        key={g.id}
                        onClick={() => setActiveGame(g.id)}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-all uppercase tracking-wide ${activeGame === g.id
                                ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}>
                        {g.label}
                    </button>
                ))}
            </div>

            {/* Game Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-slate-800 rounded-xl overflow-hidden">
                    <ActiveComponent />
                </div>
            </div>

            {/* Leaderboard teaser */}
            <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 flex-shrink-0">
                <p className="text-xs text-slate-400 text-center">
                    🏆 Play games to earn points on the leaderboard!
                </p>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function EventParticipation() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // start collapsed for more space
    const [gamesPanelCollapsed, setGamesPanelCollapsed] = useState(false);
    const [zoomFullscreen, setZoomFullscreen] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const playgroundRef = useRef(null);
    const eventId = searchParams.get('eventId');
    const user = api.auth.me();

    const { data: participation, isLoading, error } = useQuery({
        queryKey: ['participation', eventId],
        queryFn: () => api.requests.participation(eventId),
        enabled: !!eventId,
        refetchInterval: 10000,
    });

    const event = participation?.events;

    // Native fullscreen for the entire playground
    const toggleNativeFullscreen = () => {
        if (!document.fullscreenElement) {
            playgroundRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handler = () => {
            setZoomFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const zoomEmbedUrl = event?.zoom_meeting_id
        ? buildZoomEmbedUrl(event.zoom_meeting_id, event.zoom_password, user?.username || user?.email)
        : null;

    // ── Loading ───────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mx-auto mb-3" />
                    <p className="text-slate-400">Loading event access...</p>
                </div>
            </div>
        );
    }

    // ── Access denied ─────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Access Pending</h2>
                    <p className="text-slate-400 mb-6">{error.message || 'Your request is being reviewed.'}</p>
                    <Button onClick={() => navigate('/MyRequests')}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white">
                        View My Requests
                    </Button>
                </div>
            </div>
        );
    }

    // ── Event not started — waiting room ────────────────────
    if (!event?.is_started) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                    <DashboardHeader user={user} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 max-w-lg w-full text-center shadow-2xl">
                            <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <Clock className="w-12 h-12 text-cyan-400" />
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">You're in the Waiting Room</h2>
                            <p className="text-slate-400 mb-2">
                                <strong className="text-white">{event?.title}</strong>
                            </p>
                            <p className="text-slate-500 text-sm mb-6">
                                The host will start the event soon. This page refreshes automatically every 10 seconds.
                            </p>
                            {event?.start_date && (
                                <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 rounded-full px-4 py-2 text-sm font-medium mb-8">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(event.start_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-1.5 mb-8">
                                {[0, 150, 300].map(d => (
                                    <div key={d} className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce"
                                        style={{ animationDelay: `${d}ms` }} />
                                ))}
                            </div>
                            {/* Play games while waiting */}
                            <div className="border-t border-slate-700 pt-6">
                                <p className="text-slate-400 text-sm mb-4">🎮 Play games while you wait!</p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-slate-900 rounded-xl p-3">
                                        <QuizGame />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── LIVE — Playground Interface ──────────────────────────
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Sidebar (collapsed by default for max space) */}
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className={`flex flex-col h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>

                {/* Top Bar */}
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border-b border-slate-700 flex-shrink-0 z-10">
                    <button onClick={() => navigate('/MyRequests')}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* Live badge */}
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-red-400 font-bold text-sm uppercase tracking-widest">LIVE</span>
                    </div>

                    <span className="text-white font-semibold text-sm truncate">{event?.title}</span>

                    <div className="ml-auto flex items-center gap-2">
                        {/* Toggle games panel */}
                        <button
                            onClick={() => setGamesPanelCollapsed(!gamesPanelCollapsed)}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all border border-slate-700">
                            <Gamepad2 className="w-3.5 h-3.5" />
                            {gamesPanelCollapsed ? 'Show Games' : 'Hide Games'}
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleNativeFullscreen}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all border border-slate-700">
                            {zoomFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                            {zoomFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </button>

                        <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                            <Wifi className="w-3.5 h-3.5" />
                            Connected
                        </div>
                    </div>
                </div>

                {/* Main Playground */}
                <div ref={playgroundRef} className="flex flex-1 overflow-hidden bg-slate-950">

                    {/* ── Zoom Panel ─────────────────────────── */}
                    <div className="flex-1 flex flex-col relative min-w-0">
                        {zoomEmbedUrl ? (
                            <>
                                {iframeError ? (
                                    /* Fallback if iframe blocked */
                                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-slate-900">
                                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                                            <Video className="w-10 h-10 text-blue-400" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg">Open Zoom Meeting</h3>
                                        <p className="text-slate-400 text-sm text-center max-w-sm">
                                            Your browser blocked the embedded meeting. Click below to open it in a new window, then return to play games here.
                                        </p>
                                        {event.zoom_password && (
                                            <div className="bg-slate-800 rounded-xl px-5 py-3 text-center border border-slate-700">
                                                <p className="text-slate-400 text-xs mb-1">Meeting Password</p>
                                                <p className="text-white font-mono font-bold text-lg">{event.zoom_password}</p>
                                            </div>
                                        )}
                                        <a href={event.zoom_meeting_url || zoomEmbedUrl} target="_blank" rel="noreferrer">
                                            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8">
                                                <Video className="w-4 h-4 mr-2" /> Launch Zoom
                                            </Button>
                                        </a>
                                    </div>
                                ) : (
                                    <iframe
                                        src={zoomEmbedUrl}
                                        className="flex-1 w-full h-full border-0"
                                        allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen"
                                        allowFullScreen
                                        title="Zoom Meeting"
                                        onError={() => setIframeError(true)}
                                        style={{ background: '#1a1a2e' }}
                                    />
                                )}

                                {/* Zoom info footer */}
                                <div className="flex items-center gap-4 px-4 py-2 bg-slate-900 border-t border-slate-700 text-xs text-slate-500 flex-shrink-0">
                                    <span className="flex items-center gap-1.5">
                                        <Video className="w-3.5 h-3.5 text-blue-400" />
                                        Meeting ID: <span className="text-slate-300 font-mono">{event.zoom_meeting_id}</span>
                                    </span>
                                    {event.zoom_password && (
                                        <span>Password: <span className="text-slate-300 font-mono">{event.zoom_password}</span></span>
                                    )}
                                    <a href={event.zoom_meeting_url} target="_blank" rel="noreferrer"
                                        className="ml-auto text-blue-400 hover:text-blue-300 font-medium">
                                        Open in Zoom App ↗
                                    </a>
                                </div>
                            </>
                        ) : (
                            /* No zoom meeting ID — show event info */
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-slate-900">
                                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
                                    <Video className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-white font-bold text-xl">Event is Live!</h3>
                                <p className="text-slate-400 text-center max-w-sm">
                                    The host has started this event but hasn't provided a Zoom meeting link yet.
                                </p>
                                {event?.zoom_meeting_url && (
                                    <a href={event.zoom_meeting_url} target="_blank" rel="noreferrer">
                                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                            <Video className="w-4 h-4 mr-2" /> Join via Zoom
                                        </Button>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Games Panel ────────────────────────── */}
                    {!gamesPanelCollapsed && (
                        <div className="w-80 min-w-[20rem] flex flex-col bg-slate-900 border-l border-slate-700 overflow-hidden">
                            {/* Panel header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800 flex-shrink-0">
                                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                                <span className="text-white font-semibold text-sm">Event Playground</span>
                                <button onClick={() => setGamesPanelCollapsed(true)}
                                    className="ml-auto text-slate-400 hover:text-white transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Games tabs */}
                            <GamesTabs />

                            {/* Footer */}
                            <div className="px-4 py-2.5 border-t border-slate-700 bg-slate-800/60 flex-shrink-0">
                                <p className="text-xs text-slate-500 text-center">
                                    🏆 Earn points · Climb the leaderboard
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Show games toggle (when collapsed) */}
                    {gamesPanelCollapsed && (
                        <button
                            onClick={() => setGamesPanelCollapsed(false)}
                            className="w-8 flex flex-col items-center justify-center gap-2 bg-slate-800 border-l border-slate-700 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        >
                            <Gamepad2 className="w-4 h-4" />
                            <ChevronLeft className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Games tabs sub-component ──────────────────────────────────
function GamesTabs() {
    const [active, setActive] = useState('quiz');

    return (
        <>
            {/* Tab bar */}
            <div className="flex border-b border-slate-700 flex-shrink-0">
                {GAMES.map(g => (
                    <button key={g.id} onClick={() => setActive(g.id)}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${active === g.id
                                ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}>
                        {g.label}
                    </button>
                ))}
            </div>

            {/* Active game */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                    {active === 'quiz' ? <QuizGame /> : <ConnectDotsGame />}
                </div>
            </div>
        </>
    );
}
