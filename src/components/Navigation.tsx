import { BarChart3, Package, FlaskConical, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "inventory", label: "Inventario", icon: Package },
    { id: "formulas", label: "Fórmulas", icon: FlaskConical },
    { id: "production", label: "Producción", icon: Truck },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <FlaskConical className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">EssenceControl</span>
          </div>
          
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  onClick={() => onSectionChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};