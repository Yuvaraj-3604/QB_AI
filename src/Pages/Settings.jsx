import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  User,
  Bell,
  Shield,
  Save,
  Loader2,
  Building,
  Mail,
  Globe
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import { useToast } from '@/Components/ui/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    company: '',
    bio: '',
    website: '',
    avatar: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    eventReminders: true,
    registrationAlerts: true,
    marketingEmails: false
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        setProfileData({
          full_name: userData.username || userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          date_of_birth: userData.date_of_birth || '',
          gender: userData.gender || '',
          company: userData.company || '',
          bio: userData.bio || '',
          website: userData.website || '',
          avatar: userData.avatar || ''
        });
        if (userData.notifications) {
          setNotifications(prev => ({ ...prev, ...userData.notifications }));
        }
      }
    } catch (e) { }
  }, []);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updated = { ...current, ...data };
      localStorage.setItem('currentUser', JSON.stringify(updated));
      setUser(updated);
      return updated;
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message || "Something went wrong.",
        variant: "destructive"
      });
    }
  });

  const fileInputRef = React.useRef(null);

  const handleSaveProfile = () => {
    updateMutation.mutate(profileData);
  };

  const handleSaveNotifications = () => {
    updateMutation.mutate({ notifications });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size should be less than 2MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        // Update local state for immediate preview
        setUser(prev => ({ ...prev, avatar: base64String }));
        setProfileData(prev => ({ ...prev, avatar: base64String }));

        // Optionally trigger save immediately or wait for user to click separate save
        // Let's autosave it for better UX as it's a specific action
        updateMutation.mutate({ avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <DashboardHeader user={user} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user?.avatar || "/profile-logo.png"} />
                      <AvatarFallback className="bg-cyan-100 text-cyan-700 text-2xl">
                        {user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handlePhotoChange}
                      />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Change Photo
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email || user?.email || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">Birth Date</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={profileData.date_of_birth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={profileData.gender}
                        onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="" disabled>Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <div className="relative mt-1">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <div className="relative mt-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateMutation.isPending}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <Mail className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive email updates about your events</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(val) => setNotifications(prev => ({ ...prev, emailNotifications: val }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Bell className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Event Reminders</p>
                          <p className="text-sm text-gray-500">Get reminders before your events start</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.eventReminders}
                        onCheckedChange={(val) => setNotifications(prev => ({ ...prev, eventReminders: val }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Registration Alerts</p>
                          <p className="text-sm text-gray-500">Be notified when someone registers</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.registrationAlerts}
                        onCheckedChange={(val) => setNotifications(prev => ({ ...prev, registrationAlerts: val }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Mail className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Marketing Emails</p>
                          <p className="text-sm text-gray-500">Receive tips and product updates</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.marketingEmails}
                        onCheckedChange={(val) => setNotifications(prev => ({ ...prev, marketingEmails: val }))}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveNotifications}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Your account is secure</p>
                        <p className="text-gray-500">All security features are enabled</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-gray-500">Update your password regularly for security</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-auto p-4 text-red-600 border-red-200 hover:bg-red-50">
                      <div className="text-left">
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-gray-500">Permanently delete your account and data</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
