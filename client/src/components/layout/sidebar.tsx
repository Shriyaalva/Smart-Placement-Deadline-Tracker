import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Mail, 
  Bell, 
  Filter, 
  Settings,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Email Integration', href: '/email-integration', icon: Mail },
  { name: 'Reminders', href: '/reminders', icon: Bell },
  { name: 'Email Categories', href: '/categories', icon: Filter },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className={cn("w-64 bg-white shadow-lg", className)}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PlacementAlert</h1>
            <p className="text-sm text-gray-500">Never miss a deadline</p>
          </div>
        </div>
      </div>

      <nav className="px-6 pb-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                      isActive
                        ? "text-primary bg-blue-50"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 mt-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-2">Stay Connected</h3>
          <p className="text-sm text-blue-100 mb-3">
            Get notified about new placement opportunities
          </p>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full bg-white text-blue-600 hover:bg-blue-50"
          >
            <Sparkles className="mr-2" size={16} />
            Enable Notifications
          </Button>
        </div>
      </div>
    </aside>
  );
}
