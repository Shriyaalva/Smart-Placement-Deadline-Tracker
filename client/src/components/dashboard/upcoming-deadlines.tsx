import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, ExternalLink, AlertTriangle, Clock, Calendar, CheckCircle } from 'lucide-react';
import { formatRelativeTime, getUrgencyLevel, getUrgencyColor, getUrgencyBadgeColor } from '@/lib/utils';
import { useReminders } from '@/hooks/use-reminders';

interface PlacementOpportunity {
  id: number;
  title: string;
  company: string;
  emailSubject: string;
  emailFrom: string;
  deadline: string | null;
  applicationUrl: string | null;
  status: string;
}

interface UpcomingDeadlinesProps {
  opportunities: PlacementOpportunity[];
}

export function UpcomingDeadlines({ opportunities }: UpcomingDeadlinesProps) {
  const { updateOpportunity, isUpdating } = useReminders();

  const handleApply = (opportunity: PlacementOpportunity) => {
    if (opportunity.applicationUrl) {
      window.open(opportunity.applicationUrl, '_blank');
    }
    updateOpportunity({ id: opportunity.id, status: 'applied' });
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return <AlertTriangle className="mr-1" size={12} />;
      case 'warning':
        return <Clock className="mr-1" size={12} />;
      case 'normal':
        return <Calendar className="mr-1" size={12} />;
      default:
        return <CheckCircle className="mr-1" size={12} />;
    }
  };

  if (opportunities.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No upcoming deadlines</h4>
            <p className="text-gray-600">
              Connect your Gmail account to start detecting placement opportunities automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {opportunities.map((opportunity) => {
            const urgency = getUrgencyLevel(opportunity.deadline);
            const urgencyColor = getUrgencyColor(urgency);
            const badgeColor = getUrgencyBadgeColor(urgency);
            
            return (
              <div
                key={opportunity.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${urgencyColor} ${
                  urgency === 'urgent' ? 'animate-pulse' : ''
                }`}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {opportunity.company} • Application deadline
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <Badge className={`text-xs font-medium ${badgeColor}`}>
                      {getUrgencyIcon(urgency)}
                      {opportunity.deadline ? formatRelativeTime(opportunity.deadline) : 'No deadline'}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Mail className="mr-1" size={12} />
                      From: {opportunity.emailFrom.split('@')[0]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {opportunity.applicationUrl && (
                    <Button variant="ghost" size="sm">
                      <ExternalLink size={16} />
                    </Button>
                  )}
                  {opportunity.status === 'applied' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled
                      className="bg-green-100 text-green-700 hover:bg-green-100"
                    >
                      <CheckCircle className="mr-2" size={16} />
                      Applied ✓
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleApply(opportunity)}
                      disabled={isUpdating}
                      className={
                        urgency === 'urgent'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : urgency === 'warning'
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-primary hover:bg-blue-700 text-white'
                      }
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
