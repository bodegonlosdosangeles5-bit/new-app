import { Package, FlaskConical, TrendingUp, Search, X, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { Formula } from "@/services/formulaService";
import { useRealtimeInventory } from "@/hooks/useRealtimeInventory";

interface DashboardMetricsProps {
  formulas?: Formula[];
}

export const DashboardMetrics = ({ formulas = [] }: DashboardMetricsProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Hook para obtener datos de inventario
  const { inventoryItems, loading: inventoryLoading } = useRealtimeInventory();

  // Función para normalizar texto (quitar tildes, espacios y convertir a minúsculas)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .replace(/\s+/g, ''); // Quitar espacios
  };

  // Calcular los kilos disponibles usando la misma lógica que ProductionSection (excluyendo procesadas)
  const kilosDisponibles = useMemo(() => {
    return formulas
      .filter(formula => {
        const normalizedStatus = normalizeText(formula.status);
        const normalizedDestination = normalizeText(formula.destination);
        
        const isTerminated = ['terminado', 'finalizado', 'completo', 'available'].includes(normalizedStatus);
        const isVillaMartelli = normalizedDestination === 'villamartelli';
        const isNotProcessed = normalizedStatus !== 'procesado';
        
        return isTerminated && isVillaMartelli && isNotProcessed;
      })
      .reduce((total, formula) => total + (formula.batchSize || 0), 0);
  }, [formulas]);

  // Calcular fórmulas terminadas para Villa Martelli (excluyendo procesadas)
  const formulasTerminadas = useMemo(() => {
    return formulas.filter(formula => {
      const normalizedStatus = normalizeText(formula.status);
      const normalizedDestination = normalizeText(formula.destination);
      
      const isTerminated = ['terminado', 'finalizado', 'completo', 'available'].includes(normalizedStatus);
      const isVillaMartelli = normalizedDestination === 'villamartelli';
      const isNotProcessed = normalizedStatus !== 'procesado';
      
      return isTerminated && isVillaMartelli && isNotProcessed;
    });
  }, [formulas]);

  // Filtrar inventario según término de búsqueda (igual que InventorySection)
  const filteredInventory = useMemo(() => {
    if (!searchTerm.trim()) return inventoryItems;
    
    const normalizedSearch = normalizeText(searchTerm);
    return inventoryItems.filter(item => 
      normalizeText(item.name).includes(normalizedSearch) ||
      normalizeText(item.certificate || '').includes(normalizedSearch) ||
      normalizeText(item.location || '').includes(normalizedSearch)
    );
  }, [inventoryItems, searchTerm]);

  const metrics = [
    {
      title: "Materias Primas",
      value: inventoryItems.length.toString(),
      subtitle: "items en stock",
      icon: Package,
      color: "primary",
      progress: 85,
      hasSearch: true,
    },
    {
      title: "Fórmulas Terminadas",
      value: formulasTerminadas.length.toString(),
      subtitle: "para Villa Martelli",
      icon: FlaskConical,
      color: "secondary",
      progress: 75,
    },
    {
      title: "Kilos Disponibles",
      value: `${kilosDisponibles.toLocaleString()} kg`,
      subtitle: "esencias producidas",
      icon: TrendingUp,
      color: "accent",
      progress: 90,
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
                <div className="flex items-center gap-2">
                  {metric.hasSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSearchOpen(true)}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  )}
                  <div className={`p-2 rounded-lg bg-${metric.color}/10 flex-shrink-0`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
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

      {/* Modal de búsqueda de inventario */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Materias Primas
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, certificado o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Resultados */}
            <div className="max-h-96 overflow-y-auto">
              {inventoryLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Cargando inventario...
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay materias primas disponibles'}
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredInventory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
                    >
                      {/* Información principal */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Certificado: {item.certificate}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                            item.status === 'critical' ? 'bg-red-100 text-red-700' :
                            item.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {item.status === 'critical' ? 'Crítico' :
                             item.status === 'low' ? 'Bajo' : 'Normal'}
                          </div>
                        </div>
                      </div>

                      {/* Información de stock y ubicación */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Stock:</span>
                          <span>{item.currentStock} {item.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Ubicación:</span>
                          <span className="truncate">{item.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="text-sm text-muted-foreground text-center">
              {searchTerm ? 
                `Mostrando ${filteredInventory.length} de ${inventoryItems.length} materias primas` :
                `Total: ${inventoryItems.length} materias primas`
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};