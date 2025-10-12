import { useState } from "react";
import { FlaskConical, CheckCircle, XCircle, Clock, Beaker, Plus, Filter, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormulasSectionProps {
  formulas: any[];
  setFormulas: (formulas: any[]) => void;
}

export const FormulasSection = ({ formulas, setFormulas }: FormulasSectionProps) => {
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<any>(null);
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(true);
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [newFormula, setNewFormula] = useState({
    id: "",
    lot: "",
    name: "",
    batchSize: "",
    destination: "",
    date: "",
    type: "stock", // "stock" o "client"
    clientName: "",
    missingIngredients: [{ name: "", required: "", unit: "" }]
  });

  // Inicializar con datos de ejemplo si no hay fórmulas
  const initialFormulas = [
    {
      id: "F001",
      name: "Lavanda Premium",
      description: "Fragancia clásica de lavanda con notas florales",
      category: "Floral",
      batchSize: 50,
      status: "available",
      estimatedTime: "4 horas",
      destination: "Florencio Varela",
      ingredients: [
        { name: "Aceite Esencial de Lavanda", required: 15, available: 25.5, unit: "kg" },
        { name: "Alcohol Etílico 96°", required: 30, available: 180, unit: "L" },
        { name: "Benzilacetato", required: 2.5, available: 12.8, unit: "kg" },
        { name: "Linalool Sintético", required: 1.2, available: 2.1, unit: "kg" },
      ],
    },
    {
      id: "F002",
      name: "Rosa Elegante",
      description: "Esencia refinada con pétalos de rosa búlgara",
      category: "Floral",
      batchSize: 25,
      status: "incomplete",
      estimatedTime: "6 horas",
      destination: "Villa Martelli",
      ingredients: [
        { name: "Aceite de Rosa Búlgara", required: 10, available: 5.2, unit: "kg" },
        { name: "Alcohol Etílico 96°", required: 15, available: 180, unit: "L" },
        { name: "Benzilacetato", required: 1.8, available: 12.8, unit: "kg" },
      ],
    },
    {
      id: "F003",
      name: "Citrus Fresh",
      description: "Mezcla energizante de cítricos mediterráneos",
      category: "Cítrica",
      batchSize: 75,
      status: "available",
      estimatedTime: "3 horas",
      destination: "Villa Martelli",
      ingredients: [
        { name: "Aceite Esencial de Lavanda", required: 8, available: 25.5, unit: "kg" },
        { name: "Alcohol Etílico 96°", required: 45, available: 180, unit: "L" },
        { name: "Linalool Sintético", required: 3.2, available: 2.1, unit: "kg" },
      ],
    },
    {
      id: "F004",
      name: "Maderas Nobles",
      description: "Fragancia amaderada con cedro y sándalo",
      category: "Amaderada",
      batchSize: 40,
      status: "incomplete",
      estimatedTime: "5 horas",
      destination: "Florencio Varela",
      ingredients: [
        { name: "Aceite Esencial de Lavanda", required: 12, available: 25.5, unit: "kg" },
        { name: "Linalool Sintético", required: 4.5, available: 2.1, unit: "kg" },
        { name: "Benzilacetato", required: 3.2, available: 12.8, unit: "kg" },
      ],
    },
  ];

  // Usar fórmulas de props o inicializar con datos de ejemplo
  const currentFormulas = formulas.length > 0 ? formulas : initialFormulas;


  const getFormulaStatus = (formula: { ingredients: Array<{ available: number; required: number }> }) => {
    const missingIngredients = formula.ingredients.filter(
      (ing: { available: number; required: number }) => ing.available < ing.required
    );
    return missingIngredients.length === 0 ? "available" : "incomplete";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-6 w-6 text-white" />;
      case "incomplete":
        return <XCircle className="h-6 w-6 text-white" />;
      default:
        return <Clock className="h-6 w-6 text-white" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Terminada";
      case "incomplete":
        return "Material insuficiente";
      default:
        return "En revisión";
    }
  };

  const getCompletionPercentage = (formula: { ingredients: Array<{ available: number; required: number }> }) => {
    const availableCount = formula.ingredients.filter(
      (ing: { available: number; required: number }) => ing.available >= ing.required
    ).length;
    return Math.round((availableCount / formula.ingredients.length) * 100);
  };

  // Filtrar fórmulas según el estado y destino seleccionado
  const filteredFormulas = currentFormulas.filter(formula => {
    const actualStatus = getFormulaStatus(formula);
    const statusMatch = showOnlyIncomplete ? actualStatus === "incomplete" : true;
    const destinationMatch = destinationFilter === "all" || formula.destination === destinationFilter;
    return statusMatch && destinationMatch;
  });

  const handleInputChange = (field: string, value: string) => {
    setNewFormula(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAllMateriaChange = (index: number, field: string, value: string) => {
    setNewFormula(prev => ({
      ...prev,
      allMaterias: prev.allMaterias.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addAllMateria = () => {
    setNewFormula(prev => ({
      ...prev,
      allMaterias: [...prev.allMaterias, { name: "", required: "", available: "", unit: "" }]
    }));
  };

  const removeAllMateria = (index: number) => {
    setNewFormula(prev => ({
      ...prev,
      allMaterias: prev.allMaterias.filter((_, i) => i !== index)
    }));
  };

  const handleMissingIngredientChange = (index: number, field: string, value: string) => {
    setNewFormula(prev => ({
      ...prev,
      missingIngredients: prev.missingIngredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addMissingIngredient = () => {
    setNewFormula(prev => ({
      ...prev,
      missingIngredients: [...prev.missingIngredients, { name: "", required: "", unit: "" }]
    }));
  };

  const removeMissingIngredient = (index: number) => {
    setNewFormula(prev => ({
      ...prev,
      missingIngredients: prev.missingIngredients.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solo usar materias primas faltantes
    const missingIngredients = newFormula.missingIngredients.map(ing => ({
      name: ing.name,
      required: parseFloat(ing.required),
      available: 0, // Los faltantes no tienen disponible
      unit: ing.unit
    }));
    
    // Determinar el estado basado en si hay materias faltantes
    const hasMissingIngredients = missingIngredients.length > 0;
    const status = hasMissingIngredients ? "incomplete" : "available";
    
    const formulaToAdd = {
      ...newFormula,
      id: newFormula.lot, // Usar el lote como ID
      batchSize: parseInt(newFormula.batchSize),
      status: status,
      date: newFormula.date,
      type: newFormula.type,
      clientName: newFormula.type === "client" ? newFormula.clientName : "",
      ingredients: missingIngredients
    };
    
    setFormulas([...currentFormulas, formulaToAdd]);
    setIsModalOpen(false);
    // Resetear el formulario
    setNewFormula({
      id: "",
      lot: "",
      name: "",
      batchSize: "",
      destination: "",
      date: "",
      type: "stock",
      clientName: "",
      missingIngredients: [{ name: "", required: "", unit: "" }]
    });
  };

  const handleEditFormula = (formula: any) => {
    setEditingFormula({ ...formula });
    setIsEditModalOpen(true);
  };

  const handleUpdateFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFormula) {
      setFormulas(currentFormulas.map(formula => 
        formula.id === editingFormula.id ? editingFormula : formula
      ));
      setIsEditModalOpen(false);
      setEditingFormula(null);
    }
  };

  const handleEditIngredientChange = (index: number, field: string, value: string) => {
    if (editingFormula) {
      setEditingFormula(prev => ({
        ...prev,
        ingredients: prev.ingredients.map((ing, i) => 
          i === index ? { ...ing, [field]: value } : ing
        )
      }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {showOnlyIncomplete ? "Fórmulas Incompletas" : "Gestión de Fórmulas"}
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={showOnlyIncomplete ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyIncomplete(!showOnlyIncomplete)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showOnlyIncomplete ? "Mostrar Todas" : "Solo Incompletas"}
            </Button>
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los destinos</SelectItem>
                <SelectItem value="Florencio Varela">Florencio Varela</SelectItem>
                <SelectItem value="Villa Martelli">Villa Martelli</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
          onClick={() => setIsModalOpen(true)}
        >
          <FlaskConical className="h-6 w-6 mr-2" />
          Nueva Fórmula
        </Button>
      </div>

      {filteredFormulas.length === 0 ? (
        <div className="text-center py-12">
          <Beaker className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {showOnlyIncomplete ? "¡Excelente!" : "No hay fórmulas"}
          </h3>
          <p className="text-muted-foreground">
            {showOnlyIncomplete 
              ? "Todas las fórmulas tienen los materiales necesarios disponibles." 
              : "No se encontraron fórmulas en el sistema."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredFormulas.map((formula) => {
          const actualStatus = getFormulaStatus(formula);
          const completion = getCompletionPercentage(formula);
          
          return (
            <Card key={formula.id} className="card-elegant">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center space-x-2 text-white">
                      <Beaker className="h-6 w-6 text-white" />
                      <span>{formula.name}</span>
                    </CardTitle>
                    <p className="text-base text-white mt-1">
                      Lote: {formula.id} • Cantidad: {formula.batchSize} kg
                    </p>
                    <p className="text-base text-white font-medium mt-1">
                      Destino: {formula.destination}
                    </p>
                    <p className="text-sm text-white/80 mt-1">
                      Fecha: {formula.date ? new Date(formula.date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'No especificada'}
                    </p>
                    <p className="text-sm text-white/80 mt-1">
                      Para: {formula.type === "client" ? "Cliente" : "Stock"}
                      {formula.type === "client" && formula.clientName && ` - ${formula.clientName}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusIcon(actualStatus)}
                    <Badge 
                      variant={actualStatus === "available" ? "default" : "destructive"}
                      className={actualStatus === "available" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    >
                      {getStatusText(actualStatus)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {actualStatus === "incomplete" && (
                  <div className="space-y-3">
                    <h4 className="text-base font-medium text-white flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Materias Primas Faltantes:
                    </h4>
                    <div className="space-y-2">
                      {formula.ingredients
                        .filter(ingredient => ingredient.available < ingredient.required)
                        .map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                            <div className="flex-1">
                              <p className="text-base font-medium text-white">
                                {ingredient.name}
                              </p>
                              <p className="text-base text-white">
                                Necesario: {ingredient.required} {ingredient.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-medium text-white">
                                Disponible: {ingredient.available} {ingredient.unit}
                              </p>
                              <p className="text-base text-white font-semibold">
                                Faltan: {ingredient.required - ingredient.available} {ingredient.unit}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {actualStatus === "available" && (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-base text-white font-medium">
                      Terminada
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditFormula(formula)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Modal para nueva fórmula */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">Crear Nueva Fórmula</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lot">Lote del Producto</Label>
                <Input
                  id="lot"
                  value={newFormula.lot}
                  onChange={(e) => handleInputChange("lot", e.target.value)}
                  placeholder="Ej: L-2024-089"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={newFormula.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ej: Lavanda Premium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batchSize">Cantidad en Kilogramos</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={newFormula.batchSize}
                  onChange={(e) => handleInputChange("batchSize", e.target.value)}
                  placeholder="50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Select value={newFormula.destination} onValueChange={(value) => handleInputChange("destination", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Florencio Varela">Florencio Varela (Uso Interno)</SelectItem>
                    <SelectItem value="Villa Martelli">Villa Martelli (Sucursal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={newFormula.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Para</Label>
                <Select value={newFormula.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar para" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente</Label>
                <Input
                  id="clientName"
                  value={newFormula.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  placeholder={newFormula.type === "client" ? "Nombre del cliente" : "Solo para clientes"}
                  disabled={newFormula.type === "stock"}
                  required={newFormula.type === "client"}
                />
              </div>
            </div>

            {/* Materias Primas Faltantes */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-sm sm:text-base font-semibold">Materias Primas Faltantes (Opcional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMissingIngredient}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Materia Prima Faltante
                </Button>
              </div>

              {newFormula.missingIngredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 sm:p-4 border rounded-lg bg-red-50">
                  <div className="space-y-1">
                    <Label>Nombre de la Materia Prima</Label>
                    <Input
                      value={ingredient.name}
                      onChange={(e) => handleMissingIngredientChange(index, "name", e.target.value)}
                      placeholder="Ej: Aceite de Rosa Búlgara"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Cantidad Faltante</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={ingredient.required}
                      onChange={(e) => handleMissingIngredientChange(index, "required", e.target.value)}
                      placeholder="5.2"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Unidad</Label>
                    <Select value={ingredient.unit} onValueChange={(value) => handleMissingIngredientChange(index, "unit", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newFormula.missingIngredients.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMissingIngredient(index)}
                      className="mt-4 sm:mt-6 w-full sm:w-auto sm:col-span-3"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto order-1 sm:order-2"
              >
                Crear Fórmula
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar fórmula */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">Editar Fórmula</DialogTitle>
          </DialogHeader>
          
          {editingFormula && (
            <form onSubmit={handleUpdateFormula} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-lot">Lote del Producto</Label>
                  <Input
                    id="edit-lot"
                    value={editingFormula.id}
                    onChange={(e) => setEditingFormula(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="Ej: L-2024-089"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre del Producto</Label>
                  <Input
                    id="edit-name"
                    value={editingFormula.name}
                    onChange={(e) => setEditingFormula(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Lavanda Premium"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-batchSize">Cantidad en Kilogramos</Label>
                  <Input
                    id="edit-batchSize"
                    type="number"
                    value={editingFormula.batchSize}
                    onChange={(e) => setEditingFormula(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                    placeholder="50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-destination">Destino</Label>
                  <Select 
                    value={editingFormula.destination} 
                    onValueChange={(value) => setEditingFormula(prev => ({ ...prev, destination: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar destino" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Florencio Varela">Florencio Varela (Uso Interno)</SelectItem>
                      <SelectItem value="Villa Martelli">Villa Martelli (Sucursal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Fecha</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingFormula.date || ""}
                    onChange={(e) => setEditingFormula(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Para</Label>
                  <Select 
                    value={editingFormula.type || "stock"} 
                    onValueChange={(value) => setEditingFormula(prev => ({ ...prev, type: value, clientName: value === "stock" ? "" : prev.clientName }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar para" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="client">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-clientName">Nombre del Cliente</Label>
                  <Input
                    id="edit-clientName"
                    value={editingFormula.clientName || ""}
                    onChange={(e) => setEditingFormula(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder={editingFormula.type === "client" ? "Nombre del cliente" : "Solo para clientes"}
                    disabled={editingFormula.type === "stock"}
                    required={editingFormula.type === "client"}
                  />
                </div>
              </div>

              {/* Materias Primas Faltantes editables */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label className="text-sm sm:text-base font-semibold">Materias Primas Faltantes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newIngredient = { name: "", required: 0, available: 0, unit: "kg" };
                      setEditingFormula(prev => ({
                        ...prev,
                        ingredients: [...prev.ingredients, newIngredient]
                      }));
                    }}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Materia Prima
                  </Button>
                </div>
                
                {editingFormula.ingredients
                  .filter((ingredient: any) => ingredient.available < ingredient.required)
                  .map((ingredient: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 sm:p-4 border rounded-lg bg-red-50">
                    <div className="space-y-1">
                      <Label>Nombre de la Materia Prima</Label>
                      <Input
                        value={ingredient.name}
                        onChange={(e) => handleEditIngredientChange(index, "name", e.target.value)}
                        placeholder="Ej: Aceite de Rosa Búlgara"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label>Cantidad Faltante</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={ingredient.required - ingredient.available}
                        onChange={(e) => {
                          const missing = parseFloat(e.target.value);
                          setEditingFormula(prev => ({
                            ...prev,
                            ingredients: prev.ingredients.map((ing, i) => 
                              i === index ? { ...ing, required: ing.available + missing } : ing
                            )
                          }));
                        }}
                        placeholder="5.2"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label>Unidad</Label>
                      <Select 
                        value={ingredient.unit} 
                        onValueChange={(value) => handleEditIngredientChange(index, "unit", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setEditingFormula(prev => ({
                          ...prev,
                          ingredients: prev.ingredients.filter((_, i) => i !== index)
                        }));
                      }}
                      className="mt-4 sm:mt-6 w-full sm:w-auto sm:col-span-3"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto order-1 sm:order-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};