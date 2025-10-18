import { useState, useMemo } from "react";
import { Truck, Calendar, Weight, MapPin, Clock, TrendingUp, Plus, Eye, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RemitoProduction } from "@/components/RemitoProduction";
import { EnvioDetailModal } from "@/components/EnvioDetailModal";
import { Formula } from "@/services/formulaService";
import { useRealtimeEnvios } from "@/hooks/useRealtimeEnvios";
import { EnvioConRemitos } from "@/services/envioService";

interface ProductionSectionProps {
  formulas?: Formula[];
}

export const ProductionSection = ({ formulas = [] }: ProductionSectionProps) => {
  const [activeTab, setActiveTab] = useState("current");
  const [isCreateEnvioModalOpen, setIsCreateEnvioModalOpen] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState<EnvioConRemitos | null>(null);
  const [isEnvioDetailOpen, setIsEnvioDetailOpen] = useState(false);
  const [newEnvio, setNewEnvio] = useState({
    destino: "",
    observaciones: ""
  });
  const [isCreatingEnvio, setIsCreatingEnvio] = useState(false);

  // Hook para envíos
  const {
    envios,
    loading: enviosLoading,
    error: enviosError,
    crearEnvioConRemitosPendientes,
    getEnvioConRemitos
  } = useRealtimeEnvios();

  // Función para normalizar texto (quitar tildes, espacios y convertir a minúsculas)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .replace(/\s+/g, ''); // Quitar espacios
  };

  // Mostrar fórmulas terminadas con destino a Villa Martelli (excluyendo las procesadas)
  const currentProduction = useMemo(() => {
    console.log('🔍 Fórmulas recibidas en ProductionSection:', formulas);
    
    const filtered = formulas.filter(formula => {
      const normalizedStatus = normalizeText(formula.status);
      const normalizedDestination = normalizeText(formula.destination);
      
      const isTerminated = ['terminado', 'finalizado', 'completo', 'available'].includes(normalizedStatus);
      const isVillaMartelli = normalizedDestination === 'villamartelli';
      const isNotProcessed = normalizedStatus !== 'procesado';
      
      console.log(`📋 Fórmula ${formula.name}:`, {
        status: formula.status,
        normalizedStatus,
        destination: formula.destination,
        normalizedDestination,
        isTerminated,
        isVillaMartelli,
        isNotProcessed,
        passes: isTerminated && isVillaMartelli && isNotProcessed
      });
      
      return isTerminated && isVillaMartelli && isNotProcessed;
    });
    
    console.log('✅ Fórmulas filtradas para producción:', filtered);
    return filtered;
  }, [formulas]);

  // Calcular la producción total del mes sumando los kilogramos de todas las fórmulas terminadas (excluyendo procesadas)
  const monthlyProduction = useMemo(() => {
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

  // Funciones para manejar envíos
  const handleCreateEnvio = async () => {
    if (!newEnvio.destino.trim()) return;

    setIsCreatingEnvio(true);
    try {
      const nuevoEnvio = await crearEnvioConRemitosPendientes(
        newEnvio.destino,
        newEnvio.observaciones || undefined
      );

      if (nuevoEnvio) {
        setIsCreateEnvioModalOpen(false);
        setNewEnvio({ destino: "", observaciones: "" });
        // Cambiar a la pestaña de envíos para mostrar el nuevo envío
        setActiveTab("shipments");
      }
    } catch (error) {
      console.error('Error creando envío:', error);
    } finally {
      setIsCreatingEnvio(false);
    }
  };

  const handleViewEnvio = async (envioId: string) => {
    try {
      const envioConRemitos = await getEnvioConRemitos(envioId);
      if (envioConRemitos) {
        setSelectedEnvio(envioConRemitos);
        setIsEnvioDetailOpen(true);
      }
    } catch (error) {
      console.error('Error obteniendo detalles del envío:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "entregado":
        return "success";
      case "en_transito":
        return "warning";
      case "pendiente":
        return "secondary";
      case "cancelado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "entregado":
        return "Entregado";
      case "en_transito":
        return "En Tránsito";
      case "pendiente":
        return "Pendiente";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Control de Producción</h2>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs sm:text-sm text-black/80 dark:text-white/80">Kilos disponibles</p>
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Envíos</h3>
            <Button 
              onClick={() => setIsCreateEnvioModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear Envío
            </Button>
          </div>

          {enviosLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando envíos...</p>
            </div>
          ) : enviosError ? (
            <div className="text-center py-8">
              <p className="text-destructive">Error: {enviosError}</p>
            </div>
          ) : envios.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No hay envíos registrados</p>
              <p className="text-muted-foreground text-sm mt-2">
                Crea un envío para asociar los remitos pendientes
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {envios.map((envio) => (
                <Card key={envio.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base sm:text-lg font-semibold">
                      {envio.numero_envio}
                    </CardTitle>
                    {envio.estado !== "pendiente" && (
                      <Badge variant={getStatusColor(envio.estado) as "default" | "secondary" | "destructive" | "outline"}>
                        {getStatusText(envio.estado)}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(envio.fecha_creacion).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span>{envio.total_kilos} kg</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{envio.destino}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{envio.total_remitos} remitos</span>
                      </div>
                    </div>
                    {envio.observaciones && (
                      <div className="pt-2 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Observaciones: </span>
                          <span className="font-medium">{envio.observaciones}</span>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEnvio(envio.id)}
                        className="w-full flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal para crear envío */}
      <Dialog open={isCreateEnvioModalOpen} onOpenChange={setIsCreateEnvioModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Envío</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                value={newEnvio.destino}
                onChange={(e) => setNewEnvio(prev => ({ ...prev, destino: e.target.value }))}
                placeholder="Ej: Villa Martelli, Florencio Varela"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={newEnvio.observaciones}
                onChange={(e) => setNewEnvio(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Observaciones adicionales (opcional)"
                rows={3}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Se asociarán automáticamente todos los remitos pendientes (estado "abierto") al nuevo envío.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateEnvioModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateEnvio}
              disabled={!newEnvio.destino.trim() || isCreatingEnvio}
            >
              {isCreatingEnvio ? 'Creando...' : 'Crear Envío'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalle de envío */}
      <EnvioDetailModal
        envio={selectedEnvio}
        isOpen={isEnvioDetailOpen}
        onClose={() => {
          setIsEnvioDetailOpen(false);
          setSelectedEnvio(null);
        }}
      />
    </div>
  );
};