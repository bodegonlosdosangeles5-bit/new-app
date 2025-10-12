import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { InventorySection } from "@/components/InventorySection";
import { FormulasSection } from "@/components/FormulasSection";
import { ProductionSection } from "@/components/ProductionSection";
import { TestTable } from "@/components/TestTable";
import { FormulaTest } from "@/components/FormulaTest";
import { useFormulas } from "@/hooks/useFormulas";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Usar el hook de fórmulas con Supabase
  const { formulas, loading, error, createFormula, updateFormula, deleteFormula } = useFormulas();

  const renderSection = () => {
    switch (activeSection) {
      case "inventory":
        return <InventorySection />;
      case "formulas":
        return <FormulasSection 
          formulas={formulas} 
          setFormulas={() => {}} // Función vacía ya que usamos Supabase
          createFormula={createFormula}
          updateFormula={updateFormula}
          deleteFormula={deleteFormula}
          loading={loading}
          error={error}
        />;
      case "production":
        return <ProductionSection formulas={formulas} />;
      case "test":
        return <TestTable />;
      case "formula-test":
        return <FormulaTest />;
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