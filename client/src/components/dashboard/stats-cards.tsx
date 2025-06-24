import { Briefcase, Clock, Send, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  stats: {
    activeOpportunities: number;
    upcomingDeadlines: number;
    applicationsSent: number;
    emailsProcessed: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Active Opportunities',
      value: stats.activeOpportunities,
      icon: Briefcase,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      change: '+3 this week',
      changeColor: 'text-green-600'
    },
    {
      title: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      icon: Clock,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      change: '2 due this week',
      changeColor: 'text-yellow-600'
    },
    {
      title: 'Applications Sent',
      value: stats.applicationsSent,
      icon: Send,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      change: '100% success rate',
      changeColor: 'text-green-600'
    },
    {
      title: 'Emails Processed',
      value: stats.emailsProcessed,
      icon: Mail,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      change: `${Math.round(stats.emailsProcessed * 0.06)} placement related`,
      changeColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={card.iconColor} size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${card.changeColor}`}>
                  {card.change.includes('+') ? card.change.split(' ')[0] : card.change.split(' ')[0]}
                </span>
                <span className="text-gray-500 ml-1">
                  {card.change.includes('+') ? card.change.split(' ').slice(1).join(' ') : card.change.split(' ').slice(1).join(' ')}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
