import React, { useState, useEffect } from 'react';
import { Sprout, ShoppingBag, Shield, X, Mail, Lock, LogIn, ArrowRight, CheckCircle, Smartphone, Globe, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Particle Component for "Flying Drops" Effect
const ParticleEmitter = ({ x, y, color }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Math.random(),
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.7) * 10,
      size: Math.random() * 8 + 4,
      life: 1,
      color: i % 2 === 0 ? color : '#4ade80' // Green/Orange mix
    }));
    setParticles(newParticles);

    const timer = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life - 0.05
      })).filter(p => p.life > 0));
    }, 30);

    return () => clearInterval(timer);
  }, [x, y, color]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.x, top: p.y,
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: '50%',
          opacity: p.life,
          transform: `scale(${p.life})`,
          boxShadow: `0 0 10px ${p.color}`
        }} />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [clickPos, setClickPos] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openModal = (role) => {
    console.log(`[LandingPage] Opening modal for role: ${role}`);
    let defaultEmail = '';
    let defaultPassword = '';
    
    if (role === 'Farmer') {
      defaultEmail = 'demo_farmer@example.com';
      defaultPassword = 'password123';
    } else if (role === 'Consumer') {
      defaultEmail = 'vemulapraneeth108@gmail.com';
      defaultPassword = 'password123';
    } else if (role === 'Admin') {
      defaultEmail = 'admin@farmlink.com';
      defaultPassword = 'admin123';
    }

    setForm({ email: defaultEmail, password: defaultPassword, name: '' });
    setIsLogin(true);
    setActiveModal(role);
  };

  const closeModal = () => {
    setActiveModal(null);
    setForm({ email: '', password: '', name: '' });
  };

  const triggerAnimation = (e) => {
    setClickPos({ x: e.clientX, y: e.clientY });
    setTimeout(() => setClickPos(null), 1000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log(`[AUTH DEBUG] Attempting ${isLogin ? 'Login' : 'Registration'}`);
    console.log(`[AUTH DEBUG] Role intended: ${activeModal}`);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password, name: form.name, role: activeModal };

      console.log(`[AUTH DEBUG] Request Payload:`, { ...payload, password: payload.password?.length ? '[HIDDEN]' : '[EMPTY]' });

      const { data } = await api.post(endpoint, payload);
      
      console.log(`[AUTH DEBUG] Server Response:`, data);
      
      if (isLogin && data.user.role !== activeModal) {
        console.warn(`[AUTH DEBUG] Role mismatch: User is ${data.user.role}, but tried to login via ${activeModal} portal.`);
        toast.error(`This account is not registered as a ${activeModal}. Please use the correct portal.`);
        setLoading(false);
        return;
      }

      console.log(`[AUTH DEBUG] Storing user info in context/localStorage...`);
      login(data.user, data.token);
      toast.success(isLogin ? `Welcome back, ${data.user.name}!` : 'Account created successfully!');
      
      // Close modal on success
      closeModal();
    } catch (err) {
      console.error(`[AUTH DEBUG] Request failed:`, err);
      console.error(`[AUTH DEBUG] Response data:`, err.response?.data);
      toast.error(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const ROLE_CONFIG = {
    Farmer: {
      color: '#22c55e',
      icon: Sprout,
      desc: 'Sell directly, manage stock, and grow your farm business.'
    },
    Consumer: {
      color: '#f97316',
      icon: ShoppingBag,
      desc: 'Buy fresh produce directly from local farms at fair prices.'
    },
    Admin: {
      color: '#6366f1',
      icon: Shield,
      desc: 'Oversee the ecosystem, handle disputes, and monitor growth.'
    }
  };

  const FEATURES = [
    { icon: Globe, title: 'Direct Access', desc: 'Cutting out the middleman to ensure fair prices for everyone.' },
    { icon: Smartphone, title: 'Real-time Tracking', desc: 'Securely track your orders from the farm to your doorstep.' },
    { icon: ShieldCheck, title: 'Verified Farmers', desc: 'Every producer on our platform goes through a strict vetting process.' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050806', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      
      {clickPos && <ParticleEmitter x={clickPos.x} y={clickPos.y} color={activeModal ? ROLE_CONFIG[activeModal].color : '#22c55e'} />}

      {/* Dynamic Background */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.2,
        zIndex: 0
      }} />
      <div className="mesh-gradient" style={{ position: 'fixed', inset: 0, zIndex: 1 }} />
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(to bottom, rgba(5,8,6,0.3) 0%, #050806 100%)',
        zIndex: 2
      }} />

      {/* Modern Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: isScrolled ? '12px 60px' : '24px 60px',
        background: isScrolled ? 'rgba(5, 8, 6, 0.8)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.05)' : 'none'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
              padding: '10px', borderRadius: '14px',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
            }}>
              <Sprout size={24} color="#fff" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>FarmDirect</span>
          </div>
          
          <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }} className="desktop-only">
            {['Explore', 'Marketplace', 'About', 'Contact'].map(item => (
              <a key={item} href="#" style={{ 
                color: 'rgba(255,255,255,0.6)', textDecoration: 'none', 
                fontSize: '14px', fontWeight: '600', transition: '0.2s' 
              }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Content */}
      <main style={{ position: 'relative', zIndex: 10, paddingTop: '160px' }}>
        <section style={{ 
          textAlign: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px'
        }}>
          <div className="animate-reveal" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(255,255,255,0.03)', padding: '8px 16px', 
            borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '32px'
          }}>
            <CheckCircle size={14} color="#22c55e" />
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>Freshness Guaranteed Directly from Farms</span>
          </div>

          <h1 className="animate-reveal delay-1" style={{ 
            fontSize: 'clamp(48px, 10vw, 92px)', fontWeight: '900', lineHeight: 0.95,
            letterSpacing: '-4px', marginBottom: '24px'
          }}>
            Farmer–Consumer <br /> 
            <span style={{ 
              background: 'linear-gradient(to right, #22c55e, #4ade80)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Direct Marketing</span>
          </h1>

          <p className="animate-reveal delay-2" style={{ 
            fontSize: 'clamp(17px, 2.5vw, 22px)', color: 'rgba(255,255,255,0.6)',
            maxWidth: '700px', margin: '0 auto 64px', lineHeight: 1.5
          }}>
            Connecting Farmers Directly with Consumers. <br />
            The marketplace for fresh food, fair trade, and transparent agriculture.
          </p>

          {/* Core Login Entry Points */}
          <div className="animate-reveal delay-3" style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px', maxWidth: '1100px', margin: '0 auto 120px'
          }}>
            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
              <button
                key={role}
                onClick={(e) => { triggerAnimation(e); openModal(role); }}
                className="glow-on-hover"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${config.color}20`,
                  padding: '40px', borderRadius: '32px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.borderColor = config.color;
                  e.currentTarget.style.background = `${config.color}08`;
                  const arrow = e.currentTarget.querySelector('.arrow-btn');
                  if(arrow) arrow.style.gap = '16px';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.borderColor = `${config.color}20`;
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  const arrow = e.currentTarget.querySelector('.arrow-btn');
                  if(arrow) arrow.style.gap = '8px';
                }}
              >
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '24px',
                  background: `${config.color}15`, border: `1px solid ${config.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <config.icon size={36} color={config.color} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{role} Portal</h3>
                <p style={{ fontSize: '14px', color: '#fff', opacity: 0.9, lineHeight: 1.6 }}>{config.desc}</p>
                <div className="arrow-btn" style={{ 
                  marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '14px', fontWeight: '700', color: config.color,
                  transition: 'gap 0.3s'
                }}>
                  Login Now <ArrowRight className="arrow-icon" size={16} />
                </div>
              </button>
            ))}
          </div>

          {/* Features Grid */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '40px', paddingBottom: '160px'
          }}>
            {FEATURES.map((feature, idx) => (
              <div key={idx} style={{ textAlign: 'left', padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ color: '#22c55e', marginBottom: '16px' }}><feature.icon size={32} /></div>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>{feature.title}</h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ 
        position: 'relative', zIndex: 10, background: '#050806',
        padding: '80px 60px 40px', borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', marginBottom: '80px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Sprout size={24} color="#22c55e" />
                <span style={{ fontSize: '20px', fontWeight: '900' }}>FarmDirect</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6 }}>
                Revolutionizing the way we connect with local food producers across the nation.
              </p>
            </div>
            {['Platform', 'Company', 'Support'].map(col => (
              <div key={col}>
                <h5 style={{ fontWeight: '800', marginBottom: '24px' }}>{col}</h5>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['Privacy', 'Market Trends', 'Safety'].map(l => (
                    <li key={l}><a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ 
            paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.03)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '12px', color: 'rgba(255,255,255,0.3)'
          }}>
            <div>&copy; 2026 FarmDirect Systems Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '32px' }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Glassmorphic Login Modal */}
      {activeModal && (
        <div className="modal-auth-backdrop" onClick={closeModal}>
          <div className="modal-auth-content" onClick={e => e.stopPropagation()}>
            <button 
              onClick={closeModal}
              style={{ position: 'absolute', top: '28px', right: '28px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', color: '#fff' }}
            >
              <X size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '24px', 
                background: `${ROLE_CONFIG[activeModal].color}15`, 
                border: `1px solid ${ROLE_CONFIG[activeModal].color}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: `0 0 30px ${ROLE_CONFIG[activeModal].color}20`
              }}>
                {React.createElement(ROLE_CONFIG[activeModal].icon, { size: 40, color: ROLE_CONFIG[activeModal].color })}
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px', letterSpacing: '-1px', color: '#fff' }}>{isLogin ? `${activeModal} Login` : `Join as ${activeModal}`}</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>{isLogin ? 'Access your direct marketing dashboard' : 'Start your journey with FarmDirect today'}</p>
            </div>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!isLogin && (
                <div className="form-group animate-reveal">
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', marginLeft: '4px' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={18} />
                    <input 
                      type="text" required placeholder="Enter your full name"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      style={{ 
                        width: '100%', padding: '18px 18px 18px 56px', borderRadius: '20px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = ROLE_CONFIG[activeModal].color}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', marginLeft: '4px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={18} />
                  <input 
                    type="email" required placeholder="Enter your email"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={{ 
                      width: '100%', padding: '18px 18px 18px 56px', borderRadius: '20px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = ROLE_CONFIG[activeModal].color}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', marginLeft: '4px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={18} />
                  <input 
                    type="password" required placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{ 
                      width: '100%', padding: '18px 18px 18px 56px', borderRadius: '20px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = ROLE_CONFIG[activeModal].color}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                style={{ 
                  marginTop: '10px', padding: '18px', borderRadius: '20px',
                  background: `linear-gradient(135deg, ${ROLE_CONFIG[activeModal].color}, ${ROLE_CONFIG[activeModal].color}aa)`, 
                  color: '#fff', border: 'none', fontSize: '16px', fontWeight: '800',
                  cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: `0 10px 30px ${ROLE_CONFIG[activeModal].color}30`
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {loading ? 'Processing...' : <>{isLogin ? <LogIn size={22} /> : <Sprout size={22} />} {isLogin ? 'Login Now' : 'Create Account'}</>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{isLogin ? "New to the platform? " : "Already have an account? "}</span>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', border: 'none', color: ROLE_CONFIG[activeModal].color, fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}
              >
                {isLogin ? `Sign Up as ${activeModal}` : 'Login Instead'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
