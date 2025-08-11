import { useEffect } from "react";
import AdminPanel from "@/components/AdminPanel";

export default function Admin() {
  useEffect(() => {
    document.title = "Admin Panel - La Campana Restaurant";
  }, []);

  return (
    <div className="min-h-screen bg-navy">
      <AdminPanel />
    </div>
  );
}
