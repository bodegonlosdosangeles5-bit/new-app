import { useState } from "react";
import { Search, Package, MapPin, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const InventorySection = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const inventoryItems = [
    {
      id: "MP001",
      name: "Aceite Esencial de Lavanda",
      category: "Aceites Esenciales",
      currentStock: 25.5,
      minStock: 10,
      maxStock: 50,
      unit: "kg",
      location: "A-12-3",
      supplier: "Aromática Premium",
      lastUpdate: "2024-01-15",
      status: "normal",
    },
    {
      id: "MP002",
      name: "Alcohol Etílico 96°",
      category: "Solventes",
      currentStock: 180,
      minStock: 100,
      maxStock: 300,
      unit: "L",
      location: "B-05-1",
      supplier: "QuimCorp",
      lastUpdate: "2024-01-14",
      status: "normal",
    },
    {
      id: "MP003",
      name: "Aceite de Rosa Búlgara",
      category: "Aceites Esenciales",
      currentStock: 5.2,
      minStock: 8,
      maxStock: 20,
      unit: "kg",
      location: "A-15-2",
      supplier: "Bulgarian Rose Co.",
      lastUpdate: "2024-01-13",
      status: "low",
    },
    {
      id: "MP004",
      name: "Benzilacetato",
      category: "Químicos Aromáticos",
      currentStock: 12.8,
      minStock: 5,
      maxStock: 25,
      unit: "kg",
      location: "C-08-4",
      supplier: "AromaChems Ltd",
      lastUpdate: "2024-01-12",
      status: "normal",
    },
    {
      id: "MP005",
      name: "Linalool Sintético",
      category: "Químicos Aromáticos",
      currentStock: 2.1,
      minStock: 5,
      maxStock: 15,
      unit: "kg",
      location: "C-12-1",
      supplier: "SyntheticAromas",
      lastUpdate: "2024-01-11",
      status: "critical",
    },
  ];

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "destructive";
      case "low": return "warning";
      default: return "success";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical": return "Crítico";
      case "low": return "Bajo";
      default: return "Normal";
    }
  };

  const getStockPercentage = (current: number, min: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Inventario de Materias Primas</h2>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, ID o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="card-elegant">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {item.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    ID: {item.id}
                  </p>
                </div>
                <Badge variant={getStatusColor(item.status) === "destructive" ? "destructive" : 
                              getStatusColor(item.status) === "warning" ? "secondary" : "default"}>
                  {getStatusText(item.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Stock Actual</span>
                </div>
                <span className="text-lg font-bold text-foreground">
                  {item.currentStock} {item.unit}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: {item.minStock} {item.unit}</span>
                  <span>Max: {item.maxStock} {item.unit}</span>
                </div>
                <Progress 
                  value={getStockPercentage(item.currentStock, item.minStock, item.maxStock)} 
                  className="h-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Ubicación:</span> {item.location}
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                <p><span className="font-medium">Proveedor:</span> {item.supplier}</p>
                <p><span className="font-medium">Última actualización:</span> {item.lastUpdate}</p>
              </div>

              {item.status !== "normal" && (
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-xs text-warning-foreground">
                    {item.status === "critical" ? "Stock crítico - Ordenar urgente" : "Stock bajo - Considerar pedido"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};