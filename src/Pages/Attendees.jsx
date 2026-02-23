import React, { useState } from 'react';
import { api, base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Check,
  X,
  Trash2,
  Mail,
  Users
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { Skeleton } from '@/Components/ui/skeleton';
import { useToast } from '@/Components/ui/use-toast';
import { API_URL } from '../config';

const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  approved: { bg: 'bg-green-100', text: 'text-green-700' },
  checked_in: { bg: 'bg-blue-100', text: 'text-blue-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' }
};

const ticketColors = {
  general: { bg: 'bg-gray-100', text: 'text-gray-700' },
  vip: { bg: 'bg-purple-100', text: 'text-purple-700' },
  speaker: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  sponsor: { bg: 'bg-orange-100', text: 'text-orange-700' }
};

export default function Attendees() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

  const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: ['all-registrations'],
    queryFn: api.requests.allForHost
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: api.events.myEvents
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.requests.updateStatus(id, data.status, data.ticket_type),
    onSuccess: () => queryClient.invalidateQueries(['all-registrations']),
    onError: (err) => alert(`Failed to update: ${err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.requests.updateStatus(id, 'rejected'),
    onSuccess: () => queryClient.invalidateQueries(['all-registrations']),
    onError: (err) => alert(`Failed to delete: ${err.message}`)
  });

  const handleSendEmail = async (email) => {
    toast({
      title: "Sending Invitation...",
      description: `Sending event details to ${email}`,
    });

    try {
      const response = await fetch(`${API_URL}/api/marketing/single-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subject: "Exclusive Invitation: Tech Innovation Summit 2026",
          body: "Hello! We are excited to invite you to our upcoming event. More details will follow soon."
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Email Sent!",
          description: data.message || `Successfully sent to ${email}`,
        });
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event?.title || 'Unknown Event';
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      (reg.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.user_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || reg.event_id === eventFilter;
    return matchesSearch && matchesStatus && matchesEvent;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendees</h1>
              <p className="text-gray-500 mt-1">Manage all attendees across your events</p>
            </div>
            <Button
              variant="outline"
              onClick={() => api.download.trigger(api.download.participants(), 'participants.csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
                <p className="text-gray-500 text-sm">Total Attendees</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-green-600">
                  {registrations.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-gray-500 text-sm">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {registrations.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-gray-500 text-sm">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-blue-600">
                  {registrations.filter(r => r.status === 'checked_in').length}
                </p>
                <p className="text-gray-500 text-sm">Checked In</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search attendees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="checked_in">Checked In</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {registrationsLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No attendees found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attendee</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => {
                      const statusStyle = statusColors[reg.status] || statusColors.pending;
                      const ticketStyle = ticketColors[reg.ticket_type] || ticketColors.general;
                      return (
                        <TableRow key={reg.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{reg.user_name}</p>
                              <p className="text-sm text-gray-500">{reg.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm truncate max-w-[150px]">{reg.events?.title || getEventName(reg.event_id)}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>-</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${ticketStyle.bg} ${ticketStyle.text} border-0 capitalize`}>
                              {reg.ticket_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 capitalize`}>
                              {reg.status?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-500">
                              {reg.created_at ? format(new Date(reg.created_at), 'MMM dd, yyyy') : '-'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => updateMutation.mutate({ id: reg.id, data: { status: 'approved' } })}
                                >
                                  <Check className="w-4 h-4 mr-2" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateMutation.mutate({ id: reg.id, data: { status: 'checked_in' } })}
                                >
                                  <Check className="w-4 h-4 mr-2" /> Check In
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSendEmail(reg.user_email)}
                                >
                                  <Mail className="w-4 h-4 mr-2" /> Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (confirm('Are you sure?')) deleteMutation.mutate(reg.id);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div >
    </div >
  );
}
