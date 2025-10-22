import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { InventorySection } from "@/components/InventorySection";
import { FormulasSection } from "@/components/FormulasSection";
import { ProductionSection } from "@/components/ProductionSection";
import { UserAdminPanel } from "@/components/UserAdminPanel";
import { useRealtimeProductos } from "@/hooks/useRealtimeProductos";
import { Producto } from "@/services/productoService";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { AuthProvider } from "@/components/Auth/AuthProvider";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Usar el hook de productos con Supabase Realtime
  const { 
    productos, 
    loading, 
    error, 
    createProducto, 
    updateProducto, 
    deleteProducto,
    addMissingIngredient,
    removeMissingIngredient,
    updateIncompleteProductosStatus
  } = useRealtimeProductos();
  
  // Logging para debug
  console.log('🏠 Index.tsx - Estado actual:', { 
    productosCount: productos.length, 
    loading, 
    error, 
    activeSection,
    productos: productos
  });
  
  // Log adicional para debug
  if (error) {
    console.error('🚨 Error en Index.tsx:', error);
  }
  
  if (loading) {
    console.log('⏳ Index.tsx - Cargando productos...');
  }

  const renderSection = () => {
    switch (activeSection) {
      case "inventory":
        return <InventorySection />;
      case "formulas":
        return <FormulasSection 
          formulas={productos} 
          setFormulas={() => {}} // Función vacía ya que usamos Supabase Realtime
          createFormula={createProducto}
          updateFormula={updateProducto}
          deleteFormula={deleteProducto}
          addMissingIngredient={addMissingIngredient}
          removeMissingIngredient={removeMissingIngredient}
          updateIncompleteFormulasStatus={updateIncompleteProductosStatus}
          loading={loading}
          error={error}
        />;
      case "production":
        return <ProductionSection formulas={productos as Producto[]} />;
      case "users":
        return <UserAdminPanel />;
      default:
        return <DashboardMetrics 
          formulas={productos as Producto[]} 
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