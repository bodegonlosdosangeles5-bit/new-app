import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { InventorySection } from "@/components/InventorySection";
import { FormulasSection } from "@/components/FormulasSection";
import { ProductionSection } from "@/components/ProductionSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "inventory":
        return <InventorySection />;
      case "formulas":
        return <FormulasSection />;
      case "production":
        return <ProductionSection />;
      default:
        return <DashboardMetrics />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">
            Control de Producción
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestión integral de inventario y formulación de esencias aromáticas
          </p>
        </div>
        
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;