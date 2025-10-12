import { useState } from "react";
import { FileText, Package, Weight, Calendar, CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRealtimeRemitos } from "@/hooks/useRealtimeRemitos";
import { ProductionItem } from "@/services/remitoService";

interface RemitoProductionProps {
  productionItems: ProductionItem[];
}

export const RemitoProduction = ({ productionItems }: RemitoProductionProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

  const {
    currentRemito,
    loading,
    error,
    generateRemitoForVillaMartelli,
    closeRemito
  } = useRealtimeRemitos();

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
    if (!currentRemito) return;

    try {
      setIsClosing(true);
      const success = await closeRemito(currentRemito.id);
      
      if (success) {
        setShowSuccessMessage("✅ Remito cerrado exitosamente");
        setTimeout(() => setShowSuccessMessage(null), 3000);
      } else {
        setShowSuccessMessage("❌ Error al cerrar el remito");
        setTimeout(() => setShowSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error cerrando remito:', error);
      setShowSuccessMessage("❌ Error al cerrar el remito");
      setTimeout(() => setShowSuccessMessage(null), 5000);
    } finally {
      setIsClosing(false);
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
                          <TableHead className="text-xs">Cant. Lotes</TableHead>
                          <TableHead className="text-xs">Notas</TableHead>
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
                            <TableCell className="text-xs">
                              {item.cantidad_lotes}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {item.notas || '-'}
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
    </div>
  );
};
