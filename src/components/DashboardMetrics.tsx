import { Package, FlaskConical, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const DashboardMetrics = () => {
  const metrics = [
    {
      title: "Materias Primas",
      value: "142",
      subtitle: "items en stock",
      icon: Package,
      color: "primary",
      progress: 85,
    },
    {
      title: "Fórmulas Activas",
      value: "28",
      subtitle: "listas para producir",
      icon: FlaskConical,
      color: "secondary",
      progress: 75,
    },
    {
      title: "Producción Mensual",
      value: "1,250 kg",
      subtitle: "esencias producidas",
      icon: TrendingUp,
      color: "accent",
      progress: 90,
    },
    {
      title: "Alertas de Stock",
      value: "8",
      subtitle: "materiales por agotar",
      icon: AlertTriangle,
      color: "warning",
      progress: 30,
    },
  ];

  const recentActivity = [
    {
      type: "production",
      message: "Esencia Lavanda Premium - 50kg completados",
      time: "Hace 2 horas",
      status: "success",
    },
    {
      type: "inventory",
      message: "Stock bajo: Aceite de Rosa (5kg restantes)",
      time: "Hace 4 horas",
      status: "warning",
    },
    {
      type: "formula",
      message: "Nueva fórmula 'Citrus Fresh' creada",
      time: "Hace 6 horas",
      status: "success",
    },
    {
      type: "production",
      message: "Lote L-2024-089 enviado al rack A-12",
      time: "Hace 8 horas",
      status: "success",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="metric-card hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${metric.color}/10 flex-shrink-0`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {metric.subtitle}
                </p>
                <div className="mt-3 sm:mt-4">
                  <Progress value={metric.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-semibold">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start sm:items-center space-x-3 sm:space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full bg-${activity.status === 'success' ? 'success' : 'warning'} flex-shrink-0 mt-2 sm:mt-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};