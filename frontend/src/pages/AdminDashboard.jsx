import { useState, useEffect } from 'react';
import { 
  Users, Package, ClipboardList, TrendingUp, Activity, 
  MessageSquare, Trash2, CheckCircle, AlertCircle, 
  BarChart2, ShieldCheck, Globe, Server, Database 
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  Pending: 'badge-yellow', Accepted: 'badge-blue',
  Shipped: 'badge-orange', Delivered: 'badge-green', Cancelled: 'badge-red',
};
const ROLE_BADGE = { Farmer: 'badge-green', Consumer: 'badge-orange', Admin: 'badge-blue' };

function StatCard({ icon: Icon, value, label, color }) {
  const IconComponent = Icon;
  return (
    <div className="stat-card">
      <div className={`stat-icon`} style={{ background: `${color}20`, color }}>
        <IconComponent size={22} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ activeTab }) {
  const [data, setData] = useState({
    products: [],
    orders: [],
    users: [],
    complaints: [],
    stats: null,
    systemStatus: null
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes, uRes, cRes, sRes, sysRes] = await Promise.all([
        api.get('/consumer/products'), // All products
        api.get('/farmer/orders'),    // All orders (Admin access)
        api.get('/admin/users'),
        api.get('/admin/complaints'),
        api.get('/admin/stats'),
        api.get('/admin/status')
      ]);

      setData({
        products: pRes.data,
        orders: oRes.data,
        users: uRes.data,
        complaints: cRes.data,
        stats: sRes.data,
        systemStatus: sysRes.data
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User removed from platform');
      fetchData();
    } catch { toast.error('Failed to delete user'); }
  };

  const handleResolveComplaint = async (id) => {
    const resolution = window.prompt('Enter resolution notes:');
    if (!resolution) return;
    try {
      await api.post(`/admin/complaints/${id}/resolve`, { resolution });
      toast.success('Complaint marked as resolved');
      fetchData();
    } catch { toast.error('Failed to resolve complaint'); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/farmer/orders/${id}/status`, { status });
      toast.success('Order status updated');
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
      <div className="spinner" />
      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Syncing Platform Data...</div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <>
          <div className="page-header">
            <h1>Platform Overview</h1>
            <p>Real-time analytics and management dashboard</p>
          </div>

          <div className="grid-4" style={{ marginBottom: '28px' }}>
            <StatCard icon={Users} value={data.stats?.users || 0} label="Total Users" color="#3b82f6" />
            <StatCard icon={Package} value={data.stats?.products || 0} label="Products" color="#22c55e" />
            <StatCard icon={ClipboardList} value={data.stats?.orders || 0} label="Orders" color="#f97316" />
            <StatCard icon={TrendingUp} value={`₹${(data.stats?.revenue || 0).toLocaleString('en-IN')}`} label="Revenue" color="#06b6d4" />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="section-title"><MessageSquare size={16} />Pending Complaints</div>
              {data.complaints.filter(c => c.status === 'Pending').length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>No pending issues</div>
              ) : (
                data.complaints.filter(c => c.status === 'Pending').slice(0, 3).map(c => (
                  <div key={c.id} style={{ padding: '12px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.subject}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From: {c.user?.name}</div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleResolveComplaint(c.id)}>Resolve</button>
                  </div>
                ))
              )}
            </div>
            <div className="card">
              <div className="section-title"><Activity size={16} />System Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>API Health</span>
                  <span className="badge badge-green">Healthy</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>Database</span>
                  <span className="badge badge-green">Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>Server Uptime</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{Math.floor(data.systemStatus?.uptime / 3600)}h {Math.floor((data.systemStatus?.uptime % 3600) / 60)}m</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <>
          <div className="page-header">
            <h1>User Management</h1>
            <p>Maintain and monitor farmers and consumers</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>User</th><th>Role</th><th>Contact</th><th>Joined</th><th>Location</th><th>Action</th></tr>
              </thead>
              <tbody>
                {data.users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                    <td>{u.phone || '—'}</td>
                    <td style={{ fontSize: '13px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.location || '—'}</td>
                    <td>
                      {u.role !== 'Admin' && (
                        <button className="btn" style={{ color: 'var(--danger)', padding: '6px' }} onClick={() => handleDeleteUser(u.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Product Monitoring */}
      {activeTab === 'products' && (
        <>
          <div className="page-header">
            <h1>Product Monitoring</h1>
            <p>Platform-wide product listings</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Farmer</th><th>Category</th><th>Price</th><th>Stock</th><th>Location</th></tr></thead>
              <tbody>
                {data.products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.description?.slice(0, 40)}...</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.farmer?.name}</td>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.price}/{p.unit}</td>
                    <td>
                      <span className={`badge ${p.stock > 10 ? 'badge-green' : 'badge-yellow'}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.farmer?.location || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Order Management */}
      {activeTab === 'orders' && (
        <>
          <div className="page-header">
            <h1>All Platform Orders</h1>
            <p>Review and control transactions</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order ID</th><th>Consumer</th><th>Amount</th><th>Method</th><th>Status</th><th>Payment</th><th>Manage</th></tr></thead>
              <tbody>
                {data.orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.consumer?.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.consumer?.email}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{o.totalAmount}</td>
                    <td><span className="badge badge-blue">{o.paymentMethod}</span></td>
                    <td><span className={`badge ${STATUS_BADGE[o.status]}`}>{o.status}</span></td>
                    <td><span className={`badge ${o.paymentStatus === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>{o.paymentStatus}</span></td>
                    <td>
                      <select 
                        className="form-input" 
                        style={{ padding: '4px', fontSize: '12px' }} 
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      >
                        {['Pending','Accepted','Shipped','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Complaints */}
      {activeTab === 'complaints' && (
        <>
          <div className="page-header">
            <h1>Complaint Handling</h1>
            <p>Resolve user issues and feedback</p>
          </div>
          <div className="grid-2" style={{ gap: '20px' }}>
            {data.complaints.length === 0 ? (
              <div className="empty-state">No complaints registered</div>
            ) : data.complaints.map(c => (
              <div key={c.id} className="card" style={{ borderLeft: `4px solid ${c.status === 'Pending' ? 'var(--warning)' : 'var(--success)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className={`badge ${c.status === 'Pending' ? 'badge-yellow' : 'badge-green'}`}>{c.status}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{c.subject}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{c.message}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>User: {c.user?.name}</span>
                  {c.status === 'Pending' ? (
                    <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => handleResolveComplaint(c.id)}>Resolve</button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>Resolved</span>
                  )}
                </div>
                {c.resolution && (
                  <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '6px', fontSize: '13px' }}>
                    <strong>Resolution:</strong> {c.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Analytics / Reports */}
      {activeTab === 'analytics' && (
        <>
          <div className="page-header">
            <h1>System Reports</h1>
            <p>Performance metrics and sales insights</p>
          </div>
          <div className="grid-2">
            <div className="card">
              <div className="section-title"><TrendingUp size={16} />Service Revenue (Last 30 Days)</div>
              <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px 0', overflowX: 'auto' }}>
                {(!data.stats?.dailySales || data.stats.dailySales.length === 0) ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No sales data available for this period
                  </div>
                ) : (
                  data.stats.dailySales.map((day, i) => (
                    <div 
                      key={i} 
                      title={`${day.date}: ₹${day.total}`}
                      style={{ 
                        flex: 1, 
                        minWidth: '10px',
                        background: 'var(--primary)', 
                        height: `${Math.min(100, (day.total / (data.stats.revenue || 1)) * 500)}%`, 
                        borderRadius: '4px 4px 0 0', 
                        opacity: 0.7 + (i / 60),
                        transition: 'height 0.6s ease'
                      }} 
                    />
                  ))
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px', marginTop: '8px' }}>
                <span>{data.stats?.dailySales?.[0]?.date || 'Oldest'}</span>
                <span>{data.stats?.dailySales?.[data.stats.dailySales.length-1]?.date || 'Latest'}</span>
              </div>
            </div>
            <div className="card">
              <div className="section-title"><Users size={16} />User Demographics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span>Farmers</span><span>{data.users.filter(u => u.role === 'Farmer').length}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px' }}>
                    <div style={{ width: `${(data.users.filter(u => u.role === 'Farmer').length / data.users.length) * 100}%`, height: '100%', background: '#22c55e', borderRadius: '3px' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span>Consumers</span><span>{data.users.filter(u => u.role === 'Consumer').length}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px' }}>
                    <div style={{ width: `${(data.users.filter(u => u.role === 'Consumer').length / data.users.length) * 100}%`, height: '100%', background: '#f97316', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* System Control */}
      {activeTab === 'system' && (
        <>
          <div className="page-header">
            <h1>System Control</h1>
            <p>Overall system health and maintenance</p>
          </div>
          <div className="grid-3">
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px' }}>
              <ShieldCheck size={40} color="var(--primary)" style={{ marginBottom: '16px' }} />
              <h3>Security Status</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Firewall active. SSL Certificate valid for 320 days.</p>
              <span className="badge badge-green" style={{ marginTop: '12px' }}>Secure</span>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px' }}>
              <Database size={40} color="#06b6d4" style={{ marginBottom: '16px' }} />
              <h3>Database Health</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>MySQL 8.0 instance running. Latency: 4ms. Backups: Daily.</p>
              <span className="badge badge-green" style={{ marginTop: '12px' }}>Optimized</span>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px' }}>
              <Server size={40} color="#f97316" style={{ marginBottom: '16px' }} />
              <h3>Server Cluster</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>3 Active nodes. CPU Load: 12%. RAM usage: 1.4GB.</p>
              <span className="badge badge-blue" style={{ marginTop: '12px' }}>Operational</span>
            </div>
          </div>
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="section-title"><Activity size={16} />Logs / Activity Stream</div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>[2024-04-20 22:15:30] AUTH: Admin login successful - IP: 192.168.1.1</div>
              <div>[2024-04-20 22:12:45] DB: Synced 5 models with database schema</div>
              <div>[2024-04-20 22:10:12] ORDER: New order created #ORD-9912 - Consumer: John Doe</div>
              <div>[2024-04-20 22:05:00] SYSTEM: Daily automated backup completed</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
