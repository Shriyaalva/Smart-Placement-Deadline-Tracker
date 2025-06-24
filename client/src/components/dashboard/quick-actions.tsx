import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  Bell,
  Monitor,
  Circle
} from 'lucide-react';
import { useGmail } from '@/hooks/use-gmail';
import { useReminders } from '@/hooks/use-reminders';
import { useQuery } from '@tanstack/react-query';

interface QuickActionsProps {
  user: {
    id: number;
    name: string;
    email: string;
    isGmailConnected?: boolean;
  };
}

export function QuickActions({ user }: QuickActionsProps) {
  const { syncEmails, isSyncing } = useGmail();
  const { updateSettings } = useReminders();
  
  const [localSettings, setLocalSettings] = useState({
    defaultReminderDays: 3,
    emailNotifications: true,
    browserNotifications: false,
  });

  const { data: settings } = useQuery({
    queryKey: [`/api/settings/${user.id}`],
    enabled: !!user.id,
  });

  const { data: activities = [] } = useQuery({
    queryKey: [`/api/reminders/${user.id}`],
    enabled: !!user.id,
  });

  const handleSync = () => {
    syncEmails(user.id);
  };

  const handleSaveSettings = () => {
    updateSettings({ userId: user.id, settings: localSettings });
  };

  const mockActivities = [
    { id: 1, text: 'New placement email detected', company: 'Meta Careers', time: '5 minutes ago', type: 'success' },
    { id: 2, text: 'Reminder sent for Google deadline', time: '1 hour ago', type: 'warning' },
    { id: 3, text: 'Email categorization updated', time: '2 hours ago', type: 'info' },
  ];

  return (
    <div className="space-y-6">
      {/* Email Integration Status */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Email Integration</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="text-green-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Gmail Connected</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <CheckCircle className="text-green-600" size={20} />
          </div>
          
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-3">
              Last sync: {settings?.lastEmailSync ? new Date(settings.lastEmailSync).toLocaleString() : 'Never'}
            </p>
            <Button 
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full"
            >
              {isSyncing ? (
                <RefreshCw className="mr-2 animate-spin" size={16} />
              ) : (
                <RefreshCw className="mr-2" size={16} />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Reminder Settings</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Default Reminder Time</Label>
            <Select 
              value={localSettings.defaultReminderDays.toString()}
              onValueChange={(value) => setLocalSettings(prev => ({ ...prev, defaultReminderDays: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day before</SelectItem>
                <SelectItem value="3">3 days before</SelectItem>
                <SelectItem value="7">1 week before</SelectItem>
                <SelectItem value="14">2 weeks before</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <Label htmlFor="email-notifications">Email notifications</Label>
              </div>
              <Switch 
                id="email-notifications"
                checked={localSettings.emailNotifications}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Monitor size={16} />
                <Label htmlFor="browser-notifications">Browser notifications</Label>
              </div>
              <Switch 
                id="browser-notifications"
                checked={localSettings.browserNotifications}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, browserNotifications: checked }))}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSaveSettings}
            variant="outline" 
            className="w-full"
          >
            <Settings className="mr-2" size={16} />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">
                    {activity.company ? `${activity.company} • ` : ''}{activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
