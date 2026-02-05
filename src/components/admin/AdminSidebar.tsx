import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/productos', label: 'Productos', icon: '📦' },
    { path: '/admin/categorias', label: 'Categorías', icon: '🏷️' },
    { path: '/admin/promos', label: 'Promos', icon: '🎁' },
    { path: '/admin/sucursales', label: 'Sucursales', icon: '📍' },
    { path: '/admin/ordenes', label: 'Órdenes', icon: '📋' },
    { path: '/admin/config', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-bg border-r border-gray-200 min-h-screen fixed left-0 top-0 pt-16">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
