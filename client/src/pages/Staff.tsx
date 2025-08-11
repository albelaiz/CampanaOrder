import { useEffect } from "react";
import StaffDashboard from "@/components/StaffDashboard";

export default function Staff() {
  useEffect(() => {
    document.title = "Staff Dashboard - La Campana Restaurant";
  }, []);

  return (
    <div className="min-h-screen bg-charcoal">
      <StaffDashboard />
    </div>
  );
}
