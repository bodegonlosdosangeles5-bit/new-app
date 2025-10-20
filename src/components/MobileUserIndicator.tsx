import React from 'react';
import { User, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/components/Auth/AuthProvider';

interface MobileUserIndicatorProps {
  className?: string;
}

export const MobileUserIndicator: React.FC<MobileUserIndicatorProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!user) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
      </div>
      
      {/* User Info */}
      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
        <User className="h-3 w-3" />
        <span className="hidden sm:inline truncate max-w-20">
          {user.email?.split('@')[0]}
        </span>
      </div>
    </div>
  );
};
