import { useState } from "react";
import { FlaskConical, CheckCircle, XCircle, Clock, Beaker } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const FormulasSection = () => {
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);

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

  const getFormulaStatus = (formula: any) => {
    const missingIngredients = formula.ingredients.filter(
      (ing: any) => ing.available < ing.required
    );
    return missingIngredients.length === 0 ? "available" : "incomplete";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "incomplete":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
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

  const getCompletionPercentage = (formula: any) => {
    const availableCount = formula.ingredients.filter(
      (ing: any) => ing.available >= ing.required
    ).length;
    return Math.round((availableCount / formula.ingredients.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Fórmulas</h2>
        <Button className="gradient-primary text-primary-foreground">
          <FlaskConical className="h-4 w-4 mr-2" />
          Nueva Fórmula
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {formulas.map((formula) => {
          const actualStatus = getFormulaStatus(formula);
          const completion = getCompletionPercentage(formula);
          
          return (
            <Card key={formula.id} className="card-elegant">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                      <Beaker className="h-5 w-5 text-primary" />
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
    </div>
  );
};