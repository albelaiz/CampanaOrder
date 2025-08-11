import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface TableSelectionProps {
  onTableSelected: (tableNumber: number) => void;
}

interface Table {
  id: string;
  number: number;
  qrCode: string;
  isActive: boolean;
}

export default function TableSelection({ onTableSelected }: TableSelectionProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Fetch available tables
  const { data: tables, isLoading, error } = useQuery<Table[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await fetch("/api/admin/tables");
      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }
      return response.json();
    },
  });

  const handleConfirm = () => {
    if (selectedTable) {
      // Store table number in local storage
      localStorage.setItem("tableNumber", selectedTable.toString());
      onTableSelected(selectedTable);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mb-4"></div>
          <p className="text-warm-white">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <p className="text-warm-white mb-4">Error loading tables. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-warm-white border-gold border-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
              <i className="fas fa-utensils text-2xl text-navy"></i>
            </div>
          </div>
          <CardTitle className="text-2xl font-cinzel text-navy">
            Welcome to La Campana
          </CardTitle>
          <CardDescription className="text-charcoal">
            Please select your table number to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="table-select" className="text-sm font-medium text-navy">
              Table Number
            </label>
            <Select onValueChange={(value) => setSelectedTable(parseInt(value))}>
              <SelectTrigger className="border-gold focus:ring-gold">
                <SelectValue placeholder="Select your table" />
              </SelectTrigger>
              <SelectContent>
                {tables?.map((table) => (
                  <SelectItem key={table.id} value={table.number.toString()}>
                    Table {table.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={!selectedTable}
            className="w-full bg-gold hover:bg-amber text-navy font-medium py-3"
          >
            Continue to Menu
          </Button>

          <div className="text-center text-sm text-charcoal">
            <p className="mb-2">Looking for your table number?</p>
            <p>It should be displayed on your table or ask our staff for assistance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
