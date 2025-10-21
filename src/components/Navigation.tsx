import { BarChart3, Package, FlaskConical, Truck, Menu, X, LogOut, User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { MobileUserIndicator } from "@/components/MobileUserIndicator";
import { DateTimeDisplay } from "@/components/DateTimeDisplay";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { usePWA } from "@/hooks/usePWA";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user, signOut } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();

  // Efecto para manejar la animación de cierre
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isMobileMenuOpen]);
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "inventory", label: "Inventario", icon: Package },
    { id: "formulas", label: "Fórmulas", icon: FlaskConical },
  { id: "production", label: "Producción", icon: Truck },
];

  const handleNavClick = (section: string) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleInstallApp = async () => {
    const success = await installApp();
    if (success) {
      console.log('App instalada exitosamente');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top row with logo and navigation */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="lg" />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
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
                  <span>{item.label}</span>
                </Button>
              );
            })}
                <ThemeToggle />
                {/* Install App Button */}
                {isInstallable && !isInstalled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleInstallApp}
                    className="flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Instalar App</span>
                  </Button>
                )}
                {/* User info and logout */}
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </div>
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            {/* Compact date/time for mobile */}
            <div className="hidden sm:flex">
              <DateTimeDisplay format="minimal" />
            </div>
            <MobileUserIndicator />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative transition-all duration-300 ease-in-out hover:scale-105"
            >
              <div className="relative w-5 h-5">
                <Menu 
                  className={`h-5 w-5 absolute transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen 
                      ? 'opacity-0 rotate-180 scale-0' 
                      : 'opacity-100 rotate-0 scale-100'
                  }`} 
                />
                <X 
                  className={`h-5 w-5 absolute transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen 
                      ? 'opacity-100 rotate-0 scale-100' 
                      : 'opacity-0 -rotate-180 scale-0'
                  }`} 
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {(isMobileMenuOpen || isAnimating) && (
          <div className={`md:hidden border-t border-border bg-card/95 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen 
              ? 'max-h-screen opacity-100 translate-y-0' 
              : 'max-h-0 opacity-0 -translate-y-4'
          }`}>
            <div className="py-4 space-y-1">
              {/* Date/Time for Mobile */}
              <div className={`px-2 pb-3 border-b border-border/50 transition-all duration-500 ease-out ${
                isMobileMenuOpen 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-4'
              }`} style={{ transitionDelay: isMobileMenuOpen ? '100ms' : '0ms' }}>
                <DateTimeDisplay format="full" />
              </div>
              
              {/* Navigation Items */}
              <div className="px-2 space-y-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full justify-start space-x-3 h-12 transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-md ${
                        isMobileMenuOpen 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 -translate-x-4'
                      }`}
                      style={{ 
                        transitionDelay: isMobileMenuOpen ? `${150 + (index * 100)}ms` : '0ms' 
                      }}
                    >
                      <Icon className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
                      <span className="text-base">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
              
              {/* Separator */}
              <div className={`border-t border-border my-3 transition-all duration-500 ease-out ${
                isMobileMenuOpen 
                  ? 'opacity-100 scale-x-100' 
                  : 'opacity-0 scale-x-0'
              }`} style={{ transitionDelay: isMobileMenuOpen ? '600ms' : '0ms' }}></div>
              
              {/* Install App Button for Mobile */}
              {isInstallable && !isInstalled && (
                <div className={`px-2 transition-all duration-500 ease-out ${
                  isMobileMenuOpen 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`} style={{ transitionDelay: isMobileMenuOpen ? '700ms' : '0ms' }}>
                  <Button
                    variant="outline"
                    onClick={handleInstallApp}
                    className="w-full justify-start space-x-3 h-12 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
                  >
                    <Download className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
                    <span className="text-base">Instalar App</span>
                  </Button>
                </div>
              )}
              
              {/* User Info and Logout for Mobile */}
              <div className={`px-2 space-y-2 transition-all duration-500 ease-out ${
                isMobileMenuOpen 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-4'
              }`} style={{ transitionDelay: isMobileMenuOpen ? '800ms' : '0ms' }}>
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg transition-all duration-300 ease-in-out hover:bg-muted/70 hover:scale-[1.01]">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-primary/20 hover:scale-110">
                      <User className="h-4 w-4 text-primary transition-transform duration-200 ease-in-out" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full justify-start space-x-3 h-12 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-destructive/25"
                >
                  <LogOut className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
                  <span className="text-base">Cerrar Sesión</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};