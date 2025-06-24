import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function Reminders() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: reminders = [] } = useQuery({
    queryKey: [`/api/reminders/${user.id}`],
    enabled: !!user.id,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: [`/api/opportunities/${user.id}`],
    enabled: !!user.id,
  });

  const getOpportunityById = (id: number) => {
    return opportunities.find((opp: any) => opp.id === id);
  };

  const pendingReminders = reminders.filter((r: any) => !r.isSent);
  const sentReminders = reminders.filter((r: any) => r.isSent);

  return (
    <div className="flex-1 overflow-x-hidden">
      <Header 
        title="Reminders" 
        subtitle="Manage your placement reminder notifications"
        user={user}
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Reminders */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Pending Reminders</h3>
            </CardHeader>
            <CardContent>
              {pendingReminders.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No pending reminders</h4>
                  <p className="text-gray-600">
                    All your reminders are up to date!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReminders.map((reminder: any) => {
                    const opportunity = getOpportunityById(reminder.opportunityId);
                    
                    return (
                      <div key={reminder.id} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Clock className="text-yellow-600 mt-1" size={16} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {opportunity?.title || 'Unknown Opportunity'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {opportunity?.company} • Reminder scheduled
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {reminder.reminderType === 'email' ? 'Email' : 'Browser'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(reminder.reminderTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sent Reminders */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Sent Reminders</h3>
            </CardHeader>
            <CardContent>
              {sentReminders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No reminders sent yet</h4>
                  <p className="text-gray-600">
                    Your reminder history will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentReminders.map((reminder: any) => {
                    const opportunity = getOpportunityById(reminder.opportunityId);
                    
                    return (
                      <div key={reminder.id} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="text-green-600 mt-1" size={16} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {opportunity?.title || 'Unknown Opportunity'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {opportunity?.company} • Reminder sent
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {reminder.reminderType === 'email' ? 'Email' : 'Browser'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Sent on {formatDate(reminder.sentAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reminder Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Reminder Statistics</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{reminders.length}</div>
                  <div className="text-sm text-gray-600">Total Reminders</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{pendingReminders.length}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{sentReminders.length}</div>
                  <div className="text-sm text-gray-600">Sent</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {sentReminders.length > 0 ? '100%' : '0%'}
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
