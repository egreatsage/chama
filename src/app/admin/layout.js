// src/app/admin/layout.js

import AdminHeader from "@/components/navigation/AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <div>
      <AdminHeader>
        {children}
      </AdminHeader>
    </div>
  );
}