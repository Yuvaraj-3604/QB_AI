import React, { useState } from 'react';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    Trophy,
    Medal,
    TrendingUp,
    Users,
    Search,
    Filter,
    ArrowUp,
    ArrowDown,
    Crown,
    Share2,
    Download,
    Plus
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";

export default function Leaderboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [timeRange, setTimeRange] = useState('monthly');
    const [campaignData, setCampaignData] = useState([]);
    const [isCampaignActive, setIsCampaignActive] = useState(false);
    const [isAddAttendeeOpen, setIsAddAttendeeOpen] = useState(false);
    const [newAttendee, setNewAttendee] = useState({
        name: '',
        company: '',
        points: ''
    });

    const handleStartCampaign = () => {
        setIsCampaignActive(true);
        // Start empty
        setCampaignData([]);
    };

    const handleAddAttendee = () => {
        if (!newAttendee.name || !newAttendee.company || !newAttendee.points) return;

        const newItem = {
            id: campaignData.length + 1 + Math.random(), // Simple ID generation
            name: newAttendee.name,
            company: newAttendee.company,
            points: parseInt(newAttendee.points),
            events: 0,
            streak: 0,
            change: 'same'
        };

        // Add to data and re-sort to establish correct rank
        const updatedData = [...campaignData, newItem].sort((a, b) => b.points - a.points);

        // Re-assign ranks
        const rankedData = updatedData.map((item, index) => ({
            ...item,
            rank: index + 1
        }));

        setCampaignData(rankedData);
        setNewAttendee({ name: '', company: '', points: '' });
        setIsAddAttendeeOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

                <main className="p-6 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                Leaderboard Campaign
                            </h1>
                            <p className="text-gray-500 mt-1">Track and reward top performing attendees and contributors</p>
                        </div>
                        <div className="flex gap-3">
                            {isCampaignActive && (
                                <Dialog open={isAddAttendeeOpen} onOpenChange={setIsAddAttendeeOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Attendee
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Add New Attendee</DialogTitle>
                                            <DialogDescription>
                                                Add a new participant to the leaderboard campaign.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={newAttendee.name}
                                                    onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                                                    className="col-span-3"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="company" className="text-right">
                                                    Company
                                                </Label>
                                                <Input
                                                    id="company"
                                                    value={newAttendee.company}
                                                    onChange={(e) => setNewAttendee({ ...newAttendee, company: e.target.value })}
                                                    className="col-span-3"
                                                    placeholder="Acme Corp"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="points" className="text-right">
                                                    Points
                                                </Label>
                                                <Input
                                                    id="points"
                                                    type="number"
                                                    value={newAttendee.points}
                                                    onChange={(e) => setNewAttendee({ ...newAttendee, points: e.target.value })}
                                                    className="col-span-3"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" onClick={handleAddAttendee}>Add to Leaderboard</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            <Button variant="outline">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {!isCampaignActive ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Campaigns</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                There are currently no active leaderboard campaigns. Start a new campaign to track attendee engagement and reward top performers.
                            </p>
                            <Button
                                className="bg-cyan-500 hover:bg-cyan-600"
                                onClick={handleStartCampaign}
                            >
                                <Trophy className="w-4 h-4 mr-2" />
                                Start Campaign
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Top 3 Podium */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
                                {/* 2nd Place */}
                                <Card className="order-2 md:order-1 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
                                    <CardContent className="p-6 text-center relative">
                                        <div className="absolute top-4 left-4">
                                            <Badge variant="outline" className="bg-white/50 backdrop-blur border-slate-300">
                                                #2
                                            </Badge>
                                        </div>
                                        <div className="mx-auto w-20 h-20 rounded-full border-4 border-slate-300 p-1 mb-4 bg-white">
                                            <Avatar className="w-full h-full">
                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xl">
                                                    {campaignData.length > 1 ? campaignData[1].name.split(' ').map(n => n[0]).join('') : '-'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{campaignData.length > 1 ? campaignData[1].name : 'Vacant'}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{campaignData.length > 1 ? campaignData[1].company : '-'}</p>
                                        <div className="flex items-center justify-center gap-2 text-cyan-600 font-bold">
                                            <Medal className="w-4 h-4" />
                                            {campaignData.length > 1 ? campaignData[1].points.toLocaleString() : 0} pts
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 1st Place */}
                                <Card className="order-1 md:order-2 bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200 shadow-lg transform md:-translate-y-4">
                                    <CardContent className="p-8 text-center relative">
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                            <Crown className="w-12 h-12 text-yellow-500 fill-yellow-500 animate-bounce" />
                                        </div>
                                        <div className="mx-auto w-24 h-24 rounded-full border-4 border-yellow-400 p-1 mb-4 bg-white relative">
                                            <Avatar className="w-full h-full">
                                                <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-2xl">
                                                    {campaignData.length > 0 ? campaignData[0].name.split(' ').map(n => n[0]).join('') : '-'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">{campaignData.length > 0 ? campaignData[0].name : 'Vacant'}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{campaignData.length > 0 ? campaignData[0].company : '-'}</p>
                                        <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold text-lg">
                                            <Trophy className="w-5 h-5" />
                                            {campaignData.length > 0 ? campaignData[0].points.toLocaleString() : 0} pts
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 3rd Place */}
                                <Card className="order-3 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                                    <CardContent className="p-6 text-center relative">
                                        <div className="absolute top-4 left-4">
                                            <Badge variant="outline" className="bg-white/50 backdrop-blur border-orange-300">
                                                #3
                                            </Badge>
                                        </div>
                                        <div className="mx-auto w-20 h-20 rounded-full border-4 border-orange-300 p-1 mb-4 bg-white">
                                            <Avatar className="w-full h-full">
                                                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xl">
                                                    {campaignData.length > 2 ? campaignData[2].name.split(' ').map(n => n[0]).join('') : '-'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{campaignData.length > 2 ? campaignData[2].name : 'Vacant'}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{campaignData.length > 2 ? campaignData[2].company : '-'}</p>
                                        <div className="flex items-center justify-center gap-2 text-orange-600 font-bold">
                                            <Medal className="w-4 h-4" />
                                            {campaignData.length > 2 ? campaignData[2].points.toLocaleString() : 0} pts
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Leaderboard Table */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Rankings</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Select value={timeRange} onValueChange={setTimeRange}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="weekly">This Week</SelectItem>
                                                <SelectItem value="monthly">This Month</SelectItem>
                                                <SelectItem value="yearly">This Year</SelectItem>
                                                <SelectItem value="all_time">All Time</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="relative w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input placeholder="Search user..." className="pl-9" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Rank</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Points</TableHead>
                                                <TableHead>Events Attended</TableHead>
                                                <TableHead>Streak</TableHead>
                                                <TableHead>Trend</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {campaignData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                        No participants yet. Add an attendee to start the campaign.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                campaignData.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>
                                                            <div className={`font-bold ${user.rank <= 3 ? 'text-cyan-600 text-lg' : 'text-gray-500'
                                                                }`}>
                                                                #{user.rank}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="w-8 h-8">
                                                                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium">{user.name}</div>
                                                                    <div className="text-xs text-gray-500">{user.company}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-bold text-gray-900">{user.points.toLocaleString()}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                                <Users className="w-4 h-4" />
                                                                {user.events}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1.5 ">
                                                                <span className="font-bold text-orange-500">🔥 {user.streak}</span>
                                                                <span className="text-xs text-gray-400">day streak</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {user.change === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
                                                            {user.change === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
                                                            {user.change === 'same' && <span className="text-gray-300">-</span>}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
