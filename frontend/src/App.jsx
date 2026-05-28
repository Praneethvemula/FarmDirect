import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import FarmerDashboard from './pages/FarmerDashboard';
import ConsumerDashboard from './pages/ConsumerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import './index.css';

function AppInner() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab ] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(34,197,94,0.4)',
            animation: 'pulse-glow 2s ease infinite',
          }}>
            <span style={{ fontSize: '28px' }}>🌱</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading FarmDirect...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'Farmer': return <FarmerDashboard activeTab={activeTab} />;
      case 'Consumer': return <ConsumerDashboard activeTab={activeTab} />;
      case 'Admin': return <AdminDashboard activeTab={activeTab} />;
      default: return <div>Unknown role</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar active={activeTab} setActive={(tab) => setActiveTab(tab)} />
      <main style={{
        flex: 1,
        marginLeft: '240px',
        padding: '32px',
        minHeight: '100vh',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Animated Background */}
        <div className="dashboard-background" />
        <div className="dashboard-overlay" />
        
        {/* Floating Blurred Particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div className="floating-veg" style={{ position: 'absolute', top: '15%', left: '10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', filter: 'blur(50px)', animation: 'float-veg 12s infinite ease-in-out' }} />
          <div className="floating-veg" style={{ position: 'absolute', bottom: '20%', right: '15%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(249,115,22,0.08)', filter: 'blur(60px)', animation: 'float-veg 18s infinite ease-in-out alternate' }} />
          <div className="floating-veg" style={{ position: 'absolute', top: '40%', right: '5%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(34,197,94,0.05)', filter: 'blur(40px)', animation: 'float-veg 15s infinite ease-in-out 2s' }} />
        </div>
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161e19',
            color: '#f0fdf4',
            border: '1px solid rgba(34,197,94,0.2)',
            fontSize: '14px',
            fontFamily: 'Poppins, sans-serif',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
