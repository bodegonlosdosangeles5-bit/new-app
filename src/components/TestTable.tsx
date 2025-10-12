import { useState, useEffect } from 'react';
import { TestService, TestRecord } from '@/services/testService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const TestTable = () => {
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [newRecord, setNewRecord] = useState({ name: '', message: '' });
  const [isCreating, setIsCreating] = useState(false);

  // Cargar registros al montar el componente
  useEffect(() => {
    loadRecords();
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('checking');
      const isConnected = await TestService.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await TestService.getTestRecords();
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.name.trim() || !newRecord.message.trim()) return;

    try {
      setIsCreating(true);
      const created = await TestService.createTestRecord(newRecord.name, newRecord.message);
      if (created) {
        setRecords(prev => [created, ...prev]);
        setNewRecord({ name: '', message: '' });
      }
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRecord = async (id: number) => {
    try {
      const success = await TestService.deleteTestRecord(id);
      if (success) {
        setRecords(prev => prev.filter(record => record.id !== id));
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Probando conexión...';
      case 'connected':
        return 'Conectado a Supabase';
      case 'error':
        return 'Error de conexión';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado de conexión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Estado de Conexión: {getStatusText()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={testConnection} variant="outline" size="sm">
              Probar Conexión
            </Button>
            <Button onClick={loadRecords} variant="outline" size="sm">
              Recargar Datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulario para crear nuevo registro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar Registro de Prueba
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newRecord.name}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Prueba de Conexión"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Input
                  id="message"
                  value={newRecord.message}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Ej: Base de datos funcionando"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isCreating} className="w-full md:w-auto">
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Registro
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabla de registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Prueba ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando registros...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay registros de prueba. Crea uno para verificar la conexión.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{record.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        ID: {record.id}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {record.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Creado: {new Date(record.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRecord(record.id)}
                    className="ml-4 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
