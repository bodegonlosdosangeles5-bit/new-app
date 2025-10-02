import { useState } from "react";
import { FlaskConical, CheckCircle, XCircle, Clock, Beaker, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const FormulasSection = () => {
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFormula, setNewFormula] = useState({
    name: "",
    description: "",
    category: "",
    batchSize: "",
    estimatedTime: "",
    ingredients: [{ name: "", required: "", available: "", unit: "" }]
  });

  const formulas = [
    {
      id: "F001",
      name: "Lavanda Premium",
      description: "Fragancia clásica de lavanda con notas florales",
      category: "Floral",
      batchSize: 50,
      status: "available",
      estimatedTime: "4 horas",
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
      ingredients: [
        { name: "Aceite Esencial de Lavanda", required: 12, available: 25.5, unit: "kg" },
        { name: "Linalool Sintético", required: 4.5, available: 2.1, unit: "kg" },
        { name: "Benzilacetato", required: 3.2, available: 12.8, unit: "kg" },
      ],
    },
  ];

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
        return "Lista para producir";
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

  const handleInputChange = (field: string, value: string) => {
    setNewFormula(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    setNewFormula(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addIngredient = () => {
    setNewFormula(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", required: "", available: "", unit: "" }]
    }));
  };

  const removeIngredient = (index: number) => {
    setNewFormula(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí agregarías la lógica para guardar la nueva fórmula
    console.log("Nueva fórmula:", newFormula);
    setIsModalOpen(false);
    // Resetear el formulario
    setNewFormula({
      name: "",
      description: "",
      category: "",
      batchSize: "",
      estimatedTime: "",
      ingredients: [{ name: "", required: "", available: "", unit: "" }]
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Gestión de Fórmulas</h2>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
          onClick={() => setIsModalOpen(true)}
        >
          <FlaskConical className="h-6 w-6 mr-2" />
          Nueva Fórmula
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {formulas.map((formula) => {
          const actualStatus = getFormulaStatus(formula);
          const completion = getCompletionPercentage(formula);
          
          return (
            <Card key={formula.id} className="card-elegant">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                      <Beaker className="h-6 w-6 text-white" />
                      <span>{formula.name}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formula.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {formula.id} • Lote: {formula.batchSize}kg • {formula.estimatedTime}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusIcon(actualStatus)}
                    <Badge variant={actualStatus === "available" ? "default" : "destructive"}>
                      {getStatusText(actualStatus)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Materiales disponibles</span>
                    <span className="font-medium">{completion}%</span>
                  </div>
                  <Progress value={completion} className="h-2" />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Ingredientes:</h4>
                  {formula.ingredients.map((ingredient, index) => {
                    const isAvailable = ingredient.available >= ingredient.required;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {ingredient.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Necesario: {ingredient.required} {ingredient.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            isAvailable ? "text-success" : "text-destructive"
                          }`}>
                            {ingredient.available} {ingredient.unit}
                          </p>
                          {!isAvailable && (
                            <p className="text-xs text-destructive">
                              Faltan {ingredient.required - ingredient.available} {ingredient.unit}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant={actualStatus === "available" ? "default" : "secondary"}
                    disabled={actualStatus !== "available"}
                    className="flex-1"
                  >
                    {actualStatus === "available" ? "Iniciar Producción" : "Material Insuficiente"}
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal para nueva fórmula */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">Crear Nueva Fórmula</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Fórmula</Label>
                <Input
                  id="name"
                  value={newFormula.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ej: Lavanda Premium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={newFormula.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="floral">Floral</SelectItem>
                    <SelectItem value="citrus">Cítrico</SelectItem>
                    <SelectItem value="woody">Maderoso</SelectItem>
                    <SelectItem value="oriental">Oriental</SelectItem>
                    <SelectItem value="fresh">Fresco</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newFormula.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe la fórmula y sus características..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchSize">Tamaño del Lote (kg)</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={newFormula.batchSize}
                  onChange={(e) => handleInputChange("batchSize", e.target.value)}
                  placeholder="50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Tiempo Estimado</Label>
                <Input
                  id="estimatedTime"
                  value={newFormula.estimatedTime}
                  onChange={(e) => handleInputChange("estimatedTime", e.target.value)}
                  placeholder="4 horas"
                  required
                />
              </div>
            </div>

            {/* Ingredientes */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-sm sm:text-base font-semibold">Ingredientes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-6 w-6" />
                  Agregar Ingrediente
                </Button>
              </div>

              {newFormula.ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3 sm:p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Nombre</Label>
                    <Input
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                      placeholder="Aceite esencial..."
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Cantidad Requerida</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={ingredient.required}
                      onChange={(e) => handleIngredientChange(index, "required", e.target.value)}
                      placeholder="15"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Disponible</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={ingredient.available}
                      onChange={(e) => handleIngredientChange(index, "available", e.target.value)}
                      placeholder="25.5"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Unidad</Label>
                    <Select value={ingredient.unit} onValueChange={(value) => handleIngredientChange(index, "unit", value)}>
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
                  
                  {newFormula.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      className="mt-4 sm:mt-6 w-full sm:w-auto sm:col-span-2 lg:col-span-1"
                    >
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
    </div>
  );
};