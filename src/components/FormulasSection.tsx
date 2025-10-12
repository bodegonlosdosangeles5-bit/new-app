import { useState } from "react";
import { CheckCircle, XCircle, Clock, Beaker, Filter, Edit, Save, X, Plus, Upload, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormulaService } from "@/services/formulaService";

interface FormulasSectionProps {
  formulas: any[];
  setFormulas: (formulas: any[]) => void;
  createFormula?: (formula: any) => Promise<any>;
  updateFormula?: (id: string, updates: any) => Promise<any>;
  deleteFormula?: (id: string) => Promise<boolean>;
  addMissingIngredient?: (formulaId: string, ingredient: { name: string; required: number; unit: string; }) => Promise<boolean>;
  removeMissingIngredient?: (formulaId: string, ingredientName: string) => Promise<boolean>;
  loading?: boolean;
  error?: string | null;
}

export const FormulasSection = ({ 
  formulas, 
  setFormulas, 
  createFormula, 
  updateFormula, 
  deleteFormula,
  addMissingIngredient,
  removeMissingIngredient,
  loading = false,
  error = null
}: FormulasSectionProps) => {
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<any>(null);
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(true);
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
  const [selectedFormulaForIngredient, setSelectedFormulaForIngredient] = useState<any>(null);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    required: "",
    unit: "kg"
  });
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [statusChangingFormulas, setStatusChangingFormulas] = useState<Set<string>>(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [newFormula, setNewFormula] = useState({
    lot: "",
    name: "",
    batchSize: "",
    date: "",
    status: "available",
    type: "uso_interno",
    clientName: ""
  });
  const [missingIngredients, setMissingIngredients] = useState<Array<{
    name: string;
    required: string;
    unit: string;
  }>>([]);
  const [newMissingIngredient, setNewMissingIngredient] = useState({
    name: "",
    required: "",
    unit: "kg"
  });

  // Usar las fórmulas pasadas como prop
  const currentFormulas = formulas;
  
  // Logging para debug
  console.log('📋 FormulasSection - Props recibidas:', { 
    formulasCount: formulas.length, 
    loading, 
    error,
    formulas: formulas.map(f => ({ 
      id: f.id, 
      name: f.name, 
      status: f.status,
      missingIngredientsCount: f.missingIngredients?.length || 0,
      missingIngredients: f.missingIngredients
    }))
  });


  const getFormulaStatus = (formula: any) => {
    // Si la fórmula ya tiene un status definido, usarlo
    if (formula.status) {
      return formula.status;
    }
    
    // Si no tiene status, calcular basado en ingredientes faltantes
    if (formula.missingIngredients && formula.missingIngredients.length > 0) {
      return "incomplete";
    }
    
    return "available";
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
        return "✅ Terminada";
      case "incomplete":
        return "❌ Faltante de materia prima";
      default:
        return "⏳ En revisión";
    }
  };

  const getCompletionPercentage = (formula: any) => {
    // Si no hay ingredientes faltantes, está 100% completa
    if (!formula.missingIngredients || formula.missingIngredients.length === 0) {
      return 100;
    }
    
    // Si hay ingredientes faltantes, está incompleta
    return 0;
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

  const handleAddMissingIngredient = () => {
    if (newMissingIngredient.name.trim() && newMissingIngredient.required.trim()) {
      setMissingIngredients(prev => [...prev, { ...newMissingIngredient }]);
      setNewMissingIngredient({ name: "", required: "", unit: "kg" });
    }
  };

  const handleRemoveMissingIngredient = (index: number) => {
    setMissingIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleMissingIngredientChange = (field: string, value: string) => {
    setNewMissingIngredient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLoadFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createFormula) {
      console.error('No hay función createFormula disponible');
      return;
    }

    try {
      // Lógica automática: Uso interno = Florencio Varela, Todo lo demás = Villa Martelli
      const autoDestination = newFormula.type === 'uso_interno' ? 'Florencio Varela' : 'Villa Martelli';
      
      const formulaData = {
        name: newFormula.name,
        batchSize: parseInt(newFormula.batchSize),
        destination: autoDestination,
        date: newFormula.date,
        type: newFormula.type === 'uso_interno' ? 'stock' : 'client',
        clientName: newFormula.type === 'cliente' ? newFormula.clientName : '',
        status: newFormula.status,
        missingIngredients: newFormula.status === 'incomplete' ? missingIngredients.map(ing => ({
          name: ing.name,
          required: parseFloat(ing.required),
          unit: ing.unit
        })) : [],
        id: newFormula.lot // Usar el lote como ID
      };

      console.log('🔄 Creando fórmula con datos:', formulaData);
      await createFormula(formulaData);
      
      // Si es incompleta y tiene ingredientes faltantes, agregarlos a Supabase
      if (newFormula.status === 'incomplete' && missingIngredients.length > 0) {
        console.log('📝 Agregando ingredientes faltantes a Supabase...');
        for (const ingredient of missingIngredients) {
          if (addMissingIngredient) {
            await addMissingIngredient(newFormula.lot, {
              name: ingredient.name,
              required: parseFloat(ingredient.required),
              unit: ingredient.unit
            });
          }
        }
      }
      
      // Resetear el formulario
      setNewFormula({
        lot: "",
        name: "",
        batchSize: "",
        date: "",
        status: "available",
        type: "uso_interno",
        clientName: ""
      });
      setMissingIngredients([]);
      setNewMissingIngredient({ name: "", required: "", unit: "kg" });
      
      setIsLoadModalOpen(false);
      
      // Mostrar mensaje de éxito
      const statusMessage = formulaData.status === 'incomplete' ? 'incompleta' : 'terminada';
      setShowSuccessMessage(`¡Fórmula "${formulaData.name}" creada como ${statusMessage}! 🎉`);
      setTimeout(() => setShowSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Error creating formula:', error);
    }
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

  const handleAddIngredient = (formula: any) => {
    setSelectedFormulaForIngredient(formula);
    setNewIngredient({
      name: "",
      required: "",
      unit: "kg"
    });
    setIsAddIngredientModalOpen(true);
  };

  const handleSubmitIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormulaForIngredient || !newIngredient.name.trim() || !newIngredient.required) {
      return;
    }

    try {
      setIsAddingIngredient(true);
      
      if (addMissingIngredient) {
        const success = await addMissingIngredient(
          selectedFormulaForIngredient.id,
          {
            name: newIngredient.name,
            required: parseFloat(newIngredient.required),
            unit: newIngredient.unit
          }
        );

        if (success) {
          // Cerrar modal y resetear - Realtime se encarga de actualizar la UI
          setIsAddIngredientModalOpen(false);
          setSelectedFormulaForIngredient(null);
          setNewIngredient({
            name: "",
            required: "",
            unit: "kg"
          });
        }
      } else {
        // Fallback al servicio directo si no hay función de Realtime
        const success = await FormulaService.addMissingIngredient(
          selectedFormulaForIngredient.id,
          {
            name: newIngredient.name,
            required: parseFloat(newIngredient.required),
            unit: newIngredient.unit
          }
        );

        if (success) {
          const updatedFormulas = await FormulaService.getFormulas();
          setFormulas(updatedFormulas);
          
          setIsAddIngredientModalOpen(false);
          setSelectedFormulaForIngredient(null);
          setNewIngredient({
            name: "",
            required: "",
            unit: "kg"
          });
        }
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
    } finally {
      setIsAddingIngredient(false);
    }
  };

  const handleRemoveIngredient = async (formulaId: string, ingredientName: string) => {
    try {
      console.log(`🗑️ Eliminando ingrediente: ${ingredientName} de fórmula: ${formulaId}`);
      
      // Obtener la fórmula actual para verificar el estado después de la eliminación
      const currentFormula = formulas.find(f => f.id === formulaId);
      const remainingIngredients = currentFormula?.missingIngredients?.filter(
        ing => ing.name !== ingredientName
      ) || [];
      
      // Actualizar el estado local inmediatamente para mejor UX
      setFormulas((prevFormulas: any[]) => 
        prevFormulas.map((formula: any) => {
          if (formula.id === formulaId) {
            const updatedMissingIngredients = formula.missingIngredients?.filter(
              ing => ing.name !== ingredientName
            ) || [];
            
            // Si no quedan ingredientes faltantes, cambiar el estado a "available"
            if (updatedMissingIngredients.length === 0) {
              console.log('🎉 No quedan ingredientes faltantes, cambiando estado a "available"');
              
              // Agregar animación de cambio de estado
              setStatusChangingFormulas(prev => new Set(prev).add(formulaId));
              
              // Mostrar mensaje de éxito
              setShowSuccessMessage(`¡Fórmula "${formula.name}" completada! Ahora está TERMINADA ✅`);
              
              // Quitar la animación y mensaje después de 3 segundos
              setTimeout(() => {
                setStatusChangingFormulas(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(formulaId);
                  return newSet;
                });
                setShowSuccessMessage(null);
              }, 3000);
              
              return {
                ...formula,
                missingIngredients: [],
                status: 'available'
              };
            }
            
            return {
              ...formula,
              missingIngredients: updatedMissingIngredients
            };
          }
          return formula;
        })
      );

      // Ejecutar la eliminación en la base de datos
      if (removeMissingIngredient) {
        // Usar función de Realtime
        const success = await removeMissingIngredient(formulaId, ingredientName);
        if (success) {
          console.log('✅ Ingrediente eliminado exitosamente via Realtime');
          
          // Si no quedan ingredientes faltantes, cambiar el estado a "available"
          if (remainingIngredients.length === 0 && updateFormula) {
            console.log('🎉 No quedan ingredientes faltantes, cambiando estado a "available"');
            await updateFormula(formulaId, { status: 'available' });
          }
        }
      } else {
        // Fallback al servicio directo si no hay función de Realtime
        const success = await FormulaService.removeMissingIngredient(formulaId, ingredientName);
        if (success) {
          console.log('✅ Ingrediente eliminado exitosamente via servicio directo');
          
          // Si no quedan ingredientes faltantes, actualizar en la base de datos
          if (remainingIngredients.length === 0) {
            await FormulaService.updateFormula(formulaId, { status: 'available' });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error eliminando ingrediente:', error);
      // Revertir el cambio local si hay error
      setFormulas((prevFormulas: any[]) => 
        prevFormulas.map((formula: any) => {
          if (formula.id === formulaId) {
            // Restaurar el ingrediente eliminado
            const originalFormula = formulas.find(f => f.id === formulaId);
            return originalFormula || formula;
          }
          return formula;
        })
      );
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
          onClick={() => setIsLoadModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-base font-medium px-6 py-2"
        >
          <Upload className="h-4 w-4 mr-2" />
          Cargar Fórmula
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
            <Card 
              key={formula.id} 
              className={`card-elegant ${statusChangingFormulas.has(formula.id) ? 'status-change' : ''}`}
            >
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
                  <div className="space-y-4">
                    {/* Header con contador de ingredientes faltantes */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-400" />
                        <h4 className="text-lg font-semibold text-white">
                          Materias Primas Faltantes
                        </h4>
                        {formula.missingIngredients && formula.missingIngredients.length > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {formula.missingIngredients.length} faltante{formula.missingIngredients.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddIngredient(formula)}
                        className="flex items-center gap-2 text-white border-white hover:bg-white hover:text-black transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                    
                    {/* Lista de ingredientes faltantes */}
                    {formula.missingIngredients && formula.missingIngredients.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {formula.missingIngredients.map((ingredient: any, index: number) => (
                          <div key={`${formula.id}-${ingredient.name}-${index}`} className="group flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="h-4 w-4 text-red-400 flex-shrink-0" />
                                <p className="text-base font-semibold text-white truncate" title={ingredient.name}>
                                  {ingredient.name}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-white/90">
                                <span className="font-medium">Cantidad faltante:</span>
                                <span className="bg-red-500/20 px-2 py-1 rounded text-red-200 font-mono">
                                  {ingredient.required} {ingredient.unit}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveIngredient(formula.id, ingredient.name)}
                              className="ml-3 opacity-80 hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-red-600 hover:scale-105"
                              title="Eliminar materia prima faltante"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {/* Indicador de scroll si hay muchos ingredientes */}
                        {formula.missingIngredients.length > 4 && (
                          <div className="text-center py-2">
                            <p className="text-xs text-white/60">
                              ↑ Desplázate para ver todos los ingredientes ({formula.missingIngredients.length} total)
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-white/5 rounded-lg border border-white/10">
                        <Package className="h-12 w-12 text-white/40 mx-auto mb-3" />
                        <p className="text-white/80 text-base font-medium mb-2">
                          No hay materias primas faltantes registradas
                        </p>
                        <p className="text-white/60 text-sm mb-4">
                          Esta fórmula está marcada como incompleta pero no tiene ingredientes faltantes registrados
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddIngredient(formula)}
                          className="text-white border-white hover:bg-white hover:text-black"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Primera Materia Prima
                        </Button>
                      </div>
                    )}
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

      {/* Modal para cargar fórmula */}
      <Dialog open={isLoadModalOpen} onOpenChange={setIsLoadModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">Cargar Nueva Fórmula</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLoadFormula} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label htmlFor="status">Estatus</Label>
                <Select value={newFormula.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Terminada</SelectItem>
                    <SelectItem value="incomplete">Incompleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Fórmula</Label>
                <Select value={newFormula.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uso_interno">Uso Interno (Florencio Varela)</SelectItem>
                    <SelectItem value="stock">Stock (Villa Martelli)</SelectItem>
                    <SelectItem value="cliente">Cliente (Villa Martelli)</SelectItem>
                    <SelectItem value="exportacion">Exportación (Villa Martelli)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newFormula.type === 'cliente' && (
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente</Label>
                <Input
                  id="clientName"
                  value={newFormula.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
            )}

            {/* Sección de ingredientes faltantes - Solo para fórmulas incompletas */}
            {newFormula.status === 'incomplete' && (
              <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Materias Primas Faltantes</h4>
                </div>
                
                {/* Formulario para agregar ingrediente faltante */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Nombre de la materia prima"
                      value={newMissingIngredient.name}
                      onChange={(e) => handleMissingIngredientChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      value={newMissingIngredient.required}
                      onChange={(e) => handleMissingIngredientChange("required", e.target.value)}
                    />
                  </div>
                  <div>
                    <Select 
                      value={newMissingIngredient.unit} 
                      onValueChange={(value) => handleMissingIngredientChange("unit", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="unidades">unidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMissingIngredient}
                  disabled={!newMissingIngredient.name.trim() || !newMissingIngredient.required.trim()}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Materia Prima Faltante
                </Button>

                {/* Lista de ingredientes faltantes agregados */}
                {missingIngredients.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm text-red-700">Materias primas faltantes agregadas:</h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {missingIngredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white border border-red-200 rounded">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">{ingredient.name}</span>
                            <span className="text-sm text-gray-600">
                              {ingredient.required} {ingredient.unit}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveMissingIngredient(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Destino Automático:</h4>
              <p className="text-sm text-muted-foreground">
                {newFormula.type === 'uso_interno' 
                  ? 'Uso Interno → Florencio Varela (automático)'
                  : 'Stock/Cliente/Exportación → Villa Martelli (automático)'
                }
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLoadModalOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto order-1 sm:order-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Cargar Fórmula
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar ingrediente faltante */}
      <Dialog open={isAddIngredientModalOpen} onOpenChange={setIsAddIngredientModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Agregar Materia Prima Faltante
            </DialogTitle>
          </DialogHeader>
          
          {selectedFormulaForIngredient && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Fórmula: {selectedFormulaForIngredient.name}</p>
                <p className="text-xs text-muted-foreground">Lote: {selectedFormulaForIngredient.id}</p>
              </div>
              
              <form onSubmit={handleSubmitIngredient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredient-name">Nombre de la Materia Prima</Label>
                  <Input
                    id="ingredient-name"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Aceite de Rosa Búlgara"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-required">Cantidad Faltante</Label>
                    <Input
                      id="ingredient-required"
                      type="number"
                      step="0.1"
                      value={newIngredient.required}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, required: e.target.value }))}
                      placeholder="5.2"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-unit">Unidad</Label>
                    <Select 
                      value={newIngredient.unit} 
                      onValueChange={(value) => setNewIngredient(prev => ({ ...prev, unit: value }))}
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
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddIngredientModalOpen(false)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isAddingIngredient}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isAddingIngredient ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Agregando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Materia Prima
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};