import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, GraduationCap } from 'lucide-react';
import { useGmail } from '@/hooks/use-gmail';

export default function Dashboard() {
  const { connectGmail, isConnecting } = useGmail();
  
  // Get user from localStorage (in a real app, this would come from auth context)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const { data: stats = { activeOpportunities: 0, upcomingDeadlines: 0, applicationsSent: 0, emailsProcessed: 0 } } = useQuery({
    queryKey: [`/api/stats/${user.id}`],
    enabled: !!user.id,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: [`/api/upcoming-deadlines/${user.id}`],
    enabled: !!user.id,
  });

  // If user is not connected to Gmail, show setup screen
  if (!user.id || !user.isGmailConnected) {
    return (
      <div className="flex-1 overflow-x-hidden">
        <Header 
          title="Welcome to PlacementAlert" 
          subtitle="Connect your Gmail to get started"
        />
        
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="text-primary" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Never Miss a Placement Opportunity Again
                  </h2>
                  <p className="text-gray-600 mb-8">
                    PlacementAlert automatically scans your Gmail for placement opportunities and sends you timely reminders before application deadlines.
                  </p>
                  
                  <div className="space-y-4 mb-6 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Automatically detect placement-related emails</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Extract application deadlines intelligently</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Send timely reminders before deadlines</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Keep track of all your opportunities</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={connectGmail}
                    disabled={isConnecting}
                    size="lg"
                    className="w-full bg-primary hover:bg-blue-700"
                  >
                    <Mail className="mr-2" size={20} />
                    {isConnecting ? 'Connecting...' : 'Connect Gmail Account'}
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    We only read your emails to detect placement opportunities. Your privacy is our priority.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden">
      <Header 
        title="Dashboard" 
        subtitle="Track your placement deadlines and stay organized"
        user={user}
      />
      
      <div className="p-8">
        <StatsCards stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <UpcomingDeadlines opportunities={opportunities} />
          <QuickActions user={user} />
        </div>
      </div>
    </div>
  );
}
