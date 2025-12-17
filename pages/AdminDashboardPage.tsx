import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../services/authStore';
import { mockAdminService } from '../services/mockBackend';
import { User, Activity, DashboardStats } from '../types';
import { LogOut, Users, Heart, Crown, Shield, Activity as ActivityIcon } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const { logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'activities'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const s = await mockAdminService.getStats();
    const u = await mockAdminService.getAllUsers();
    const a = await mockAdminService.getActivities();
    setStats(s);
    setUsers(u);
    setActivities(a);
    setLoading(false);
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    await mockAdminService.togglePremium(userId, !currentStatus);
    fetchData(); // Refresh list
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar / Nav */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="text-primary w-8 h-8" />
          <h1 className="text-xl font-bold">Admin Console</h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-slate-200 text-sm">juanchacon@rv2ven.com</span>
            <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition text-sm text-white"
            >
            <LogOut size={16} /> Logout
            </button>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 font-medium">Total Users</h3>
                    <Users className="text-blue-500" />
                </div>
                <p className="text-4xl font-bold text-white">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 font-medium">Active Couples</h3>
                    <Heart className="text-primary" />
                </div>
                <p className="text-4xl font-bold text-white">{stats?.totalCouples || 0}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 font-medium">Premium Members</h3>
                    <Crown className="text-yellow-500" />
                </div>
                <p className="text-4xl font-bold text-white">{stats?.premiumUsers || 0}</p>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
            <button 
                onClick={() => setActiveTab('users')}
                className={`pb-3 px-1 font-medium ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
            >
                User Management
            </button>
            <button 
                onClick={() => setActiveTab('activities')}
                className={`pb-3 px-1 font-medium ${activeTab === 'activities' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
            >
                Activities Content
            </button>
        </div>

        {/* Content Area */}
        {loading ? (
            <div className="text-center py-20 text-slate-500">Loading data...</div>
        ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase">
                                    <th className="p-4">Email</th>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Couple Status</th>
                                    <th className="p-4">Plan</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 text-sm">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-700/50 transition">
                                        <td className="p-4 font-medium text-white">{u.email}</td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{u.id}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-slate-700 text-slate-300'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {u.couple_id ? (
                                                <span className="text-green-400 flex items-center gap-1"><Heart size={12}/> Paired</span>
                                            ) : (
                                                <span className="text-slate-500">Single</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {u.is_premium ? (
                                                <span className="text-yellow-400 flex items-center gap-1"><Crown size={12}/> Premium</span>
                                            ) : (
                                                <span className="text-slate-500">Free</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {u.role !== 'admin' && (
                                                <button 
                                                    onClick={() => togglePremium(u.id, u.is_premium)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${u.is_premium ? 'bg-red-900/50 text-red-300 hover:bg-red-900' : 'bg-green-900/50 text-green-300 hover:bg-green-900'}`}
                                                >
                                                    {u.is_premium ? 'Remove Premium' : 'Grant Premium'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'activities' && (
                    <div className="overflow-x-auto">
                         <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Difficulty</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 text-sm">
                                {activities.map(a => (
                                    <tr key={a.id} className="hover:bg-slate-700/50 transition">
                                        <td className="p-4 font-bold text-white">{a.title}</td>
                                        <td className="p-4 capitalize">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${a.category === 'hot' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'}`}>
                                                {a.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400">{a.difficulty}</td>
                                        <td className="p-4 text-slate-400 max-w-xs truncate">{a.description}</td>
                                        <td className="p-4">
                                            <span className="text-green-400 text-xs border border-green-900 bg-green-900/20 px-2 py-1 rounded">Active</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;