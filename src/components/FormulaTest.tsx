import { useState, useEffect } from 'react';
import { FormulaService } from '@/services/formulaService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface FormulaTestProps {
  formulas: any[];
  loading: boolean;
  error: string | null;
  createFormula: (formula: any) => Promise<any>;
  updateFormula: (id: string, updates: any) => Promise<any>;
  deleteFormula: (id: string) => Promise<boolean>;
}

export const FormulaTest = ({ formulas, loading, error, createFormula, updateFormula, deleteFormula }: FormulaTestProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isCreating, setIsCreating] = useState(false);
  const [newFormula, setNewFormula] = useState({
    name: '',
    batchSize: '',
    destination: 'Villa Martelli', // Valor por defecto para stock
    type: 'stock',
    clientName: '',
    status: 'available' // Campo de estatus
  });

  // Logging para debug
  console.log('🧪 FormulaTest - Props recibidas:', { 
    formulasCount: formulas.length, 
    loading, 
    error,
    formulas: formulas.map(f => ({ id: f.id, name: f.name, status: f.status }))
  });

  // Probar conexión al montar el componente
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('checking');
      const data = await FormulaService.getFormulas();
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormula.name.trim() || !newFormula.batchSize.trim()) {
      console.error('❌ Faltan campos requeridos:', {
        name: newFormula.name,
        batchSize: newFormula.batchSize
      });
      return;
    }

    try {
      setIsCreating(true);
      console.log('🚀 Iniciando creación de fórmula...');
      
      // Lógica automática: Stock = Villa Martelli, Cliente = Florencio Varela
      const autoDestination = newFormula.type === 'stock' ? 'Villa Martelli' : 'Florencio Varela';
      
      const formulaData = {
        name: newFormula.name,
        batchSize: parseInt(newFormula.batchSize),
        destination: autoDestination, // Destino automático
        type: newFormula.type,
        clientName: newFormula.type === 'client' ? newFormula.clientName : '',
        status: newFormula.status, // Usar el estatus seleccionado
        missingIngredients: [] // Sin materias faltantes por defecto
      };

      console.log('📝 Datos de la fórmula a crear:', formulaData);

      // Usar el hook global para crear la fórmula
      await createFormula(formulaData);
      
      // Resetear el formulario
      setNewFormula({
        name: '',
        batchSize: '',
        destination: 'Villa Martelli', // Reset con valor por defecto
        type: 'stock',
        clientName: '',
        status: 'available' // Reset con valor por defecto
      });
      
      console.log('🎉 Fórmula creada exitosamente');
    } catch (error) {
      console.error('❌ Error creating formula:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteFormula = async (id: string) => {
    try {
      await deleteFormula(id);
    } catch (error) {
      console.error('Error deleting formula:', error);
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
            <Button onClick={testConnection} variant="outline" size="sm">
              Recargar Fórmulas
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario para crear nueva fórmula */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Crear Nueva Fórmula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateFormula} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Fórmula</Label>
                <Input
                  id="name"
                  value={newFormula.name}
                  onChange={(e) => setNewFormula(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Lavanda Premium"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchSize">Cantidad (kg)</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={newFormula.batchSize}
                  onChange={(e) => setNewFormula(prev => ({ ...prev, batchSize: e.target.value }))}
                  placeholder="50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    {newFormula.type === 'stock' ? 'Villa Martelli' : 'Florencio Varela'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {newFormula.type === 'stock' 
                      ? 'Stock → Villa Martelli (automático)' 
                      : 'Cliente → Florencio Varela (automático)'
                    }
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newFormula.type}
                  onValueChange={(value) => setNewFormula(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estatus</Label>
                <Select
                  value={newFormula.status}
                  onValueChange={(value) => setNewFormula(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Terminada</SelectItem>
                    <SelectItem value="incomplete">Faltante de materia prima</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {newFormula.type === 'client' && (
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente</Label>
                <Input
                  id="clientName"
                  value={newFormula.clientName}
                  onChange={(e) => setNewFormula(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nombre del cliente"
                />
              </div>
            )}

            <Button type="submit" disabled={isCreating} className="w-full md:w-auto">
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Fórmula
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de fórmulas */}
      <Card>
        <CardHeader>
          <CardTitle>Fórmulas ({formulas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando fórmulas...
            </div>
          ) : formulas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay fórmulas. Crea una para verificar la conexión.
            </div>
          ) : (
            <div className="space-y-3">
              {formulas.map((formula) => (
                <div
                  key={formula.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{formula.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {formula.batchSize} kg
                      </Badge>
                      <Badge 
                        variant={formula.status === 'available' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {formula.status === 'available' ? 'Terminada' : 'Faltante de materia prima'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      Destino: {formula.destination} • Tipo: {formula.type === 'client' ? 'Cliente' : 'Stock'}
                      {formula.type === 'client' && formula.clientName && ` • ${formula.clientName}`}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteFormula(formula.id)}
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
