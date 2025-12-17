import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';
import { supabase } from '../services/supabaseClient';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para diagnóstico de conexión
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connError, setConnError] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      // Intentamos contactar con Supabase (Auth o DB)
      // Usamos .from('profiles') solo para ver si responde la API, no importa si falla por permisos
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      // Si el error es de red (fetch failed) lanzará excepción. 
      // Si responde 400/401/403/200, significa que la conexión existe.
      setConnectionStatus('connected');
    } catch (e: any) {
      console.error("Connection Check Failed:", e);
      setConnectionStatus('error');
      setConnError(e.message || "No se pudo conectar al VPS");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // The mock backend handles both login and auto-registration logic identically
      try {
        const user = await login(email, password);
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
            // Force redirect user if login successful
            navigate('/couple');
        }
      } catch (err: any) {
        alert(err.message || "Error al ingresar");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-gray-900">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-primary mb-2">CoupleSync</h1>
            <p className="text-gray-500">Agree on what to do, stress-free.</p>
        </div>

        <div className="bg-white p-1 rounded-xl mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-400">
                {isSignUp ? 'Enter your details to get started' : 'Enter your details to sign in'}
            </p>
        </div>

        {/* Indicador de Estado de Conexión (Diagnóstico) */}
        <div className={`mb-6 p-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors duration-300
            ${connectionStatus === 'checking' ? 'bg-gray-100 text-gray-500' : ''}
            ${connectionStatus === 'connected' ? 'bg-green-100 text-green-700 border border-green-200' : ''}
            ${connectionStatus === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : ''}
        `}>
            {connectionStatus === 'checking' && (
                <>
                    <Loader2 size={14} className="animate-spin" />
                    Probando conexión con VPS...
                </>
            )}
            {connectionStatus === 'connected' && (
                <>
                    <Wifi size={14} />
                    Conectado a Supabase API
                </>
            )}
            {connectionStatus === 'error' && (
                <>
                    <WifiOff size={14} />
                    Sin conexión: {connError}
                </>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder={isSignUp ? "Create a password (Optional)" : "Password"} 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading || connectionStatus === 'error'}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 transition disabled:opacity-70 disabled:grayscale"
          >
            {isLoading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Sign Up' : 'Log In')
            }
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
            <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-gray-500 hover:text-primary font-medium text-sm transition"
            >
                {isSignUp 
                    ? "Already have an account? Log In" 
                    : "New to CoupleSync? Create Account"
                }
            </button>
        </div>

        {!isSignUp && (
            <p className="mt-4 text-xs text-gray-300">
            Admins must enter credentials to access dashboard.
            </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;