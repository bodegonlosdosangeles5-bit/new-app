import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { InventorySection } from "@/components/InventorySection";
import { FormulasSection } from "@/components/FormulasSection";
import { ProductionSection } from "@/components/ProductionSection";
import { TestTable } from "@/components/TestTable";
import { FormulaTest } from "@/components/FormulaTest";
import { useRealtimeFormulas } from "@/hooks/useRealtimeFormulas";
import { Formula } from "@/services/formulaService";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Usar el hook de fórmulas con Supabase Realtime
  const { 
    formulas, 
    loading, 
    error, 
    createFormula, 
    updateFormula, 
    deleteFormula,
    addMissingIngredient,
    removeMissingIngredient,
    updateIncompleteFormulasStatus
  } = useRealtimeFormulas();
  
  // Logging para debug
  console.log('🏠 Index.tsx - Estado actual:', { 
    formulasCount: formulas.length, 
    loading, 
    error, 
    activeSection 
  });

  const renderSection = () => {
    switch (activeSection) {
      case "inventory":
        return <InventorySection />;
      case "formulas":
        return <FormulasSection 
          formulas={formulas} 
          setFormulas={() => {}} // Función vacía ya que usamos Supabase Realtime
          createFormula={createFormula}
          updateFormula={updateFormula}
          deleteFormula={deleteFormula}
          addMissingIngredient={addMissingIngredient}
          removeMissingIngredient={removeMissingIngredient}
          updateIncompleteFormulasStatus={updateIncompleteFormulasStatus}
          loading={loading}
          error={error}
        />;
      case "production":
        return <ProductionSection formulas={formulas as Formula[]} />;
      case "test":
        return <TestTable />;
      case "formula-test":
        return <FormulaTest 
          formulas={formulas}
          loading={loading}
          error={error}
          createFormula={createFormula}
          updateFormula={updateFormula}
          deleteFormula={deleteFormula}
        />;
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