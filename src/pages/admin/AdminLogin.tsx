import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../lib/api';
import { adminLoginDev } from '../../lib/adminAuthDev';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (import.meta.env.DEV) {
        // En desarrollo, usar autenticación directa con Supabase
        result = await adminLoginDev(email, password);
      } else {
        result = await apiPost<{ token: string }>('/admin-login', { email, password });
      }
      localStorage.setItem('admin_token', result.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-bg rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-display font-bold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
