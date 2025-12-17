import React, { useState } from 'react';
import { useAuthStore } from '../services/authStore';
import { mockCoupleService } from '../services/mockBackend';
import { Copy, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CoupleSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, couple, refreshCouple } = useAuthStore();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    try {
      await mockCoupleService.createCouple(user.id);
      await refreshCouple();
    } catch (e) {
      setError("Failed to create couple");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !joinCode) return;
    setCreating(true);
    setError('');
    try {
      await mockCoupleService.joinCouple(user.id, joinCode.toUpperCase());
      await refreshCouple();
    } catch (e: any) {
      setError(e.message || "Failed to join");
    } finally {
      setCreating(false);
    }
  };

  if (couple) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-gray-900">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            💑
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You're paired!</h2>
          <p className="text-gray-500 mb-6">Connected via code <span className="font-mono font-bold text-gray-800">{couple.code}</span></p>
          
          <button 
             onClick={() => window.location.hash = '#/categories'}
             className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition"
          >
            Start Swiping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-gray-900">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Partner Up</h1>
        <p className="text-gray-500 mb-8">Link with your partner to start matching.</p>

        {/* Join Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Have a code?</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="ENTER CODE"
              className="flex-1 bg-gray-100 border-none rounded-lg px-4 py-3 font-mono uppercase tracking-widest focus:ring-2 focus:ring-primary outline-none text-gray-900 placeholder-gray-400"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={6}
            />
            <button 
              onClick={handleJoin}
              disabled={creating || joinCode.length < 3}
              className="bg-secondary text-white px-6 rounded-lg font-bold disabled:opacity-50"
            >
              Join
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        {/* Create Section */}
        <button 
          onClick={handleCreate}
          disabled={creating}
          className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-2xl font-semibold hover:border-primary hover:text-primary transition flex flex-col items-center gap-1 mb-6"
        >
          <span>Create New Invite Code</span>
          <span className="text-xs font-normal text-gray-400">You'll share this with your partner</span>
        </button>

        {/* Preview Button */}
        <button 
          onClick={() => navigate('/categories')}
          className="w-full text-gray-500 py-3 rounded-xl font-medium hover:bg-gray-200 transition text-sm flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          Skip & Preview App
        </button>
      </div>
    </div>
  );
};

export default CoupleSetupPage;