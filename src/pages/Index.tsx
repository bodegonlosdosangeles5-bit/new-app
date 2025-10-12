import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { InventorySection } from "@/components/InventorySection";
import { FormulasSection } from "@/components/FormulasSection";
import { ProductionSection } from "@/components/ProductionSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [formulas, setFormulas] = useState([]);

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