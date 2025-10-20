import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateTimeDisplayProps {
  className?: string;
  showDate?: boolean;
  showTime?: boolean;
  format?: 'full' | 'compact' | 'minimal';
}

export const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  className = '',
  showDate = true,
  showTime = true,
  format = 'compact'
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    if (format === 'compact') {
      options.weekday = 'short';
      options.month = 'short';
    } else if (format === 'minimal') {
      options.weekday = undefined;
      options.year = undefined;
    }

    return date.toLocaleDateString('es-ES', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: format === 'full' ? '2-digit' : undefined
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (format === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
        {showDate && (
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">
              {currentTime.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            </span>
          </div>
        )}
        {showTime && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-mono">
              {formatTime(currentTime)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {/* Saludo */}
      <div className="text-xs text-muted-foreground font-medium">
        {getGreeting()}
      </div>
      
      {/* Fecha y Hora */}
      <div className="flex items-center space-x-3 text-sm">
        {showDate && (
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-foreground">
              {formatDate(currentTime)}
            </span>
          </div>
        )}
        
        {showTime && (
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-foreground font-mono font-medium">
              {formatTime(currentTime)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
