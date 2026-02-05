import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import FAQs from './pages/FAQs';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPromos from './pages/admin/AdminPromos';
import AdminBranches from './pages/admin/AdminBranches';
import AdminSiteConfig from './pages/admin/AdminSiteConfig';
import AdminOrders from './pages/admin/AdminOrders';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="producto/:slug" element={<ProductDetail />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="faqs" element={<FAQs />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminLogin />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route path="promos" element={<AdminPromos />} />
        <Route path="sucursales" element={<AdminBranches />} />
        <Route path="config" element={<AdminSiteConfig />} />
        <Route path="ordenes" element={<AdminOrders />} />
      </Route>
    </Routes>
  );
}

export default App;
