import { useState } from "react";
import { Search, Package, MapPin, AlertTriangle, Edit, Save, X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const InventorySection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    certificate: "",
    rack: "",
    place: "",
    level: "",
    currentStock: "",
    category: "Aceites Esenciales",
    minStock: 5,
    maxStock: 25,
    unit: "kg",
    status: "normal"
  });
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: "MP001",
      name: "Aceite Esencial de Lavanda",
      category: "Aceites Esenciales",
      currentStock: 25.5,
      minStock: 10,
      maxStock: 50,
      unit: "kg",
      location: "A-12-3",
      supplier: "Aromática Premium",
      lastUpdate: "2024-01-15",
      status: "normal",
      certificate: "CERT-001-2024",
      rack: "A",
      place: "12",
      level: "3",
    },
    {
      id: "MP002",
      name: "Alcohol Etílico 96°",
      category: "Solventes",
      currentStock: 180,
      minStock: 100,
      maxStock: 300,
      unit: "L",
      location: "B-05-1",
      supplier: "QuimCorp",
      lastUpdate: "2024-01-14",
      status: "normal",
      certificate: "CERT-002-2024",
      rack: "B",
      place: "05",
      level: "1",
    },
    {
      id: "MP003",
      name: "Aceite de Rosa Búlgara",
      category: "Aceites Esenciales",
      currentStock: 5.2,
      minStock: 8,
      maxStock: 20,
      unit: "kg",
      location: "A-15-2",
      supplier: "Bulgarian Rose Co.",
      lastUpdate: "2024-01-13",
      status: "low",
      certificate: "CERT-003-2024",
      rack: "A",
      place: "15",
      level: "2",
    },
    {
      id: "MP004",
      name: "Benzilacetato",
      category: "Químicos Aromáticos",
      currentStock: 12.8,
      minStock: 5,
      maxStock: 25,
      unit: "kg",
      location: "C-08-4",
      supplier: "AromaChems Ltd",
      lastUpdate: "2024-01-12",
      status: "normal",
      certificate: "CERT-004-2024",
      rack: "C",
      place: "08",
      level: "4",
    },
    {
      id: "MP005",
      name: "Linalool Sintético",
      category: "Químicos Aromáticos",
      currentStock: 2.1,
      minStock: 5,
      maxStock: 15,
      unit: "kg",
      location: "C-12-1",
      supplier: "SyntheticAromas",
      lastUpdate: "2024-01-11",
      status: "critical",
      certificate: "CERT-005-2024",
      rack: "C",
      place: "12",
      level: "1",
    },
  ]);

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

  const handleEditItem = (item: any) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      setInventoryItems(prevItems =>
        prevItems.map(item =>
          item.id === editingItem.id
            ? {
                ...editingItem,
                location: `${editingItem.rack}-${editingItem.place}-${editingItem.level}`,
                lastUpdate: new Date().toISOString().split('T')[0],
              }
            : item
        )
      );
      setIsEditModalOpen(false);
      setEditingItem(null);
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
      minStock: 5,
      maxStock: 25,
      unit: "kg",
      status: "normal"
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNewItem = () => {
    if (newItem.name && newItem.certificate && newItem.rack && newItem.place && newItem.level && newItem.currentStock) {
      const newId = `MP${String(inventoryItems.length + 1).padStart(3, '0')}`;
      const stockValue = parseFloat(newItem.currentStock);
      
      // Determinar el estado basado en el stock
      let status = "normal";
      if (stockValue <= newItem.minStock * 0.5) {
        status = "critical";
      } else if (stockValue <= newItem.minStock) {
        status = "low";
      }

      const itemToAdd = {
        id: newId,
        name: newItem.name,
        category: newItem.category,
        currentStock: stockValue,
        minStock: newItem.minStock,
        maxStock: newItem.maxStock,
        unit: newItem.unit,
        location: `${newItem.rack}-${newItem.place}-${newItem.level}`,
        lastUpdate: new Date().toISOString().split('T')[0],
        status: status,
        certificate: newItem.certificate,
        rack: newItem.rack,
        place: newItem.place,
        level: newItem.level,
      };

      setInventoryItems(prevItems => [...prevItems, itemToAdd]);
      setIsAddModalOpen(false);
      setNewItem({
        name: "",
        certificate: "",
        rack: "",
        place: "",
        level: "",
        currentStock: "",
        category: "Aceites Esenciales",
        minStock: 5,
        maxStock: 25,
        unit: "kg",
        status: "normal"
      });
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
      minStock: 5,
      maxStock: 25,
      unit: "kg",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="card-elegant hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg font-semibold truncate">
                    {item.name}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Certificado: {item.certificate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getStatusColor(item.status) === "destructive" ? "destructive" : 
                                getStatusColor(item.status) === "warning" ? "secondary" : "default"}
                    className="flex-shrink-0"
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
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-6 w-6 text-white flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Stock Actual</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-foreground">
                  {item.currentStock} {item.unit}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: {item.minStock} {item.unit}</span>
                  <span>Max: {item.maxStock} {item.unit}</span>
                </div>
                <Progress 
                  value={getStockPercentage(item.currentStock, item.minStock, item.maxStock)} 
                  className="h-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-white flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">
                  <span className="font-medium">Ubicación:</span> {item.location}
                </span>
              </div>


              {item.status !== "normal" && (
                <div className="flex items-start space-x-2 p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-warning-foreground leading-relaxed">
                    {item.status === "critical" ? "Stock crítico - Ordenar urgente" : "Stock bajo - Considerar pedido"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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

              <div className="space-y-2">
                <Label htmlFor="currentStock">Cantidad (kg)</Label>
                <Input
                  id="currentStock"
                  type="number"
                  step="0.1"
                  value={editingItem.currentStock}
                  onChange={(e) => handleInputChange('currentStock', e.target.value)}
                  placeholder="25.5"
                />
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

            <div className="space-y-2">
              <Label htmlFor="new-currentStock">Cantidad (kg)</Label>
              <Input
                id="new-currentStock"
                type="number"
                step="0.1"
                value={newItem.currentStock}
                onChange={(e) => handleNewItemInputChange('currentStock', e.target.value)}
                placeholder="25.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAdd}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveNewItem}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};