import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <AdminTopbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
