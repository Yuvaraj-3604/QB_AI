import React, { useState } from 'react';
import { base44, api } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Mail,
  Send,
  Users,
  FileText,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { useToast } from '@/Components/ui/use-toast';
import { API_URL } from '../config';

const emailTemplates = [
  { id: 'invitation', name: 'Event Invitation', desc: 'Invite attendees to your event' },
  { id: 'reminder', name: 'Event Reminder', desc: 'Send a reminder before the event' },
  { id: 'followup', name: 'Post-Event Follow-up', desc: 'Thank attendees after the event' },
  { id: 'custom', name: 'Custom Email', desc: 'Write your own email' }
];

export default function Marketing() {
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get the logged-in host's username to use as the sender name in emails
  const currentUser = api.auth.me();
  const hostName = currentUser?.username || 'The Organizer';

  // Default content for templates
  const templateContent = {
    invitation: { subject: "You're Invited!", body: "We are excited to invite you to..." },
    reminder: { subject: "Reminder: Event Coming Up", body: "Just a friendly reminder that..." },
    followup: { subject: "Thank You for Attending", body: "We hope you enjoyed the event..." },
    custom: { subject: "", body: "" }
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    if (templateContent[templateId]) {
      setEmailSubject(templateContent[templateId].subject);
      setEmailBody(templateContent[templateId].body);
    }
  };

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list()
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['registrations', selectedEvent],
    queryFn: async () => {
      if (!selectedEvent) return [];
      try {
        const res = await fetch(`${API_URL}/api/requests/event/${selectedEvent}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await res.json();
        return Array.isArray(data)
          ? data
            .filter(r => r.status === 'approved')
            .map(r => ({
              email: r.users?.email || r.user_email,
              name: r.users?.username || r.user_name || 'Attendee'
            }))
            .filter(r => r.email)
          : [];
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    enabled: !!selectedEvent
  });

  const generateEmail = async () => {
    if (!selectedEvent || !selectedTemplate) return;

    const event = events.find(e => e.id === selectedEvent);
    if (!event) return;

    setIsGenerating(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          eventDetails: event,
          templateType: selectedTemplate,
          hostName
        })
      });

      if (!res.ok) throw new Error('Failed to generate email via AI.');
      const data = await res.json();

      setEmailSubject(data.subject || 'Event Update');
      setEmailBody(data.body || 'Please join our event.');
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const [isSending, setIsSending] = useState(false);

  const sendEmails = async () => {
    if (!emailSubject || !emailBody || registrations.length === 0) return;



    setIsSending(true);
    toast({
      title: "Sending Emails...",
      description: `Dispatching campaign to ${registrations.length} approved recipients...`,
    });

    try {
      const res = await fetch(`${API_URL}/api/marketing/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          recipients: registrations,  // [{email, name}]
          hostName
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Campaign Sent! ✅",
          description: `Successfully sent to ${data.recipientCount} recipients.`
        });
      } else {
        throw new Error(data.error || 'Failed to send emails');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const recipientCount = registrations.length;


  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
            <p className="text-gray-500 mt-1">Send targeted emails to your event attendees</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Email Composer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Event & Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Select Event</Label>
                      <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose an event" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map(event => (
                            <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Email Template</Label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={generateEmail}
                    disabled={!selectedEvent || !selectedTemplate || isGenerating}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate with AI
                  </Button>
                </CardContent>
              </Card>

              {/* Email Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="body">Email Body</Label>
                    <Textarea
                      id="body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your email content..."
                      className="mt-1 min-h-[300px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recipients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-600" />
                    Recipients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-4xl font-bold text-gray-900">{recipientCount}</p>
                    <p className="text-gray-500">attendees will receive this email</p>
                  </div>
                </CardContent>
              </Card>

              {/* Send Button */}
              <Button
                onClick={sendEmails}
                disabled={!emailSubject || !emailBody || recipientCount === 0 || isSending}
                className="w-full bg-cyan-500 hover:bg-cyan-600 h-14 text-lg"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                Send Email Campaign
              </Button>

              {/* Templates Quick Select */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {emailTemplates.map((template) => (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedTemplate === template.id
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`w-5 h-5 ${selectedTemplate === template.id ? 'text-cyan-600' : 'text-gray-400'
                          }`} />
                        <div>
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.desc}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
