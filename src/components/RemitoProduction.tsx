import { useState } from "react";
import { FileText, Package, Weight, Calendar, CheckCircle, XCircle, RefreshCw, AlertCircle, Truck, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRealtimeRemitos } from "@/hooks/useRealtimeRemitos";
import { useRealtimeEnvios } from "@/hooks/useRealtimeEnvios";
import { ProductionItem } from "@/services/remitoService";

interface RemitoProductionProps {
  productionItems: ProductionItem[];
}

export const RemitoProduction = ({ productionItems }: RemitoProductionProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [isCreateEnvioModalOpen, setIsCreateEnvioModalOpen] = useState(false);
  const [newEnvio, setNewEnvio] = useState({
    destino: "Villa Martelli",
    fecha: new Date().toISOString().split('T')[0]
  });
  const [isCreatingEnvio, setIsCreatingEnvio] = useState(false);

  const {
    currentRemito,
    loading,
    error,
    generateRemitoForVillaMartelli,
    closeRemito
  } = useRealtimeRemitos();

  const {
    crearEnvioConRemitosPendientes,
    crearEnvioConRemitoEspecifico
  } = useRealtimeEnvios();

  // Filtrar items de Villa Martelli
  const villaMartelliItems = productionItems.filter(item => {
    const normalizedStatus = item.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    const normalizedDestination = item.destination.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    
    const isTerminated = ['terminado', 'finalizado', 'completo', 'available'].includes(normalizedStatus);
    const isVillaMartelli = normalizedDestination === 'villamartelli';
    
    return isTerminated && isVillaMartelli;
  });

  const handleGenerateRemito = async () => {
    if (villaMartelliItems.length === 0) {
      setShowSuccessMessage("⚠️ No hay productos de Villa Martelli para generar remito");
      setTimeout(() => setShowSuccessMessage(null), 3000);
      return;
    }

    try {
      setIsGenerating(true);
      const remito = await generateRemitoForVillaMartelli(productionItems);
      
      if (remito) {
        setShowSuccessMessage(`✅ Remito generado exitosamente con ${remito.items.length} productos (${remito.total_kilos} kg)`);
        setTimeout(() => setShowSuccessMessage(null), 5000);
        // Abrir modal de envío después de generar el remito
        setIsCreateEnvioModalOpen(true);
      } else {
        setShowSuccessMessage("❌ Error al generar el remito");
        setTimeout(() => setShowSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error generando remito:', error);
      setShowSuccessMessage("❌ Error al generar el remito");
      setTimeout(() => setShowSuccessMessage(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseRemito = async () => {
    console.log('🔄 Iniciando cierre de remito...', { currentRemito });
    
    if (!currentRemito) {
      console.error('❌ No hay remito actual para cerrar');
      setShowSuccessMessage("❌ No hay remito para cerrar");
      setTimeout(() => setShowSuccessMessage(null), 3000);
      return;
    }

    if (currentRemito.estado !== 'abierto') {
      console.error('❌ El remito no está abierto:', currentRemito.estado);
      setShowSuccessMessage("❌ El remito no está abierto");
      setTimeout(() => setShowSuccessMessage(null), 3000);
      return;
    }

    try {
      setIsClosing(true);
      console.log('🔄 Llamando a closeRemito con ID:', currentRemito.id);
      const success = await closeRemito(currentRemito.id);
      console.log('✅ Resultado de closeRemito:', success);
      
      if (success) {
        setShowSuccessMessage("✅ Remito cerrado exitosamente");
        setTimeout(() => setShowSuccessMessage(null), 3000);
      } else {
        setShowSuccessMessage("❌ Error al cerrar el remito");
        setTimeout(() => setShowSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error('❌ Error cerrando remito:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setShowSuccessMessage(`❌ Error al cerrar el remito: ${errorMessage}`);
      setTimeout(() => setShowSuccessMessage(null), 5000);
    } finally {
      setIsClosing(false);
    }
  };

  const handleCreateEnvio = async () => {
    if (!newEnvio.destino.trim() || !newEnvio.fecha || !currentRemito) return;

    setIsCreatingEnvio(true);
    try {
      // Crear envío con el remito específico que se acaba de generar
      const nuevoEnvio = await crearEnvioConRemitoEspecifico(
        currentRemito.id,
        newEnvio.destino,
        newEnvio.fecha,
        undefined
      );

      if (nuevoEnvio) {
        setShowSuccessMessage(`✅ Envío creado exitosamente: ${nuevoEnvio.numero_envio}`);
        setTimeout(() => setShowSuccessMessage(null), 5000);
        setIsCreateEnvioModalOpen(false);
        setNewEnvio({ destino: "Villa Martelli", fecha: new Date().toISOString().split('T')[0] });
      } else {
        setShowSuccessMessage("❌ Error al crear el envío");
        setTimeout(() => setShowSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error creando envío:', error);
      setShowSuccessMessage("❌ Error al crear el envío");
      setTimeout(() => setShowSuccessMessage(null), 5000);
    } finally {
      setIsCreatingEnvio(false);
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cerrado':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return 'Abierto';
      case 'cerrado':
        return 'Cerrado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return 'default';
      case 'cerrado':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span className="font-medium">{showSuccessMessage}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Remito de Producción - Villa Martelli
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleGenerateRemito}
            disabled={isGenerating || loading || villaMartelliItems.length === 0}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isGenerating ? 'Generando...' : 'Generar Remito'}
          </Button>
          {currentRemito && currentRemito.estado === 'abierto' && (
            <Button
              onClick={handleCloseRemito}
              disabled={isClosing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isClosing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {isClosing ? 'Cerrando...' : 'Cerrar Remito'}
            </Button>
          )}
        </div>
      </div>

      {/* Indicadores de estado */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Cargando remito...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-destructive">
          <div>Error: {error}</div>
        </div>
      )}

      {/* Información de productos disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos Disponibles para Villa Martelli
          </CardTitle>
        </CardHeader>
        <CardContent>
          {villaMartelliItems.length === 0 ? (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hay productos terminados para Villa Martelli</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {villaMartelliItems.length} productos disponibles
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {villaMartelliItems.map((item) => (
                  <div key={item.id} className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{item.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {item.batchSize} kg
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Lote: {item.id}</div>
                      <div>
                        {item.type === 'client' ? `Cliente: ${item.clientName || 'N/A'}` : 'Stock'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remito actual */}
      {currentRemito && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Remito Actual
              </CardTitle>
              <Badge variant={getStatusColor(currentRemito.estado)} className="flex items-center gap-1">
                {getStatusIcon(currentRemito.estado)}
                {getStatusText(currentRemito.estado)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Información del remito */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p className="text-sm font-medium">
                      {new Date(currentRemito.fecha).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Kilos</p>
                    <p className="text-sm font-medium">{currentRemito.total_kilos} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Productos</p>
                    <p className="text-sm font-medium">{currentRemito.items.length}</p>
                  </div>
                </div>
              </div>

              {/* Tabla de items del remito */}
              {currentRemito.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Items del Remito</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Producto</TableHead>
                          <TableHead className="text-xs">Lote</TableHead>
                          <TableHead className="text-xs">Cliente/Stock</TableHead>
                          <TableHead className="text-xs">Kilos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRemito.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs font-medium">
                              {item.nombre_producto}
                            </TableCell>
                            <TableCell className="text-xs">
                              {item.lote || '-'}
                            </TableCell>
                            <TableCell className="text-xs">
                              {item.cliente_o_stock || '-'}
                            </TableCell>
                            <TableCell className="text-xs">
                              {item.kilos_sumados} kg
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {currentRemito.observaciones && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Observaciones</p>
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {currentRemito.observaciones}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay remito */}
      {!currentRemito && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay remito abierto
            </h3>
            <p className="text-muted-foreground">
              Genera un remito para los productos de Villa Martelli disponibles
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal para crear envío */}
      <Dialog open={isCreateEnvioModalOpen} onOpenChange={setIsCreateEnvioModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Crear Envío
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Remito generado exitosamente.</strong> Ahora puedes crear un envío que incluirá automáticamente este remito.
              </p>
            </div>
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
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={newEnvio.fecha}
                onChange={(e) => setNewEnvio(prev => ({ ...prev, fecha: e.target.value }))}
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Al crear el envío, el remito se cerrará automáticamente y aparecerá en la sección de envíos.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateEnvioModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateEnvio}
              disabled={!newEnvio.destino.trim() || !newEnvio.fecha || isCreatingEnvio}
              className="flex items-center gap-2"
            >
              {isCreatingEnvio ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Truck className="h-4 w-4" />
              )}
              {isCreatingEnvio ? 'Creando...' : 'Crear Envío'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
