import { useState } from "react";
import { Truck, Calendar, Weight, MapPin, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ProductionSection = () => {
  const [activeTab, setActiveTab] = useState("current");

  const currentProduction = [
    {
      id: "P001",
      formula: "Lavanda Premium",
      batchId: "L-2024-089",
      quantity: 50,
      unit: "kg",
      startDate: "2024-01-15",
      estimatedCompletion: "2024-01-15",
      progress: 75,
      status: "in-progress",
      operator: "María González",
      location: "Reactor A-1",
    },
    {
      id: "P002",
      formula: "Citrus Fresh",
      batchId: "C-2024-012",
      quantity: 75,
      unit: "kg",
      startDate: "2024-01-14",
      estimatedCompletion: "2024-01-16",
      progress: 45,
      status: "in-progress",
      operator: "Carlos Ruiz",
      location: "Reactor B-2",
    },
  ];

  const completedBatches = [
    {
      id: "P003",
      formula: "Rosa Elegante",
      batchId: "R-2024-085",
      quantity: 25,
      unit: "kg",
      completedDate: "2024-01-13",
      actualYield: 24.8,
      efficiency: 99.2,
      shipment: "SHIP-001",
      destination: "Cliente Premium SA",
      operator: "Ana López",
    },
    {
      id: "P004",
      formula: "Lavanda Premium",
      batchId: "L-2024-084",
      quantity: 50,
      unit: "kg",
      completedDate: "2024-01-12",
      actualYield: 49.5,
      efficiency: 99.0,
      shipment: "SHIP-002",
      destination: "Distribuidora Norte",
      operator: "María González",
    },
    {
      id: "P005",
      formula: "Maderas Nobles",
      batchId: "M-2024-021",
      quantity: 40,
      unit: "kg",
      completedDate: "2024-01-10",
      actualYield: 38.9,
      efficiency: 97.3,
      shipment: "SHIP-003",
      destination: "Exportadora Global",
      operator: "Jorge Mendez",
    },
  ];

  const shipments = [
    {
      id: "SHIP-001",
      date: "2024-01-14",
      batches: ["R-2024-085"],
      totalWeight: 24.8,
      destination: "Cliente Premium SA",
      driver: "Roberto Silva",
      truck: "ABC-123",
      status: "delivered",
    },
    {
      id: "SHIP-002",
      date: "2024-01-13",
      batches: ["L-2024-084", "L-2024-083"],
      totalWeight: 98.2,
      destination: "Distribuidora Norte",
      driver: "Carmen Torres",
      truck: "XYZ-789",
      status: "in-transit",
    },
    {
      id: "SHIP-003",
      date: "2024-01-12",
      batches: ["M-2024-021"],
      totalWeight: 38.9,
      destination: "Exportadora Global",
      driver: "Luis Morales",
      truck: "DEF-456",
      status: "delivered",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "success";
      case "in-progress":
      case "in-transit":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "delivered":
        return "Entregado";
      case "in-progress":
        return "En Proceso";
      case "in-transit":
        return "En Tránsito";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Control de Producción</h2>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Producción del mes</p>
            <p className="text-2xl font-bold text-foreground">1,250 kg</p>
          </div>
          <TrendingUp className="h-8 w-8 text-success" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Producción Actual</TabsTrigger>
          <TabsTrigger value="completed">Lotes Completados</TabsTrigger>
          <TabsTrigger value="shipments">Envíos</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentProduction.map((batch) => (
              <Card key={batch.id} className="card-elegant">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {batch.formula}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Lote: {batch.batchId}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(batch.status) === "warning" ? "secondary" : "default"}>
                      {getStatusText(batch.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cantidad</p>
                        <p className="font-medium">{batch.quantity} {batch.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ubicación</p>
                        <p className="font-medium">{batch.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{batch.progress}%</span>
                    </div>
                    <Progress value={batch.progress} className="h-2" />
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium">Operador:</span> {batch.operator}</p>
                    <p><span className="font-medium">Inicio:</span> {batch.startDate}</p>
                    <p><span className="font-medium">Estimado:</span> {batch.estimatedCompletion}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedBatches.map((batch) => (
              <Card key={batch.id} className="card-elegant">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {batch.formula}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Lote: {batch.batchId}
                      </p>
                    </div>
                    <Badge variant="default">
                      Completado
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Objetivo</p>
                      <p className="font-medium">{batch.quantity} {batch.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Producido</p>
                      <p className="font-medium text-success">{batch.actualYield} {batch.unit}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Eficiencia</span>
                      <span className="font-medium">{batch.efficiency}%</span>
                    </div>
                    <Progress value={batch.efficiency} className="h-1" />
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><span className="font-medium">Completado:</span> {batch.completedDate}</p>
                    <p><span className="font-medium">Operador:</span> {batch.operator}</p>
                    <p><span className="font-medium">Envío:</span> {batch.shipment}</p>
                    <p><span className="font-medium">Destino:</span> {batch.destination}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {shipments.map((shipment) => (
              <Card key={shipment.id} className="card-elegant">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <span>{shipment.id}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {shipment.destination}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(shipment.status) === "success" ? "default" : "secondary"}>
                      {getStatusText(shipment.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha</p>
                        <p className="font-medium">{shipment.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Peso Total</p>
                        <p className="font-medium">{shipment.totalWeight} kg</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Lotes incluidos:</p>
                    <div className="flex flex-wrap gap-1">
                      {shipment.batches.map((batch, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {batch}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium">Conductor:</span> {shipment.driver}</p>
                    <p><span className="font-medium">Vehículo:</span> {shipment.truck}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};