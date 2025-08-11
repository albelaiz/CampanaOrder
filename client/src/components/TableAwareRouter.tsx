import { useEffect, useState } from "react";
import { useTable } from "@/hooks/useTable";
import TableSelection from "@/components/TableSelection";
import Home from "@/pages/Home";

export default function TableAwareRouter() {
  const { isTableSet, setTableNumber } = useTable();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Give the useTable hook time to check URL params and localStorage
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Increased timeout to allow for async table validation

    return () => clearTimeout(timer);
  }, []);

  const handleTableSelected = async (tableNumber: number) => {
    try {
      await setTableNumber(tableNumber);
      // No need to do anything else - useTable will update isTableSet
    } catch (error) {
      console.error('Failed to set table:', error);
      // Could show an error toast here if needed
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mb-4"></div>
          <p className="text-warm-white">Loading La Campana...</p>
        </div>
      </div>
    );
  }

  // If table is not set, show table selection
  if (!isTableSet) {
    return <TableSelection onTableSelected={handleTableSelected} />;
  }

  // Table is set, show the main home page
  return <Home />;
}
