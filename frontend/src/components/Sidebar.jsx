import { Sprout, ShoppingCart, Users, Package, ClipboardList, TrendingUp, LogOut, BarChart2, MessageSquare, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = {
  Farmer: [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'orders', label: 'Incoming Orders', icon: ClipboardList },
  ],
  Consumer: [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'market', label: 'Marketplace', icon: ShoppingCart },
    { id: 'orders', label: 'My Orders', icon: ClipboardList },
  ],
  Admin: [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'products', label: 'Product Monitoring', icon: Package },
    { id: 'orders', label: 'Order Management', icon: ClipboardList },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'analytics', label: 'Reports', icon: TrendingUp },
    { id: 'system', label: 'System Control', icon: Activity },
  ],
};

const roleColors = { Farmer: '#22c55e', Consumer: '#f97316', Admin: '#a855f7' };
const roleIcons = { Farmer: Sprout, Consumer: ShoppingCart, Admin: Users };

export default function Sidebar({ active, setActive }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = menuItems[user.role] || [];
  const RoleIcon = roleIcons[user.role] || Sprout;
  const roleColor = roleColors[user.role] || '#22c55e';

  return (
    <aside 
      className="animate-side-in"
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: '10px 0 30px rgba(0,0,0,0.02)'
      }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(34,197,94,0.4)',
          }}>
            <Sprout size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1 }}>FarmDirect</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Direct Market</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: '10px',
          padding: '12px',
          border: `1px solid ${roleColor}30`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `${roleColor}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${roleColor}40`,
              flexShrink: 0,
            }}>
              <RoleIcon size={18} color={roleColor} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: roleColor, fontWeight: '600' }}>{user.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => setActive(item.id)}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-light)' }}>
        <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)' }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
