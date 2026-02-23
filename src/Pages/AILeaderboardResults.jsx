import React, { useState } from 'react';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    Sparkles,
    TrendingUp,
    Brain,
    Target,
    Zap,
    Award,
    Share2,
    Download,
    ArrowRight
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

const AI_INSIGHTS = [
    {
        id: 1,
        title: 'Engagement Anomaly',
        description: 'Alex Johnson showing 45% higher participation in Q&A sessions than average.',
        type: 'positive',
        score: 98
    },
    {
        id: 2,
        title: 'Rising Star Prediction',
        description: 'New attendee Sarah Miller is on track to break the rookie leaderboard record.',
        type: 'prediction',
        score: 92
    },
    {
        id: 3,
        title: 'Skill Gap Detected',
        description: 'Workshop attendance suggests a high demand for advanced AI topics.',
        type: 'neutral',
        score: 85
    }
];

const PERFORMANCE_DATA = [
    { name: 'Mon', score: 4000, prediction: 4200 },
    { name: 'Tue', score: 3000, prediction: 3500 },
    { name: 'Wed', score: 2000, prediction: 6000 }, // Spike
    { name: 'Thu', score: 2780, prediction: 4000 },
    { name: 'Fri', score: 1890, prediction: 3000 },
    { name: 'Sat', score: 2390, prediction: 2500 },
    { name: 'Sun', score: 3490, prediction: 3600 },
];

const LEADERBOARD_RESULTS = [];

export default function AILeaderboardResults() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-transparent">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

                <main className="p-6 max-w-7xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
                                    AI Enhanced Results
                                </span>
                                <Sparkles className="w-6 h-6 text-indigo-600" />
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Deep learning analysis of participant performance and engagement metrics
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Brain className="w-4 h-4 mr-2" />
                                Generate Report
                            </Button>
                        </div>
                    </div>

                    {/* AI Insights Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {AI_INSIGHTS.map((insight, index) => (
                            <Card key={index} className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            {insight.type === 'positive' && <Zap className="w-5 h-5 text-indigo-600" />}
                                            {insight.type === 'prediction' && <Target className="w-5 h-5 text-purple-600" />}
                                            {insight.type === 'neutral' && <Brain className="w-5 h-5 text-blue-600" />}
                                        </div>
                                        <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-200">
                                            {insight.score}% Confidence
                                        </Badge>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{insight.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {insight.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Chart */}
                        <Card className="lg:col-span-2 border-none shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle>Performance vs Prediction</CardTitle>
                                <CardDescription>Real-time scoring against AI models</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={PERFORMANCE_DATA}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#4f46e5"
                                                strokeWidth={3}
                                                dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                                activeDot={{ r: 8 }}
                                                name="Actual Score"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="prediction"
                                                stroke="#9333ea"
                                                strokeWidth={3}
                                                strokeDasharray="5 5"
                                                dot={false}
                                                name="AI Prediction"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Performers List */}
                        <Card className="border-none shadow-lg bg-indigo-900 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-16 -mb-16 pointer-events-none"></div>

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-400" />
                                    Top Candidates
                                </CardTitle>
                                <CardDescription className="text-indigo-200">
                                    Ranked by AI Performance Index
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                {LEADERBOARD_RESULTS.length === 0 ? (
                                    <div className="text-center py-12 text-indigo-300">
                                        <Award className="w-12 h-12 mx-auto mb-4 opacity-50 text-indigo-400" />
                                        <p className="font-medium text-white mb-1">No Scored Candidates</p>
                                        <p className="text-sm">AI analysis pending for this period.</p>
                                    </div>
                                ) : (
                                    LEADERBOARD_RESULTS.map((user, i) => (
                                        <div key={user.id} className="flex items-center gap-4 group cursor-pointer">
                                            <div className="relative font-mono font-bold text-indigo-300 w-6 text-center">
                                                0{i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-white group-hover:text-indigo-200 transition-colors">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-xs font-medium text-emerald-400">
                                                        {user.trend}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-white/10 text-xs hover:bg-white/20 text-indigo-200 border-none">
                                                        {user.role}
                                                    </Badge>
                                                    <Badge variant="secondary" className="bg-indigo-500/30 text-xs hover:bg-indigo-500/40 text-yellow-300 border-none">
                                                        {user.ai_badge}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold">{user.score}</div>
                                                <div className="text-[10px] text-indigo-300 uppercase tracking-wider">Score</div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                <Button variant="ghost" className="w-full mt-4 text-indigo-200 hover:text-white hover:bg-white/10">
                                    View Full Analysis <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
