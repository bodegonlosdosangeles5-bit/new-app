import React from 'react';
import { Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export const RealtimeIndicator: React.FC = () => {
  const { isConnected, lastUpdate } = useRealtimeUpdates();

  return (
    <div className="flex items-center gap-2">
      {isConnected && (
        <Badge 
          variant="default"
          className="flex items-center gap-1"
        >
          <Wifi className="h-3 w-3" />
          <span className="text-xs">Tiempo Real</span>
        </Badge>
      )}
      
      {lastUpdate && (
        <Badge variant="outline" className="text-xs">
          {lastUpdate.event === 'INSERT' && '➕ Nuevo'}
          {lastUpdate.event === 'UPDATE' && '✏️ Actualizado'}
          {lastUpdate.event === 'DELETE' && '🗑️ Eliminado'}
        </Badge>
      )}
    </div>
  );
};
