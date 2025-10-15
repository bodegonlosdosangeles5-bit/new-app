import { useState } from "react";
import { Search, Package, MapPin, AlertTriangle, Edit, Save, X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRealtimeInventory } from "@/hooks/useRealtimeInventory";
import { InventoryItem } from "@/services/inventoryService";

export const InventorySection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    certificate: "",
    rack: "",
    place: "",
    level: "",
    currentStock: "",
    category: "Aceites Esenciales",
    unit: "g", // Gramos por defecto
    status: "normal"
  });

  // Usar el hook de Realtime para manejar las materias primas
  const { 
    inventoryItems, 
    loading, 
    error, 
    createInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem 
  } = useRealtimeInventory();

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.certificate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "destructive";
      case "low": return "warning";
      default: return "success";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical": return "Crítico";
      case "low": return "Bajo";
      default: return "Normal";
    }
  };

  const getStockPercentage = (current: number, min: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  // Función para convertir gramos a kilogramos para mostrar
  const convertToDisplayUnit = (value: number, unit: string) => {
    if (unit === 'g' && value >= 1000) {
      return `${(value / 1000).toFixed(2)} kg`;
    }
    return `${value} ${unit}`;
  };

  // Función para convertir de kilogramos a gramos para guardar
  const convertToStorageUnit = (value: number, unit: string) => {
    if (unit === 'kg') {
      return value * 1000;
    }
    return value;
  };

  // Función para obtener la unidad de almacenamiento (siempre gramos)
  const getStorageUnit = (displayUnit: string) => {
    return 'g';
  };

  // Función para determinar la unidad basada en el formato del número
  const getSmartUnit = (value: number) => {
    const str = value.toString();
    // Si tiene punto decimal y es menor a 1, es gramos
    if (str.includes('.') && value < 1) {
      return 'g';
    }
    // Si es un número entero o mayor a 1, es kilogramos
    return 'kg';
  };

  // Función para convertir a gramos basado en la unidad inteligente
  const convertToGrams = (value: number) => {
    const unit = getSmartUnit(value);
    return unit === 'kg' ? value * 1000 : value;
  };

  // Función para mostrar el valor con la unidad correcta
  const displayWithSmartUnit = (value: number) => {
    const unit = getSmartUnit(value);
    return unit === 'kg' ? `${value} kg` : `${value} g`;
  };

  const handleEditItem = (item: InventoryItem) => {
    // Convertir de gramos a la unidad de visualización apropiada
    const displayValue = item.currentStock >= 1000 ? item.currentStock / 1000 : item.currentStock;
    const displayUnit = item.currentStock >= 1000 ? 'kg' : 'g';
    
    setEditingItem({ 
      ...item, 
      unit: displayUnit,
      currentStock: displayValue
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingItem) {
      try {
        // Convertir a gramos para almacenamiento usando la lógica inteligente
        const currentValue = parseFloat(editingItem.currentStock.toString()) || 0;
        const stockInGrams = convertToGrams(currentValue);
        
        const updates = {
          ...editingItem,
          currentStock: stockInGrams,
          unit: 'g', // Siempre almacenar en gramos
          location: `${editingItem.rack}-${editingItem.place}-${editingItem.level}`,
        };
        await updateInventoryItem(editingItem.id, updates);
        setIsEditModalOpen(false);
        setEditingItem(null);
      } catch (error) {
        console.error('Error actualizando materia prima:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (field: string, value: string) => {
    if (editingItem) {
      setEditingItem(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddItem = () => {
    setNewItem({
      name: "",
      certificate: "",
      rack: "",
      place: "",
      level: "",
      currentStock: "",
      category: "Aceites Esenciales",
      unit: "g", // Gramos por defecto
      status: "normal"
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNewItem = async () => {
    // Validar campos requeridos
    if (!newItem.name.trim()) {
      alert('Por favor ingresa el nombre de la materia prima');
      return;
    }
    if (!newItem.certificate.trim()) {
      alert('Por favor ingresa el número de certificado');
      return;
    }
    if (!newItem.rack.trim()) {
      alert('Por favor ingresa el rack');
      return;
    }
    if (!newItem.place.trim()) {
      alert('Por favor ingresa el lugar');
      return;
    }
    if (!newItem.level.trim()) {
      alert('Por favor ingresa el nivel');
      return;
    }
    if (!newItem.currentStock || parseFloat(newItem.currentStock) <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    setIsCreating(true);
    
    try {
      const stockValue = parseFloat(newItem.currentStock);
      
      // Convertir a gramos para almacenamiento usando lógica inteligente
      const currentStockInGrams = convertToGrams(stockValue);
      
      // Valores por defecto para stock mínimo y máximo
      const minStockInGrams = 5000; // 5kg en gramos por defecto
      const maxStockInGrams = 25000; // 25kg en gramos por defecto
      
      const itemToAdd = {
        name: newItem.name.trim(),
        category: newItem.category,
        currentStock: currentStockInGrams,
        minStock: minStockInGrams,
        maxStock: maxStockInGrams,
        unit: 'g', // Siempre almacenar en gramos
        location: `${newItem.rack}-${newItem.place}-${newItem.level}`,
        certificate: newItem.certificate.trim(),
        rack: newItem.rack.trim(),
        place: newItem.place.trim(),
        level: newItem.level.trim(),
      };

      console.log('🔄 Intentando crear materia prima:', itemToAdd);
      const result = await createInventoryItem(itemToAdd);
      
      if (result) {
        console.log('✅ Materia prima creada exitosamente');
        setIsAddModalOpen(false);
        setNewItem({
          name: "",
          certificate: "",
          rack: "",
          place: "",
          level: "",
          currentStock: "",
          category: "Aceites Esenciales",
          unit: "g", // Gramos por defecto
          status: "normal"
        });
      } else {
        alert('Error al crear la materia prima. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error creando materia prima:', error);
      alert(`Error al crear la materia prima: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAddModalOpen(false);
    setNewItem({
      name: "",
      certificate: "",
      rack: "",
      place: "",
      level: "",
      currentStock: "",
      category: "Aceites Esenciales",
      unit: "g", // Gramos por defecto
      status: "normal"
    });
  };

  const handleNewItemInputChange = (field: string, value: string) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Inventario de Materias Primas</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80 lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, certificado o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAddItem} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Materia Prima
          </Button>
        </div>
      </div>

      {/* Indicadores de estado */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Cargando materias primas...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-destructive">
          <div>Error: {error}</div>
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? "No se encontraron materias primas" : "No hay materias primas"}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? "Intenta con otros términos de búsqueda." 
              : "Agrega tu primera materia prima para comenzar."
            }
          </p>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="cards-grid">
          {filteredItems.map((item) => (
          <Card key={item.id} className="card-elegant">
            <CardContent className="card-content">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="card-title truncate">
                    {item.name}
                  </h3>
                  <p className="card-subtitle">
                    Certificado: {item.certificate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getStatusColor(item.status) === "destructive" ? "destructive" : 
                                getStatusColor(item.status) === "warning" ? "secondary" : "default"}
                    className="card-badge"
                  >
                    {getStatusText(item.status)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditItem(item)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="card-icon" />
                    <span className="card-description font-medium">Stock Actual</span>
                  </div>
                  <span className="metric-value text-lg">
                    {item.currentStock >= 1000 ? 
                      `${(item.currentStock / 1000)} kg` : 
                      `${item.currentStock} g`}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="card-icon" />
                    <span className="card-description font-medium">Ubicación</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="card-badge text-center">
                      <span className="font-medium">Rack:</span> {item.rack}
                    </div>
                    <div className="card-badge text-center">
                      <span className="font-medium">Lugar:</span> {item.place}
                    </div>
                    <div className="card-badge text-center">
                      <span className="font-medium">Nivel:</span> {item.level}
                    </div>
                  </div>
                </div>


                {item.status !== "normal" && (
                  <div className="flex items-start space-x-2 p-3 rounded-lg bg-warning/10">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    <span className="card-description text-warning-foreground leading-relaxed">
                      {item.status === "critical" ? "Stock crítico - Ordenar urgente" : "Stock bajo - Considerar pedido"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Modal de Edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Materia Prima</DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Materia Prima</Label>
                <Input
                  id="name"
                  value={editingItem.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre de la materia prima"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate">Número de Certificado</Label>
                <Input
                  id="certificate"
                  value={editingItem.certificate}
                  onChange={(e) => handleInputChange('certificate', e.target.value)}
                  placeholder="Número de certificado"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rack">Rack</Label>
                  <Input
                    id="rack"
                    value={editingItem.rack}
                    onChange={(e) => handleInputChange('rack', e.target.value)}
                    placeholder="A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place">Lugar</Label>
                  <Input
                    id="place"
                    value={editingItem.place}
                    onChange={(e) => handleInputChange('place', e.target.value)}
                    placeholder="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Nivel</Label>
                  <Input
                    id="level"
                    value={editingItem.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    placeholder="3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Cantidad</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    step="0.1"
                    value={editingItem.currentStock.toString()}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      handleInputChange('currentStock', inputValue);
                    }}
                    placeholder="Ej: 1 (kg) o 0.500 (g)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <select
                    id="unit"
                    value={editingItem.unit}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      const currentValue = parseFloat(editingItem.currentStock.toString()) || 0;
                      let convertedValue;
                      
                      if (editingItem.unit === 'kg' && newUnit === 'g') {
                        // De kg a g: multiplicar por 1000
                        convertedValue = currentValue * 1000;
                      } else if (editingItem.unit === 'g' && newUnit === 'kg') {
                        // De g a kg: dividir por 1000
                        convertedValue = currentValue / 1000;
                      } else {
                        // Misma unidad: no cambiar
                        convertedValue = currentValue;
                      }
                      
                      handleInputChange('unit', newUnit);
                      handleInputChange('currentStock', convertedValue.toString());
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="g">Gramos (g)</option>
                    <option value="kg">Kilogramos (kg)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Agregar Nueva Materia Prima */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Materia Prima</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nombre de la Materia Prima</Label>
              <Input
                id="new-name"
                value={newItem.name}
                onChange={(e) => handleNewItemInputChange('name', e.target.value)}
                placeholder="Nombre de la materia prima"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-certificate">Número de Certificado</Label>
              <Input
                id="new-certificate"
                value={newItem.certificate}
                onChange={(e) => handleNewItemInputChange('certificate', e.target.value)}
                placeholder="Número de certificado"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-rack">Rack</Label>
                <Input
                  id="new-rack"
                  value={newItem.rack}
                  onChange={(e) => handleNewItemInputChange('rack', e.target.value)}
                  placeholder="A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-place">Lugar</Label>
                <Input
                  id="new-place"
                  value={newItem.place}
                  onChange={(e) => handleNewItemInputChange('place', e.target.value)}
                  placeholder="12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-level">Nivel</Label>
                <Input
                  id="new-level"
                  value={newItem.level}
                  onChange={(e) => handleNewItemInputChange('level', e.target.value)}
                  placeholder="3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-currentStock">Cantidad</Label>
                <Input
                  id="new-currentStock"
                  type="number"
                  step="0.1"
                  value={newItem.currentStock}
                  onChange={(e) => handleNewItemInputChange('currentStock', e.target.value)}
                  placeholder="25000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-unit">Unidad</Label>
                <select
                  id="new-unit"
                  value={newItem.unit}
                  onChange={(e) => handleNewItemInputChange('unit', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="g">Gramos (g)</option>
                  <option value="kg">Kilogramos (kg)</option>
                </select>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAdd} disabled={isCreating}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveNewItem} disabled={isCreating}>
              {isCreating ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};