import React from 'react';
import { DateTimeDisplay } from '@/components/DateTimeDisplay';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardHeaderProps {
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  className = '' 
}) => {
  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
          {/* Welcome Message */}
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Control de Producción
            </h1>
            <p className="text-muted-foreground mt-1">
              Sistema de gestión para PLANTA VARELA
            </p>
          </div>
          
          {/* Date and Time Display */}
          <div className="flex-shrink-0">
            <DateTimeDisplay format="full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
