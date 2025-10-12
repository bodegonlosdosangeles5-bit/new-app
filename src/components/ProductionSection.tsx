import { useState, useMemo } from "react";
import { Truck, Calendar, Weight, MapPin, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RemitoProduction } from "@/components/RemitoProduction";

interface Formula {
  id: string;
  name: string;
  batchSize: number;
  destination: string;
  status: string;
  date: string;
  type: string;
  clientName: string;
  ingredients: Array<{ name: string; required: number; available: number; unit: string }>;
}

interface ProductionSectionProps {
  formulas?: Formula[];
}

export const ProductionSection = ({ formulas = [] }: ProductionSectionProps) => {
  const [activeTab, setActiveTab] = useState("current");

  // Función para normalizar texto (quitar tildes, espacios y convertir a minúsculas)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .replace(/\s+/g, ''); // Quitar espacios
  };

  // Mostrar fórmulas terminadas con destino a Villa Martelli
  const currentProduction = useMemo(() => {
    console.log('🔍 Fórmulas recibidas en ProductionSection:', formulas);
    
    const filtered = formulas.filter(formula => {
      const normalizedStatus = normalizeText(formula.status);
      const normalizedDestination = normalizeText(formula.destination);
      
      const isTerminated = ['terminado', 'finalizado', 'completo', 'available'].includes(normalizedStatus);
      const isVillaMartelli = normalizedDestination === 'villamartelli';
      
      console.log(`📋 Fórmula ${formula.name}:`, {
        status: formula.status,
        normalizedStatus,
        destination: formula.destination,
        normalizedDestination,
        isTerminated,
        isVillaMartelli,
        passes: isTerminated && isVillaMartelli
      });
      
      return isTerminated && isVillaMartelli;
    });
    
    console.log('✅ Fórmulas filtradas para producción:', filtered);
    return filtered;
  }, [formulas]);

  // Calcular la producción total del mes sumando los kilogramos de todas las fórmulas terminadas
  const monthlyProduction = useMemo(() => {
    return formulas
      .filter(formula => {
        const normalizedStatus = normalizeText(formula.status);
        const normalizedDestination = normalizeText(formula.destination);
        
        const isTerminated = ['terminado', 'finalizado', 'completo', 'available'].includes(normalizedStatus);
        const isVillaMartelli = normalizedDestination === 'villamartelli';
        
        return isTerminated && isVillaMartelli;
      })
      .reduce((total, formula) => total + (formula.batchSize || 0), 0);
  }, [formulas]);


  const shipments = [
    {
      id: "SHIP-001",
      date: "2024-01-14",
      batches: ["R-2024-085"],
      totalWeight: 24.8,
      destination: "Cliente Premium SA",
      driver: "Roberto Silva",
      truck: "ABC-123",
      status: "delivered",
    },
    {
      id: "SHIP-002",
      date: "2024-01-13",
      batches: ["L-2024-084", "L-2024-083"],
      totalWeight: 98.2,
      destination: "Distribuidora Norte",
      driver: "Carmen Torres",
      truck: "XYZ-789",
      status: "in-transit",
    },
    {
      id: "SHIP-003",
      date: "2024-01-12",
      batches: ["M-2024-021"],
      totalWeight: 38.9,
      destination: "Exportadora Global",
      driver: "Luis Morales",
      truck: "DEF-456",
      status: "delivered",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "success";
      case "in-progress":
      case "in-transit":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "delivered":
        return "Entregado";
      case "in-progress":
        return "En Proceso";
      case "in-transit":
        return "En Tránsito";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Control de Producción</h2>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs sm:text-sm text-black/80 dark:text-white/80">Kilos por viaje</p>
            <p className="text-lg sm:text-2xl font-bold text-black dark:text-white">{monthlyProduction.toLocaleString()} kg</p>
          </div>
          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current" className="text-xs sm:text-sm">Producción Actual</TabsTrigger>
          <TabsTrigger value="remito" className="text-xs sm:text-sm">Remito Villa Martelli</TabsTrigger>
          <TabsTrigger value="shipments" className="text-xs sm:text-sm">Envíos</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentProduction.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg text-black dark:text-white">No hay fórmulas terminadas para Villa Martelli</p>
              <p className="text-muted-foreground text-sm mt-2 text-black dark:text-white">
                Las fórmulas terminadas con destino "Villa Martelli" aparecerán aquí automáticamente
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {currentProduction.map((formula) => (
                <Card key={formula.id} className="card-elegant hover:shadow-md transition-shadow h-64">
                  <CardHeader className="h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg font-semibold text-black dark:text-white">
                          {formula.name}
                        </CardTitle>
                        <p className="text-base text-black/80 dark:text-white/80 mt-1">
                          Lote: {formula.id} • Cantidad: {formula.batchSize} kg
                        </p>
                        <p className="text-base text-black dark:text-white font-medium mt-1">
                          Destino: {formula.destination}
                        </p>
                        <p className="text-sm text-black/80 dark:text-white/80 mt-1">
                          Fecha: {formula.date ? new Date(formula.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : 'No especificada'}
                        </p>
                        <p className="text-sm text-black/80 dark:text-white/80 mt-1">
                          Para: {formula.type === "client" ? "Cliente" : "Stock"}
                          {formula.type === "client" && formula.clientName && ` - ${formula.clientName}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Terminada
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="remito" className="space-y-4">
          <RemitoProduction productionItems={formulas} />
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {shipments.map((shipment) => (
              <Card key={shipment.id} className="card-elegant hover:shadow-md transition-shadow h-64">
                <CardHeader className="h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg font-semibold flex items-center space-x-2 text-black dark:text-white">
                        <Truck className="h-6 w-6 text-black dark:text-white flex-shrink-0" />
                        <span className="truncate">{shipment.id}</span>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-black/80 dark:text-white/80 truncate">
                        {shipment.destination}
                      </p>
                    </div>
                    <Badge 
                      variant={getStatusColor(shipment.status) === "success" ? "default" : "secondary"}
                      className="flex-shrink-0"
                    >
                      {getStatusText(shipment.status)}
                    </Badge>
                  </div>

                  <div className="space-y-3 sm:space-y-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-6 w-6 text-black dark:text-white flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-black/80 dark:text-white/80">Fecha</p>
                          <p className="font-medium text-sm sm:text-base text-black dark:text-white">{shipment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Weight className="h-6 w-6 text-black dark:text-white flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-black/80 dark:text-white/80">Peso Total</p>
                          <p className="font-medium text-sm sm:text-base text-black dark:text-white">{shipment.totalWeight} kg</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-black dark:text-white">Lotes incluidos:</p>
                      <div className="flex flex-wrap gap-1">
                        {shipment.batches.map((batch, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {batch}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-black/80 dark:text-white/80 space-y-1">
                      <p className="truncate"><span className="font-medium text-black dark:text-white">Conductor:</span> {shipment.driver}</p>
                      <p><span className="font-medium text-black dark:text-white">Vehículo:</span> {shipment.truck}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};