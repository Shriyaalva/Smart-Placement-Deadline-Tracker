import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { useGmail } from '@/hooks/use-gmail';
import { formatDate } from '@/lib/utils';

export default function EmailIntegration() {
  const { syncEmails, isSyncing } = useGmail();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: emailLogs = [] } = useQuery({
    queryKey: [`/api/email-logs/${user.id}`],
    enabled: !!user.id,
  });

  const handleSync = () => {
    syncEmails(user.id);
  };

  return (
    <div className="flex-1 overflow-x-hidden">
      <Header 
        title="Email Integration" 
        subtitle="Manage your Gmail connection and email processing"
        user={user}
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Connection Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div>
                      <p className="font-medium text-gray-900">Gmail Connected</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Email Processing */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Email Processing</h3>
                  <Button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    size="sm"
                  >
                    {isSyncing ? (
                      <RefreshCw className="mr-2 animate-spin" size={16} />
                    ) : (
                      <RefreshCw className="mr-2" size={16} />
                    )}
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No emails processed yet</h4>
                      <p className="text-gray-600 mb-4">
                        Click "Sync Now" to start processing your emails.
                      </p>
                    </div>
                  ) : (
                    emailLogs.map((log: any) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          log.isPlacementRelated ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{log.emailSubject}</p>
                          <p className="text-sm text-gray-600">From: {log.emailFrom}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={log.isPlacementRelated ? "default" : "secondary"}>
                              {log.isPlacementRelated ? 'Placement Related' : 'Not Related'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(log.processedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Processing Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Processing Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Processed</span>
                  <span className="font-medium">{emailLogs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Placement Related</span>
                  <span className="font-medium text-green-600">
                    {emailLogs.filter((log: any) => log.isPlacementRelated).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium">100%</span>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">How It Works</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <p>Scans your Gmail for new emails</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <p>Uses AI to detect placement-related content</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <p>Extracts deadlines and company information</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <p>Schedules reminders based on your preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
