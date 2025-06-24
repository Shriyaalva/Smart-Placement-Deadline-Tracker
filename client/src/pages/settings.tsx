import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Mail, 
  Monitor, 
  Clock,
  Save,
  Key,
  Shield
} from 'lucide-react';
import { useReminders } from '@/hooks/use-reminders';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { updateSettings } = useReminders();

  const { data: settings } = useQuery({
    queryKey: [`/api/settings/${user.id}`],
    enabled: !!user.id,
  });

  const [localSettings, setLocalSettings] = useState({
    defaultReminderDays: settings?.defaultReminderDays || 3,
    emailNotifications: settings?.emailNotifications ?? true,
    browserNotifications: settings?.browserNotifications ?? false,
  });

  const handleSaveSettings = () => {
    updateSettings({ userId: user.id, settings: localSettings });
  };

  return (
    <div className="flex-1 overflow-x-hidden">
      <Header 
        title="Settings" 
        subtitle="Customize your PlacementAlert experience"
        user={user}
      />
      
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="text-gray-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reminder-days">Default Reminder Time</Label>
                <Select 
                  value={localSettings.defaultReminderDays.toString()}
                  onValueChange={(value) => setLocalSettings(prev => ({ 
                    ...prev, 
                    defaultReminderDays: parseInt(value) 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day before deadline</SelectItem>
                    <SelectItem value="3">3 days before deadline</SelectItem>
                    <SelectItem value="7">1 week before deadline</SelectItem>
                    <SelectItem value="14">2 weeks before deadline</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  How many days before the deadline should we remind you?
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Notification Channels</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="text-gray-400" size={20} />
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive reminder emails in your Gmail inbox
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="email-notifications"
                    checked={localSettings.emailNotifications}
                    onCheckedChange={(checked) => setLocalSettings(prev => ({ 
                      ...prev, 
                      emailNotifications: checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Monitor className="text-gray-400" size={20} />
                    <div>
                      <Label htmlFor="browser-notifications">Browser Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Show desktop notifications in your browser
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="browser-notifications"
                    checked={localSettings.browserNotifications}
                    onCheckedChange={(checked) => setLocalSettings(prev => ({ 
                      ...prev, 
                      browserNotifications: checked 
                    }))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                  <Save className="mr-2" size={16} />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <SettingsIcon className="text-gray-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    value={user.name || ''}
                    disabled
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This is your connected Gmail account
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Connected Services</h4>
                
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="text-green-600" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">Gmail</p>
                      <p className="text-sm text-gray-600">Connected and active</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="text-gray-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <p>We only read your emails to detect placement opportunities</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <p>Your email content is processed locally and not stored permanently</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <p>We never send emails on your behalf without explicit permission</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <p>All data is encrypted and secured according to industry standards</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="pt-2">
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  Disconnect Gmail Account
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This will stop email monitoring and delete all your data
                </p>
              </div>
            </CardContent>
          </Card>

          {/* App Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">App Information</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">December 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Privacy Policy</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View
                  </Button>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Terms of Service</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
