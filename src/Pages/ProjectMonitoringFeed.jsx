import React, { useState } from 'react';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Server,
    Wifi,
    Bell,
    Settings,
    MoreHorizontal,
    Search,
    Shield
} from 'lucide-react';
import { Input } from '@/Components/ui/input';

const ACTIVITY_FEED = [
    {
        id: 1,
        type: 'alert',
        message: 'Unusual spike in registration requests detected from IP range 192.168.x.x',
        time: '2 mins ago',
        severity: 'high'
    },
    {
        id: 2,
        type: 'update',
        message: 'System auto-scaled worker nodes to handle increased load',
        time: '15 mins ago',
        severity: 'low'
    },
    {
        id: 3,
        type: 'success',
        message: 'Event "Tech Summit 2024" published successfully',
        time: '1 hour ago',
        severity: 'medium'
    },
    {
        id: 4,
        type: 'update',
        message: 'AI Model v2.4 deployment completed',
        time: '2 hours ago',
        severity: 'low'
    },
    {
        id: 5,
        type: 'alert',
        message: 'Latency warning: API response time > 500ms',
        time: '3 hours ago',
        severity: 'medium'
    }
];

const SYSTEM_HEALTH = [
    { name: 'API Gateway', status: 'online', uptime: '99.99%', latency: '45ms' },
    { name: 'Database Cluster', status: 'online', uptime: '99.95%', latency: '12ms' },
    { name: 'AI Inference Engine', status: 'degraded', uptime: '98.50%', latency: '850ms' }, // Degraded
    { name: 'Storage Service', status: 'online', uptime: '100%', latency: '24ms' },
];

export default function ProjectMonitoringFeed() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

                <main className="p-6 max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="w-6 h-6 text-cyan-500" />
                                Project Monitoring Feed
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Real-time system health and AI-driven activity logs</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input placeholder="Filter logs..." className="pl-9 w-64 bg-white" />
                            </div>
                            <Button variant="outline" size="icon"><Settings className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* System Health Status */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                {SYSTEM_HEALTH.map((service, index) => (
                                    <Card key={index} className="border-l-4 border-l-transparent hover:border-l-cyan-500 transition-all">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${service.status === 'online' ? 'bg-green-100 text-green-600' :
                                                        service.status === 'degraded' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    <Server className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{service.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Wifi className="w-3 h-3" />
                                                        {service.latency}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="secondary" className={`${service.status === 'online' ? 'bg-green-50 text-green-700' :
                                                        service.status === 'degraded' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                                                    } mb-1`}>
                                                    {service.status}
                                                </Badge>
                                                <p className="text-xs text-gray-400 font-mono">{service.uptime}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Main Feed Card */}
                            <Card className="min-h-[500px]">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-cyan-600" />
                                            Security & Operations Log
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="text-cyan-600">View All</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {ACTIVITY_FEED.map((item) => (
                                            <div key={item.id} className="flex gap-4 group">
                                                <div className="relative">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 relative ${item.severity === 'high' ? 'bg-red-100 text-red-600' :
                                                            item.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                                                                'bg-cyan-100 text-cyan-600'
                                                        }`}>
                                                        {item.type === 'alert' && <AlertTriangle className="w-5 h-5" />}
                                                        {item.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                                                        {item.type === 'update' && <Activity className="w-5 h-5" />}
                                                    </div>
                                                    <div className="absolute top-10 bottom-[-24px] left-1/2 w-px bg-gray-100 -translate-x-1/2 group-last:hidden"></div>
                                                </div>
                                                <div className="flex-1 pb-6 border-b border-gray-50 group-last:border-0">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-gray-900 font-medium">{item.message}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {item.time}
                                                                </span>
                                                                {item.severity === 'high' && (
                                                                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">CRITICAL</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar / Stats */}
                        <div className="space-y-6">
                            <Card className="bg-slate-900 text-white border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-lg">System Overview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-slate-800 rounded-xl">
                                        <p className="text-slate-400 text-sm mb-1">Total Requests</p>
                                        <p className="text-2xl font-bold font-mono">24.5M</p>
                                        <div className="h-1 bg-slate-700 mt-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 w-[70%]"></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-800 rounded-xl">
                                        <p className="text-slate-400 text-sm mb-1">Avg Response Time</p>
                                        <p className="text-2xl font-bold font-mono text-green-400">124ms</p>
                                    </div>
                                    <div className="p-4 bg-slate-800 rounded-xl">
                                        <p className="text-slate-400 text-sm mb-1">Error Rate</p>
                                        <p className="text-2xl font-bold font-mono text-yellow-400">0.02%</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-gray-500" />
                                        Active Alerts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-3 text-sm p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>High memory usage on Node-A</p>
                                    </div>
                                    <div className="flex gap-3 text-sm p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100">
                                        <Server className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>Database backup pending (retry 2)</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
