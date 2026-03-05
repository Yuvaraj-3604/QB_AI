import React, { useState, useEffect } from 'react';
import { api } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Users, Calendar, LifeBuoy, TrendingUp, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.admin.getStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
                    <p className="text-muted-foreground text-lg">Central control for QuestBridge AI</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" asChild>
                        <Link to="/Admin/Users">Manage Users</Link>
                    </Button>
                    <Button asChild>
                        <Link to="/Admin/Support">Support Queue</Link>
                    </Button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.users?.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.users?.hosts} Hosts | {stats?.users?.attendees} Attendees
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.events?.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total events created</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                        <LifeBuoy className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.support?.total || 0}</div>
                        <p className="text-xs text-orange-600 font-semibold mt-1">
                            {stats?.support?.open} Pending Action
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">Stable</div>
                        <p className="text-xs text-muted-foreground mt-1">All services operational</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Platform Activity */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentEvents?.map(event => (
                                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">Host: {event.host_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{new Date(event.created_at).toLocaleDateString()}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{event.status}</p>
                                    </div>
                                </div>
                            ))}
                            {stats?.recentEvents?.length === 0 && <p className="text-center py-8 text-muted-foreground">No recent events</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security & Control</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl border bg-red-50 dark:bg-red-950/10 border-red-100 flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-900 dark:text-red-400 text-sm">Admin Privileges</p>
                                <p className="text-xs text-red-700 dark:text-red-300">You have full access to manage users and platform data. Exercise caution.</p>
                            </div>
                        </div>

                        <Button variant="ghost" className="w-full justify-between group" asChild>
                            <Link to="/Admin/Users">
                                <span className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" /> User Management
                                </span>
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </Button>

                        <Button variant="ghost" className="w-full justify-between group" asChild>
                            <Link to="/Admin/Support">
                                <span className="flex items-center gap-2">
                                    <LifeBuoy className="h-4 w-4" /> Support Tickets
                                </span>
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
