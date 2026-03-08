import React, { useState, useRef, useEffect } from 'react';
import { Download, User, Maximize, LayoutGrid, RefreshCw, Sparkles, PenTool, AlertCircle, X, ArrowLeft, Calendar as CalendarIcon, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/base44Client';

/**
 * MANDATORY: The execution environment provides the key at runtime.
 * We must keep this as an empty string.
 */
const apiKey = "";

const Badge = ({ name, role, date, certId, scale = 1, size = 500, colors, event }) => {
    // Premium theme colors based on the second image (Purple/Indigo/Blue)
    const primaryGradient = 'url(#shieldGradient)';
    const accentColor = '#3b82f6'; // Bright blue for name/accents

    return (
        <svg
            viewBox="0 0 500 600"
            style={{
                width: size === 'auto' ? '100%' : `${size}px`,
                height: size === 'auto' ? '100% ' : `${(size / 500) * 600}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'center center'
            }}
            className="drop-shadow-2xl transition-all duration-300 ease-in-out"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#1e1b4b', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#312e81', stopOpacity: 1 }} />
                </linearGradient>

                <linearGradient id="bannerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#4c1d95', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#6d28d9', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#4338ca', stopOpacity: 1 }} />
                </linearGradient>

                <filter id="textShadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
                </filter>
            </defs>

            {/* Outer Shield Border */}
            <path
                d="M 50 20 L 450 20 L 450 480 L 250 580 L 50 480 Z"
                fill={primaryGradient}
                stroke="#4338ca"
                strokeWidth="4"
            />

            {/* Inner Content Area (White background style) */}
            <path
                d="M 65 35 L 435 35 L 435 465 L 250 560 L 65 465 Z"
                fill="white"
            />

            {/* Header Section - Centered Logo & Branding */}
            <g transform="translate(250, 80)">
                {/* Simulated QB Cube Logo - Centered */}
                <g transform="translate(-40, -45) scale(0.8)">
                    {/* Cube Base */}
                    <path d="M 10 30 L 50 10 L 90 30 L 90 70 L 50 90 L 10 70 Z" fill="#1e293b" />
                    <path d="M 10 30 L 50 10 L 90 30 L 50 45 Z" fill="#334155" />
                    <path d="M 50 45 L 90 30 L 90 70 L 50 90 Z" fill="#0f172a" />
                    {/* Letters Q and B on Cube faces */}
                    <text x="25" y="65" fill="white" fontSize="32" fontWeight="900" style={{ fontFamily: 'sans-serif' }}>Q</text>
                    <text x="55" y="75" fill="rgba(255,255,255,0.6)" fontSize="24" fontWeight="900" style={{ fontFamily: 'sans-serif' }}>B</text>

                    {/* Decorative Circuit Lines - Simplified & Centered */}
                    <g opacity="0.6">
                        <path d="M 90 50 L 120 50 M 90 65 L 115 65" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="120" cy="50" r="3" fill="#0ea5e9" />
                        <circle cx="115" cy="65" r="3" fill="#0ea5e9" />
                    </g>
                </g>

                {/* Header Text - Below Logo */}
                <text x="0" y="65" textAnchor="middle" fontSize="24" fontWeight="900" fill="#1e293b" style={{ letterSpacing: '1px' }}>
                    QUESTBRIDGE <tspan fill="#4338ca">AI</tspan>
                </text>
            </g>

            {/* Divider */}
            <line x1="120" y1="165" x2="380" y2="165" stroke="#f1f5f9" strokeWidth="1" />

            {/* Event Details Section */}
            <text x="250" y="210" textAnchor="middle" fill="#64748b" fontSize="14" fontWeight="bold" letterSpacing="1" style={{ textTransform: 'uppercase' }}>
                Official Recognition
            </text>
            <text x="250" y="245" textAnchor="middle" fill="#1e293b" fontSize="20" fontWeight="bold">
                {event?.title || 'QB AI Event'}
            </text>

            {/* Participant Name - Large and Clear */}
            <g transform="translate(0, 30)">
                <text x="250" y="320" textAnchor="middle" fill="#2563eb" fontSize="42" fontWeight="bold" style={{ fontFamily: 'sans-serif' }}>
                    {name}
                </text>
                <line x1="150" y1="345" x2="350" y2="345" stroke="#dbeafe" strokeWidth="3" />
            </g>

            {/* Platform Branding/Footer - Optimized to FIT in shield tip */}
            <g transform="translate(250, 475)">
                <text x="0" y="0" textAnchor="middle" fill="#1e293b" fontSize="24" fontWeight="bold" style={{ fontStyle: 'italic' }}>
                    Certified by <tspan fill="#4338ca">intel</tspan>ligent AI
                </text>
                <text x="0" y="35" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="bold" letterSpacing="3">
                    PARTICIPANT BADGE
                </text>
            </g>
        </svg>
    );
};

export default function BadgeStudio() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('eventId');
    const user = api.auth.me();

    const [participantName, setParticipantName] = useState(user?.username || 'Guest Participant');
    const [role, setRole] = useState('Certified AI Pioneer');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));
    const [certId, setCertId] = useState(`QB-${Math.random().toString(36).substring(7).toUpperCase()}`);
    const [badgeScale, setBadgeScale] = useState(1);
    const [showCompactTests, setShowCompactTests] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [themePrompt, setThemePrompt] = useState('Classic Golden Glory');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch event if eventId provided
    const { data: event } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => api.events.get(eventId),
        enabled: !!eventId
    });

    useEffect(() => {
        if (event) {
            setDate(new Date(event.start_date || Date.now()).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }));
            if (event.title) setThemePrompt(event.title);
        }
    }, [event]);

    const [colors, setColors] = useState({
        gold: { start: '#D4AF37', mid: '#F9E27E', end: '#B8860B' },
        blue: { start: '#1e3a8a', end: '#172554' },
        circuit: '#3b82f6'
    });

    const badgeRef = useRef(null);

    /**
     * Gemini API text generation with automated retries and exponential backoff.
     */
    const callGemini = async (userPrompt) => {
        let retries = 0;
        const maxRetries = 5;
        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: {
                parts: [{ text: "You are a specialized Badge Designer. You must return only valid JSON." }]
            },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        role: { type: "STRING" },
                        colors: {
                            type: "OBJECT",
                            properties: {
                                gold: {
                                    type: "OBJECT",
                                    properties: {
                                        start: { type: "STRING" },
                                        mid: { type: "STRING" },
                                        end: { type: "STRING" }
                                    }
                                },
                                blue: {
                                    type: "OBJECT",
                                    properties: {
                                        start: { type: "STRING" },
                                        end: { type: "STRING" }
                                    }
                                },
                                circuit: { type: "STRING" }
                            }
                        }
                    }
                }
            }
        };

        while (retries < maxRetries) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Unauthorized: API Key may still be initializing. Please wait a moment and try again.");
                    }
                    const errBody = await response.json().catch(() => ({}));
                    throw new Error(errBody.error?.message || `API Error (HTTP ${response.status})`);
                }

                const data = await response.json();
                return data.candidates?.[0]?.content?.parts?.[0]?.text;
            } catch (error) {
                retries++;
                if (retries >= maxRetries) throw error;
                // Exponential backoff
                await delay(Math.pow(2, retries - 1) * 1000);
            }
        }
    };

    const handleAiEnhance = async () => {
        setIsAiLoading(true);
        setErrorMessage('');
        try {
            const promptText = `Generate a professional honorary title for "${participantName}" (e.g. Innovator, Architect). Also create a color theme for the prompt: "${themePrompt}". Output JSON only.`;
            const resultJson = await callGemini(promptText);
            const result = JSON.parse(resultJson);

            if (result.role) setRole(result.role);
            if (result.colors) setColors(result.colors);
        } catch (err) {
            console.error("Gemini Error Detail:", err);
            setErrorMessage(err.message || 'The AI service encountered a temporary connectivity issue.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const downloadBadge = () => {
        const svg = badgeRef.current.querySelector('svg');
        const originalTransform = svg.style.transform;
        svg.style.transform = 'scale(1)';
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const exportWidth = 2000;
        const exportHeight = 2400; // Matches 500x600 aspect ratio
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
            const pngUrl = canvas.toDataURL('image/png', 1.0);
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `Certified_AI_Badge_${participantName.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            svg.style.transform = originalTransform;
        };
        img.src = url;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row p-4 md:p-8 gap-8 items-center justify-center relative font-sans overflow-x-hidden">

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-8 left-8 p-3 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-all z-50 group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Toast Error Handler */}
            {errorMessage && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 w-full max-w-sm px-4">
                    <div className="bg-slate-900 border border-red-500/50 backdrop-blur-md p-4 rounded-xl flex items-start gap-3 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-tighter mb-1">Authorization Error</p>
                            <p className="text-xs font-medium text-slate-300 leading-relaxed">{errorMessage}</p>
                        </div>
                        <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                            <X size={14} className="text-slate-500" />
                        </button>
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            <div className="w-full max-w-md space-y-6 bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl flex-shrink-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-blue-400 via-indigo-400 to-amber-400">
                        Badge Studio
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enterprise Design System</p>
                </div>

                {/* Gemini AI Optimization */}
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                        <Sparkles size={14} /> Intelligence Optimization
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-600 uppercase">Aesthetic Descriptor</label>
                        <input
                            type="text"
                            value={themePrompt}
                            onChange={(e) => setThemePrompt(e.target.value)}
                            placeholder="e.g. Deep Sea, Cyberpunk Neon, Platinum..."
                            className="w-full bg-black/40 border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-700"
                        />
                    </div>

                    <button
                        onClick={handleAiEnhance}
                        disabled={isAiLoading}
                        className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isAiLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 active:scale-95'}`}
                    >
                        {isAiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        Enhance Metadata
                    </button>
                </div>

                {/* Form Controls */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                            <User size={12} className="text-blue-500" /> Participant
                        </label>
                        <input
                            type="text"
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                            className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                            <PenTool size={12} className="text-blue-500" /> Professional Role
                        </label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 font-semibold text-slate-200"
                        />
                    </div>

                    {/* Scale Slider */}
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                            <span className="flex items-center gap-2"><Maximize size={12} className="text-amber-500" /> UI Scale</span>
                            <span className="text-blue-400">{Math.round(badgeScale * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.3"
                            max="1.5"
                            step="0.01"
                            value={badgeScale}
                            onChange={(e) => setBadgeScale(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={() => setShowCompactTests(!showCompactTests)}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${showCompactTests ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                        >
                            <LayoutGrid size={14} />
                            {showCompactTests ? 'Large Mode' : 'Size Tests'}
                        </button>
                        <button
                            onClick={() => { setBadgeScale(1); setShowCompactTests(false); setErrorMessage(''); }}
                            className="flex items-center justify-center gap-2 py-3 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-750"
                        >
                            <RefreshCw size={14} /> Reset
                        </button>
                    </div>
                </div>

                <button
                    onClick={downloadBadge}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-blue-900/30 transition-all active:scale-[0.98] group"
                >
                    <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                    Export Assets
                </button>
            </div>

            {/* Preview Stage */}
            <div className="flex-1 w-full flex flex-col items-center justify-center space-y-8 min-h-[500px]">
                {showCompactTests ? (
                    <div className="w-full animate-in fade-in zoom-in duration-500">
                        <div className="flex flex-col items-center gap-12">
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-[10px] font-black tracking-widest text-slate-600 uppercase">Medium Artifact (128px)</span>
                                <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 shadow-2xl">
                                    <Badge name={participantName} role={role} date={date} certId={certId} size={128} colors={colors} />
                                </div>
                            </div>
                            <div className="flex flex-wrap items-end justify-center gap-16">
                                <Badge name={participantName} role={role} date={date} certId={certId} size={64} colors={colors} />
                                <Badge name={participantName} role={role} date={date} certId={certId} size={32} colors={colors} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl">
                        <div className="px-5 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 shadow-sm flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                            Real-time High Fidelity Preview
                        </div>
                        <div ref={badgeRef} className="relative w-full aspect-square flex items-center justify-center p-8 transition-transform duration-1000">
                            <div className="w-full h-full max-w-[550px] max-h-[660px] flex items-center justify-center overflow-visible">
                                <Badge name={participantName} role={role} date={date} certId={certId} scale={badgeScale} size="auto" colors={colors} event={event} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
