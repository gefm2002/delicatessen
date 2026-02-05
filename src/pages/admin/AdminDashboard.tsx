import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    monthlyOrders: 0,
    newOrders: 0,
    confirmedOrders: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [allOrders, newOrders, confirmedOrders] = await Promise.all([
        apiGet<{ orders: any[] }>('/admin-orders-list'),
        apiGet<{ orders: any[] }>('/admin-orders-list?status=new'),
        apiGet<{ orders: any[] }>('/admin-orders-list?status=confirmed'),
      ]);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthly = allOrders.orders.filter(
        (o: any) => new Date(o.createdAt) >= startOfMonth
      );

      setStats({
        totalOrders: allOrders.orders.length,
        monthlyOrders: monthly.length,
        newOrders: newOrders.orders.length,
        confirmedOrders: confirmedOrders.orders.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-bg rounded-lg shadow p-6">
          <h3 className="text-sm text-text-muted mb-2">Total de órdenes</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
        </div>
        <div className="bg-bg rounded-lg shadow p-6">
          <h3 className="text-sm text-text-muted mb-2">Órdenes del mes</h3>
          <p className="text-3xl font-bold text-primary">{stats.monthlyOrders}</p>
        </div>
        <div className="bg-bg rounded-lg shadow p-6">
          <h3 className="text-sm text-text-muted mb-2">Nuevas</h3>
          <p className="text-3xl font-bold text-primary">{stats.newOrders}</p>
        </div>
        <div className="bg-bg rounded-lg shadow p-6">
          <h3 className="text-sm text-text-muted mb-2">Confirmadas</h3>
          <p className="text-3xl font-bold text-primary">{stats.confirmedOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/productos"
          className="bg-bg rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-display font-bold mb-2">Productos</h2>
          <p className="text-text-muted">Gestionar catálogo</p>
        </Link>
        <Link
          to="/admin/ordenes"
          className="bg-bg rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-display font-bold mb-2">Órdenes</h2>
          <p className="text-text-muted">Ver y gestionar pedidos</p>
        </Link>
        <Link
          to="/admin/categorias"
          className="bg-bg rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-display font-bold mb-2">Categorías</h2>
          <p className="text-text-muted">Gestionar categorías</p>
        </Link>
        <Link
          to="/admin/promos"
          className="bg-bg rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-display font-bold mb-2">Promos</h2>
          <p className="text-text-muted">Gestionar promociones</p>
        </Link>
        <Link
          to="/admin/sucursales"
          className="bg-bg rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-display font-bold mb-2">Sucursales</h2>
          <p className="text-text-muted">Gestionar sucursales</p>
        </Link>
        <Link
          to="/admin/config"
          className="bg-bg rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-display font-bold mb-2">Configuración</h2>
          <p className="text-text-muted">Configuración del sitio</p>
        </Link>
      </div>
    </div>
  );
}
