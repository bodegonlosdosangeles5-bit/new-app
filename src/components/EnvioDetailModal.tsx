import { X, Package, MapPin, Calendar, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnvioConRemitos } from '@/services/envioService';

interface EnvioDetailModalProps {
  envio: EnvioConRemitos | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EnvioDetailModal = ({ 
  envio, 
  isOpen, 
  onClose
}: EnvioDetailModalProps) => {
  if (!envio) return null;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'en_transito':
        return 'bg-blue-100 text-blue-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    return <Clock className="h-4 w-4" />;
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'en_transito':
        return 'En Tránsito';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Envío {envio.numero_envio}
            </DialogTitle>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Información general del envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información del Envío</span>
                {envio.estado !== "pendiente" && (
                  <Badge className={`${getEstadoColor(envio.estado)} flex items-center gap-1`}>
                    {getEstadoIcon(envio.estado)}
                    {getEstadoText(envio.estado)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Número de Envío</p>
                  <p className="text-lg font-semibold">{envio.numero_envio}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Destino</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {envio.destino}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Kilos</p>
                  <p className="text-lg font-semibold">{envio.total_kilos} kg</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Remitos</p>
                  <p className="text-lg font-semibold">{envio.total_remitos}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(envio.fecha_creacion).toLocaleDateString()}
                  </p>
                </div>
                {envio.fecha_envio && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Fecha de Envío</p>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(envio.fecha_envio).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {envio.observaciones && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{envio.observaciones}</p>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Lista de remitos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Remitos Asociados ({envio.remitos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {envio.remitos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No hay remitos asociados a este envío
                </p>
              ) : (
                <div className="space-y-4">
                  {envio.remitos.map((remito) => (
                    <Card key={remito.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Remito {remito.id}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {remito.total_kilos} kg
                            </Badge>
                            {remito.estado !== "abierto" && (
                              <Badge className={getEstadoColor(remito.estado)}>
                                {getEstadoText(remito.estado)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Destino: {remito.destino}</p>
                          <p>Fecha: {new Date(remito.fecha).toLocaleDateString()}</p>
                          {remito.observaciones && (
                            <p>Observaciones: {remito.observaciones}</p>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Productos en el Remito:</h4>
                          {remito.items.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No hay productos en este remito</p>
                          ) : (
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
                                {remito.items.map((item) => (
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
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
