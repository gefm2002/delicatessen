import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    // Si estamos en /admin (login), permitir acceso sin autenticación
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }
    
    // Para otras rutas de admin, verificar token
    if (token) {
      setIsAuthenticated(true);
      setIsChecking(false);
    } else {
      setIsAuthenticated(false);
      setIsChecking(false);
      // Solo redirigir si no estamos ya en /admin
      if (location.pathname !== '/admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  // Si estamos en la página de login, mostrar el outlet sin layout
  if (location.pathname === '/admin') {
    return <Outlet />;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-bg-alt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Verificando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-bg-alt flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <header className="bg-bg border-b border-gray-200 sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-primary">Admin Delicatessen</h1>
            <button
              onClick={handleLogout}
              className="text-text hover:text-primary transition-colors"
            >
              Salir
            </button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
