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
import { Producto } from "@/services/productoService";
import { useRealtimeEnvios } from "@/hooks/useRealtimeEnvios";
import { useRealtimeRemitos } from "@/hooks/useRealtimeRemitos";
import { useRemitos } from "@/hooks/useRemitos";
import { useRealtimeProductos } from "@/hooks/useRealtimeProductos";
import { EnvioConRemitos } from "@/services/envioService";
import { RemitoWithItems } from "@/services/remitoService";

interface ProductionSectionProps {
  formulas?: Producto[]; // Mantener para compatibilidad pero no usar
}

export const ProductionSection = ({ formulas = [] }: ProductionSectionProps) => {
  // Usar el hook de productos en tiempo real
  const { productos, loading: productosLoading, error: productosError } = useRealtimeProductos();
  const [activeTab, setActiveTab] = useState("current");
  const [selectedEnvio, setSelectedEnvio] = useState<EnvioConRemitos | null>(null);
  const [isEnvioDetailOpen, setIsEnvioDetailOpen] = useState(false);
  const [selectedRemito, setSelectedRemito] = useState<RemitoWithItems | null>(null);
  const [isRemitoDetailOpen, setIsRemitoDetailOpen] = useState(false);

  // Hook para envíos
  const {
    envios,
    loading: enviosLoading,
    error: enviosError,
    crearEnvioConRemitosPendientes,
    getEnvioConRemitos
  } = useRealtimeEnvios();

  // Hook para remitos
  const {
    currentRemito,
    loading: remitosLoading,
    error: remitosError
  } = useRealtimeRemitos();

  // Hook para obtener todos los remitos
  const {
    remitos,
    loading: allRemitosLoading,
    error: allRemitosError,
    getRemitoWithItems
  } = useRemitos();

  // Función para normalizar texto (quitar tildes, espacios y convertir a minúsculas)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .replace(/\s+/g, ''); // Quitar espacios
  };

  // Mostrar productos terminados con destino a Villa Martelli
  const currentProduction = useMemo(() => {
    console.log('🔍 Productos recibidos en ProductionSection:', productos);
    
    const filtered = productos.filter(producto => {
      const normalizedStatus = normalizeText(producto.status);
      const normalizedDestination = normalizeText(producto.destination);
      
      const isTerminated = normalizedStatus === 'available';
      const isVillaMartelli = normalizedDestination === 'villamartelli';
      
      console.log(`📋 Producto ${producto.name}:`, {
        status: producto.status,
        normalizedStatus,
        destination: producto.destination,
        normalizedDestination,
        isTerminated,
        isVillaMartelli,
        passes: isTerminated && isVillaMartelli
      });
      
      return isTerminated && isVillaMartelli;
    });
    
    console.log('✅ Productos filtrados para producción:', filtered);
    return filtered;
  }, [productos]);

  // Calcular la producción total del mes sumando los kilogramos de todos los productos terminados
  const monthlyProduction = useMemo(() => {
    return productos
      .filter(producto => {
        const normalizedStatus = normalizeText(producto.status);
        const normalizedDestination = normalizeText(producto.destination);
        
        const isTerminated = normalizedStatus === 'available';
        const isVillaMartelli = normalizedDestination === 'villamartelli';
        
        return isTerminated && isVillaMartelli;
      })
      .reduce((total, producto) => total + (producto.batchSize || 0), 0);
  }, [productos]);


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

  const handleViewRemito = async (remitoId: string) => {
    try {
      const remitoConItems = await getRemitoWithItems(remitoId);
      if (remitoConItems) {
        setSelectedRemito(remitoConItems);
        setIsRemitoDetailOpen(true);
      }
    } catch (error) {
      console.error('Error obteniendo detalles del remito:', error);
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
          <RemitoProduction productionItems={productos} />
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Remitos Generados</h3>
          </div>

          {allRemitosLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando remitos...</p>
            </div>
          ) : allRemitosError ? (
            <div className="text-center py-8">
              <p className="text-destructive">Error: {allRemitosError}</p>
            </div>
          ) : remitos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No hay remitos generados</p>
              <p className="text-muted-foreground text-sm mt-2">
                Ve a la pestaña "Remito" para generar un nuevo remito
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {remitos.map((remito) => (
                <Card key={remito.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base sm:text-lg font-semibold">
                      {remito.id}
                    </CardTitle>
                    <Badge variant={getStatusColor(remito.estado) as "default" | "secondary" | "destructive" | "outline"}>
                      {getStatusText(remito.estado)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(remito.fecha).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span>{remito.total_kilos} kg</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{remito.destino}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(remito.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {remito.observaciones && (
                      <div className="pt-2 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Observaciones: </span>
                          <span className="font-medium">{remito.observaciones}</span>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRemito(remito.id)}
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


      {/* Modal de detalle de envío */}
      <EnvioDetailModal
        envio={selectedEnvio}
        isOpen={isEnvioDetailOpen}
        onClose={() => {
          setIsEnvioDetailOpen(false);
          setSelectedEnvio(null);
        }}
      />

      {/* Modal de detalle de remito */}
      <Dialog open={isRemitoDetailOpen} onOpenChange={setIsRemitoDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalles del Remito: {selectedRemito?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedRemito && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Destino</Label>
                  <p className="text-sm">{selectedRemito.destino}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha</Label>
                  <p className="text-sm">{new Date(selectedRemito.fecha).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Kilos</Label>
                  <p className="text-sm font-semibold">{selectedRemito.total_kilos} kg</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                  <Badge variant={getStatusColor(selectedRemito.estado) as "default" | "secondary" | "destructive" | "outline"}>
                    {getStatusText(selectedRemito.estado)}
                  </Badge>
                </div>
              </div>

              {/* Items del remito */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Productos ({selectedRemito.items.length})
                </Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedRemito.items.map((item, index) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.nombre_producto}</p>
                          <p className="text-xs text-muted-foreground">ID: {item.producto_id}</p>
                          {item.lote && <p className="text-xs text-muted-foreground">Lote: {item.lote}</p>}
                          {item.cliente_o_stock && <p className="text-xs text-muted-foreground">{item.cliente_o_stock}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{item.kilos_sumados} kg</p>
                          <p className="text-xs text-muted-foreground">{item.cantidad_lotes} lotes</p>
                        </div>
                      </div>
                      {item.notas && (
                        <p className="text-xs text-muted-foreground mt-2 italic">Notas: {item.notas}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedRemito.observaciones && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
                  <p className="text-sm p-3 bg-muted rounded-lg mt-1">{selectedRemito.observaciones}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemitoDetailOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};