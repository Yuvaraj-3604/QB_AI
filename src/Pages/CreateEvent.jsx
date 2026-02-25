import React, { useState } from 'react';
import { api } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  Calendar,
  MapPin,
  Video,
  Users,
  DollarSign,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { Link } from 'react-router-dom';
import { useToast } from '@/Components/ui/use-toast';
const eventTypes = [
  { value: 'in_person', label: 'In-Person', icon: Users, desc: 'Physical venue event' },
  { value: 'virtual', label: 'Virtual', icon: Video, desc: 'Online streaming event' },
  { value: 'webinar', label: 'Webinar', icon: Video, desc: 'Live presentation' },
  { value: 'hybrid', label: 'Hybrid', icon: Users, desc: 'Both physical and online' }
];

const categories = [
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'networking', label: 'Networking' },
  { value: 'training', label: 'Training' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'other', label: 'Other' }
];

export default function CreateEvent() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  const isEditing = !!eventId;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'in_person',
    category: 'conference',
    custom_category: '',
    start_date: '',
    end_date: '',
    location: '',
    virtual_link: '',
    max_attendees: '',
    ticket_price: 0,
    is_free: true,
    cover_image: '',
    advisor_name: '',
    contact: '',
    instruction: '',
    status: 'draft'
  });
  const [submitAction, setSubmitAction] = useState('save');

  // Fetch event data if editing
  React.useEffect(() => {
    if (eventId) {
      api.events.get(eventId).then(data => {
        if (data) {
          const isCustomCategory = data.category && !categories.find(c => c.value === data.category);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            event_type: data.event_type || 'in_person',
            category: isCustomCategory ? 'other' : (data.category || 'conference'),
            custom_category: isCustomCategory ? data.category : '',
            start_date: data.start_date ? data.start_date.slice(0, 16) : '',
            end_date: data.end_date ? data.end_date.slice(0, 16) : '',
            location: data.location || '',
            virtual_link: data.virtual_link || '',
            max_attendees: data.max_attendees || '',
            ticket_price: data.ticket_price || 0,
            is_free: data.is_free !== undefined ? data.is_free : true,
            cover_image: data.cover_image || '',
            advisor_name: data.advisor_name || '',
            contact: data.contact || '',
            instruction: data.instruction || '',
            status: data.status || 'draft'
          });
        }
      }).catch(console.error);
    }
  }, [eventId]);

  const createMutation = useMutation({
    mutationFn: (data) => api.events.create(data),
    onSuccess: (newEvent) => {
      toast({ title: 'Success', description: 'Event created successfully!' });
      navigate(`/EventDetails?id=${newEvent.id}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.events.update(eventId, data),
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Event updated successfully.' });
      navigate(`/EventDetails?id=${eventId}`);
    }
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const status = submitAction === 'publish' ? 'published' : (isEditing ? formData.status : 'draft');
    const finalCategory = formData.category === 'other' && formData.custom_category ? formData.custom_category : formData.category;
    const { custom_category, ...restFormData } = formData;
    const dataToSubmit = { ...restFormData, category: finalCategory, status };
    if (isEditing) updateMutation.mutate(dataToSubmit);
    else createMutation.mutate(dataToSubmit);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, cover_image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to={createPageUrl('Dashboard')} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Edit Event' : 'Create New Event'}</h1>
            <p className="text-gray-500 mt-2">{isEditing ? 'Update the details of your event' : 'Fill in the details to create your event'}</p>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter event title"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your event..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>
                    <div>
                      <Label>Event Type *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        {eventTypes.map((type) => (
                          <motion.button
                            key={type.value}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData(prev => ({ ...prev, event_type: type.value }))}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${formData.event_type === type.value
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <type.icon className={`w-5 h-5 mb-2 ${formData.event_type === type.value ? 'text-cyan-600' : 'text-gray-400'
                              }`} />
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-gray-500">{type.desc}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.category === 'other' && (
                        <div>
                          <Label htmlFor="custom_category">Custom Category Name *</Label>
                          <Input
                            id="custom_category"
                            value={formData.custom_category}
                            onChange={(e) => setFormData(prev => ({ ...prev, custom_category: e.target.value }))}
                            placeholder="Enter category name"
                            className="mt-1"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                      Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date & Time *</Label>
                        <Input
                          id="start_date"
                          type="datetime-local"
                          value={formData.start_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date & Time</Label>
                        <Input
                          id="end_date"
                          type="datetime-local"
                          value={formData.end_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-cyan-600" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(formData.event_type === 'in_person' || formData.event_type === 'hybrid') && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="location">Venue Address</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Enter venue address"
                            className="mt-1"
                          />
                        </div>
                        {formData.event_type === 'in_person' && (
                          <>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="advisor_name">Advisor Name</Label>
                                <Input
                                  id="advisor_name"
                                  value={formData.advisor_name}
                                  onChange={(e) => setFormData(prev => ({ ...prev, advisor_name: e.target.value }))}
                                  placeholder="Name of advisor"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="contact">Contact Details</Label>
                                <Input
                                  id="contact"
                                  value={formData.contact}
                                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                                  placeholder="Phone or email"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="instruction">Instructions for Attendees</Label>
                              <Textarea
                                id="instruction"
                                value={formData.instruction}
                                onChange={(e) => setFormData(prev => ({ ...prev, instruction: e.target.value }))}
                                placeholder="E.g., Please bring your ID..."
                                className="mt-1"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {(formData.event_type === 'virtual' || formData.event_type === 'hybrid' || formData.event_type === 'webinar') && (
                      <div>
                        <Label htmlFor="virtual_link">Virtual Event Link</Label>
                        <Input
                          id="virtual_link"
                          value={formData.virtual_link}
                          onChange={(e) => setFormData(prev => ({ ...prev, virtual_link: e.target.value }))}
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Cover Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cover Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {formData.cover_image ? (
                        <div className="relative rounded-xl overflow-hidden">
                          <img src={formData.cover_image} alt="Cover" className="w-full h-40 object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-cyan-500 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Upload Image</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Capacity & Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Capacity & Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="max_attendees">Max Attendees</Label>
                      <div className="relative mt-1">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="max_attendees"
                          type="number"
                          value={formData.max_attendees}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_attendees: parseInt(e.target.value) || '' }))}
                          placeholder="Unlimited"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_free">Free Event</Label>
                      <Switch
                        id="is_free"
                        checked={formData.is_free}
                        onCheckedChange={(val) => setFormData(prev => ({ ...prev, is_free: val, ticket_price: val ? 0 : prev.ticket_price }))}
                      />
                    </div>
                    {!formData.is_free && (
                      <div>
                        <Label htmlFor="ticket_price">Ticket Price</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="ticket_price"
                            type="number"
                            value={formData.ticket_price}
                            onChange={(e) => setFormData(prev => ({ ...prev, ticket_price: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    onClick={() => setSubmitAction('save')}
                    className="w-full bg-cyan-500 hover:bg-cyan-600"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isEditing ? 'Save Changes' : 'Save as Draft'}
                  </Button>
                  <Button
                    type="submit"
                    onClick={() => setSubmitAction('publish')}
                    variant="outline"
                    className="w-full border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {isEditing ? 'Update & Publish' : 'Save & Publish'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
