import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { InventorySection } from "@/components/InventorySection";
import { FormulasSection } from "@/components/FormulasSection";
import { ProductionSection } from "@/components/ProductionSection";
import { useRealtimeFormulas } from "@/hooks/useRealtimeFormulas";
import { Formula } from "@/services/formulaService";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { AuthProvider } from "@/components/Auth/AuthProvider";

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
    activeSection,
    formulas: formulas
  });
  
  // Log adicional para debug
  if (error) {
    console.error('🚨 Error en Index.tsx:', error);
  }
  
  if (loading) {
    console.log('⏳ Index.tsx - Cargando fórmulas...');
  }

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
      default:
        return <DashboardMetrics 
          formulas={formulas as Formula[]} 
          onNavigateToProduction={() => setActiveSection("production")}
        />;
    }
  };

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted">
          <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
          
          <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
            {/* Dashboard Header with Date/Time */}
            <div className="mb-6 sm:mb-8">
              <DashboardHeader />
            </div>
            
            <div className="px-8 sm:px-12 lg:px-16 xl:px-24">
              <div className="max-w-6xl mx-auto">
                {renderSection()}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default Index;