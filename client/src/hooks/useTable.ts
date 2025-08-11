import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

export function useTable() {
  const { currentTable, setCurrentTable } = useAppContext();
  const [isTableSet, setIsTableSet] = useState(false);

  // Check for table number from URL parameters or localStorage on mount
  useEffect(() => {
    const checkTableNumber = async () => {
      // First, check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table');
      
      if (tableParam) {
        const tableNumber = parseInt(tableParam);
        if (!isNaN(tableNumber) && tableNumber > 0) {
          try {
            await setTableNumber(tableNumber);
            return;
          } catch (error) {
            console.error('Invalid table from URL:', error);
          }
        }
      }

      // If no URL parameter, check localStorage
      const storedTable = localStorage.getItem('tableNumber');
      if (storedTable) {
        const tableNumber = parseInt(storedTable);
        if (!isNaN(tableNumber) && tableNumber > 0) {
          try {
            await setTableNumber(tableNumber);
            return;
          } catch (error) {
            console.error('Invalid stored table:', error);
            localStorage.removeItem('tableNumber');
          }
        }
      }

      // No table number found
      setIsTableSet(false);
    };

    checkTableNumber();
  }, []);

  const setTableNumber = async (tableNumber: number) => {
    try {
      // Validate table exists on server
      const response = await fetch(`/api/tables/${tableNumber}`);
      if (!response.ok) {
        throw new Error(`Table ${tableNumber} not found`);
      }

      // Store in localStorage
      localStorage.setItem('tableNumber', tableNumber.toString());
      
      // Update context
      setCurrentTable(tableNumber);
      setIsTableSet(true);

      // Send to backend session (if needed for server-side session management)
      try {
        await fetch('/api/session/table', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tableNumber }),
        });
      } catch (sessionError) {
        console.warn('Failed to set session table:', sessionError);
        // Don't fail the whole operation if session fails
      }

      // Update URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.set('table', tableNumber.toString());
      window.history.replaceState({}, '', url);

    } catch (error) {
      console.error('Error setting table number:', error);
      throw error;
    }
  };

  const clearTable = () => {
    localStorage.removeItem('tableNumber');
    setCurrentTable(null);
    setIsTableSet(false);
    
    // Remove table parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('table');
    window.history.replaceState({}, '', url);
  };

  return {
    currentTable,
    isTableSet,
    setTableNumber,
    clearTable,
  };
}
