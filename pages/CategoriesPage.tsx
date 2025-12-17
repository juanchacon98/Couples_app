import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';
import { CATEGORIES } from '../constants';
import { LogOut, Settings, AlertTriangle } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { couple, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-bg p-6">
        {/* Preview Mode Banner */}
        {!couple && (
            <div className="mb-6 bg-orange-100 border border-orange-200 text-orange-800 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-bold">Preview Mode</p>
                    <p>You are not linked to a partner. Swipes will not be saved or matched.</p>
                    <button 
                        onClick={() => navigate('/couple')} 
                        className="mt-2 text-orange-900 font-bold underline hover:no-underline"
                    >
                        Link Partner Now
                    </button>
                </div>
            </div>
        )}

      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Explore</h1>
          {couple ? (
             <p className="text-sm text-gray-500">Couple Code: <span className="font-mono">{couple.code}</span></p>
          ) : (
            <p className="text-sm text-gray-500">Solo Preview</p>
          )}
        </div>
        <button onClick={logout} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500">
            <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => navigate(`/feed/${cat.id}`)}
            className={`
              relative p-6 rounded-2xl shadow-sm text-left transition hover:scale-[1.02] active:scale-95
              ${cat.restricted ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
            `}
          >
            <div className="text-4xl mb-3">{cat.icon}</div>
            <h3 className="font-bold text-lg">{cat.label}</h3>
            {cat.restricted && (
                <div className="absolute top-4 right-4 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">
                    18+
                </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-12 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-800 text-sm">
        <h4 className="font-bold mb-1">How it works</h4>
        <p>Swipes are synchronized. You must swipe the current card before seeing the next one. Your partner sees the exact same card.</p>
      </div>
    </div>
  );
};

export default CategoriesPage;