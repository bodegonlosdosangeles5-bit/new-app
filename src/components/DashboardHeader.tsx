import React from 'react';
import { DateTimeDisplay } from '@/components/DateTimeDisplay';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';

interface DashboardHeaderProps {
  className?: string;
  /**
   * Cuando es true, al hacer clic en el DateTimeDisplay se abre un modal con calendario.
   * Útil para habilitarlo sólo en la pantalla de inicio.
   */
  enableDateDialog?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  className = '',
  enableDateDialog = false
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
          
          {/* Date and Time Display with Realtime Indicator */}
          <div className="flex flex-col items-end space-y-2">
            {enableDateDialog ? (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-left hover:opacity-90 transition-opacity">
                    <DateTimeDisplay format="full" />
                  </button>
                </DialogTrigger>
                <DialogContent className="w-auto max-w-fit p-0 gap-0">
                  <Calendar 
                    mode="single" 
                    className="p-0 sm:p-0"
                    classNames={{ nav_button_next: "absolute right-10", nav_button_previous: "absolute left-10" }}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <DateTimeDisplay format="full" />
            )}
            <RealtimeIndicator />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
