import { useState, useEffect } from 'react';
import { X, Package, MapPin, Calendar, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnvioConRemitos } from '@/services/envioService';

interface EnvioDetailModalProps {
  envio: EnvioConRemitos | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateEstado: (envioId: string, nuevoEstado: 'pendiente' | 'en_transito' | 'entregado' | 'cancelado') => Promise<boolean>;
}

export const EnvioDetailModal = ({ 
  envio, 
  isOpen, 
  onClose, 
  onUpdateEstado 
}: EnvioDetailModalProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!envio) return null;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
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
    switch (estado) {
      case 'pendiente':
        return <Clock className="h-4 w-4" />;
      case 'en_transito':
        return <Truck className="h-4 w-4" />;
      case 'entregado':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelado':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
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

  const handleUpdateEstado = async (nuevoEstado: 'pendiente' | 'en_transito' | 'entregado' | 'cancelado') => {
    setIsUpdating(true);
    try {
      await onUpdateEstado(envio.id, nuevoEstado);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Envío {envio.numero_envio}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Información general del envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información del Envío</span>
                <Badge className={`${getEstadoColor(envio.estado)} flex items-center gap-1`}>
                  {getEstadoIcon(envio.estado)}
                  {getEstadoText(envio.estado)}
                </Badge>
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

          {/* Controles de estado */}
          {envio.estado !== 'entregado' && envio.estado !== 'cancelado' && (
            <Card>
              <CardHeader>
                <CardTitle>Actualizar Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {envio.estado === 'pendiente' && (
                    <Button
                      onClick={() => handleUpdateEstado('en_transito')}
                      disabled={isUpdating}
                      className="flex items-center gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      Marcar como En Tránsito
                    </Button>
                  )}
                  {envio.estado === 'en_transito' && (
                    <Button
                      onClick={() => handleUpdateEstado('entregado')}
                      disabled={isUpdating}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Marcar como Entregado
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateEstado('cancelado')}
                    disabled={isUpdating}
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Cancelar Envío
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                            <Badge className={getEstadoColor(remito.estado)}>
                              {getEstadoText(remito.estado)}
                            </Badge>
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
