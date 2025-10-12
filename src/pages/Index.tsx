import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { InventorySection } from "@/components/InventorySection";
import { FormulasSection } from "@/components/FormulasSection";
import { ProductionSection } from "@/components/ProductionSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Inicializar con datos de ejemplo
  const [formulas, setFormulas] = useState([
    {
      id: "F001",
      name: "Lavanda Premium",
      description: "Fragancia clásica de lavanda con notas florales",
      category: "Floral",
      batchSize: 50,
      status: "available",
      estimatedTime: "4 horas",
      destination: "Florencio Varela",
      date: "2024-01-15",
      type: "stock",
      clientName: "",
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
      date: "2024-01-14",
      type: "client",
      clientName: "Cliente Premium SA",
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
      date: "2024-01-13",
      type: "stock",
      clientName: "",
      ingredients: [
        { name: "Aceite Esencial de Lavanda", required: 8, available: 25.5, unit: "kg" },
        { name: "Alcohol Etílico 96°", required: 45, available: 180, unit: "L" },
        { name: "Linalool Sintético", required: 3.2, available: 2.1, unit: "kg" },
      ],
    },
  ]);

  const renderSection = () => {
    switch (activeSection) {
      case "inventory":
        return <InventorySection />;
      case "formulas":
        return <FormulasSection formulas={formulas} setFormulas={setFormulas} />;
      case "production":
        return <ProductionSection formulas={formulas} />;
      default:
        return <DashboardMetrics />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-primary mb-2">
            Control de Producción
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Gestión integral de inventario y formulación de esencias aromáticas
          </p>
        </div>
        
        <div className="w-full">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;