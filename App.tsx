import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './services/authStore';
import AuthPage from './pages/AuthPage';
import CoupleSetupPage from './pages/CoupleSetupPage';
import CategoriesPage from './pages/CategoriesPage';
import FeedPage from './pages/FeedPage';
import LandingPage from './pages/LandingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Simple Route Guard
const PrivateRoute = ({ children }: React.PropsWithChildren) => {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Admin Route Guard
const AdminRoute = ({ children }: React.PropsWithChildren) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/categories" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, couple } = useAuthStore();

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        <Route 
          path="/login" 
          element={!user ? <AuthPage /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/couple" />)} 
        />
        
        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/couple" 
          element={
            <PrivateRoute>
              {couple ? <Navigate to="/categories" /> : <CoupleSetupPage />}
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/categories" 
          element={
            <PrivateRoute>
              <CategoriesPage />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/feed/:category" 
          element={
            <PrivateRoute>
              <FeedPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </HashRouter>
  );
};

export default App;