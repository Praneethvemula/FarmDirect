import { useState, useEffect } from 'react';
// FarmerDashboard – receives activeTab from App.jsx via Sidebar
import { Package, ClipboardList, TrendingUp, PlusCircle, Edit2, Trash2, X, IndianRupee, BoxIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  Pending: 'badge-yellow',
  Accepted: 'badge-blue',
  Shipped: 'badge-orange',
  Delivered: 'badge-green',
  Cancelled: 'badge-red',
};

function ProductModal({ onClose, onSaved, editing }) {
  const [form, setForm] = useState(editing || { name: '', category: '', description: '', price: '', unit: 'kg', stock: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/farmer/products/${editing.id}`, form);
        toast.success('Product updated!');
      } else {
        await api.post('/farmer/products', form);
        toast.success('Product added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editing ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Organic Tomatoes" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select...</option>
                {['Vegetables','Fruits','Grains','Dairy','Spices','Pulses','Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-input" name="unit" value={form.unit} onChange={handleChange}>
                {['kg','g','ton','piece','dozen','litre','bundle'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input className="form-input" name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock</label>
              <input className="form-input" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="100" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" name="description" value={form.description} onChange={handleChange} placeholder="Fresh, organically grown..." rows={2} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Saving...</> : (editing ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FarmerDashboard({ activeTab = 'dashboard' }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingO, setLoadingO] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProd, setEditingProd] = useState(null);

  const fetchProducts = async () => {
    setLoadingP(true);
    try { const { data } = await api.get('/farmer/products'); setProducts(data); }
    catch { toast.error('Failed to load products'); }
    finally { setLoadingP(false); }
  };

  const fetchOrders = async () => {
    setLoadingO(true);
    try { const { data } = await api.get('/farmer/orders'); setOrders(data); }
    catch { toast.error('Failed to load orders'); }
    finally { setLoadingO(false); }
  };

  useEffect(() => { fetchProducts(); fetchOrders(); }, []);

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/farmer/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/farmer/orders/${id}/status`, { status });
      toast.success('Order status updated!');
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
  };

  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Quick Stats */}
      {activeTab === 'dashboard' && (
        <>
          <div className="page-header">
            <h1>👋 Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p>Here's an overview of your farm operations</p>
          </div>
          <div className="grid-3" style={{ marginBottom: '28px' }}>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green"><Package size={22} /></div>
              <div>
                <div className="stat-value">{products.length}</div>
                <div className="stat-label">Active Products</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-orange"><ClipboardList size={22} /></div>
              <div>
                <div className="stat-value">{orders.length}</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue"><TrendingUp size={22} /></div>
              <div>
                <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{ marginBottom: '28px' }}>
            <div className="section-title"><ClipboardList size={16} />Recent Orders</div>
            {loadingO ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
            ) : orders.length === 0 ? (
              <div className="empty-state"><ClipboardList size={40} /><h3>No orders yet</h3><p>Orders from consumers will appear here</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Order ID</th><th>Consumer</th><th>Amount</th><th>Status</th><th>Payment</th><th>Action</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>#{o.id.toString().padStart(6, '0')}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{o.consumer?.name || 'Consumer'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.consumer?.phone}</div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                        <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                        <td><span className={`badge ${o.paymentStatus === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>{o.paymentStatus}</span></td>
                        <td>
                          <select
                            className="form-input"
                            style={{ padding: '5px 8px', fontSize: '12px', width: 'auto' }}
                            value={o.status}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                          >
                            {['Pending','Accepted','Shipped','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1>My Products</h1>
              <p>Manage your product listings and inventory</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditingProd(null); setShowModal(true); }}>
              <PlusCircle size={16} /> Add Product
            </button>
          </div>

          {loadingP ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Package size={48} /><h3>No products listed</h3>
              <p>Start adding your farm products to reach consumers</p>
              <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}><PlusCircle size={16} /> Add First Product</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0,
                            backgroundImage: p.images?.[0] ? `url(${p.images[0]})` : 'none',
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            background: p.images?.[0] ? undefined : 'var(--bg-elevated)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: p.images?.[0] ? 0 : '22px',
                            border: '1px solid var(--border-light)',
                          }}>
                            {!p.images?.[0] && (p.category === 'Fruits' ? '🍎' : '🥬')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.description?.slice(0, 40)}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-blue">{p.category}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.price}/{p.unit}</td>
                      <td>
                        <span className={`badge ${p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-yellow' : 'badge-red'}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setEditingProd(p); setShowModal(true); }}>
                            <Edit2 size={12} /> Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          <div className="page-header">
            <h1>Incoming Orders</h1>
            <p>Track and manage orders from consumers</p>
          </div>
          {loadingO ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state"><ClipboardList size={48} /><h3>No orders yet</h3><p>When consumers place orders, they'll appear here</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(o => (
                <div key={o.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ORDER #{o.id.toString().padStart(8, '0')}</div>
                      <div style={{ fontWeight: 600, fontSize: '16px' }}>{o.consumer?.name || 'Consumer'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.consumer?.email} · {o.consumer?.phone}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>₹{o.totalAmount.toLocaleString('en-IN')}</div>
                      <span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>DELIVERY ADDRESS</div>
                    <div style={{ fontSize: '14px' }}>{o.deliveryAddress}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Update Status:</span>
                    <select
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '13px', width: 'auto' }}
                      value={o.status}
                      onChange={e => updateOrderStatus(o.id, e.target.value)}
                    >
                      {['Pending','Accepted','Shipped','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span className={`badge ${o.paymentMethod === 'COD' ? 'badge-orange' : 'badge-blue'}`}>{o.paymentMethod}</span>
                    <span className={`badge ${o.paymentStatus === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>{o.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showModal && (
        <ProductModal
          onClose={() => setShowModal(false)}
          onSaved={fetchProducts}
          editing={editingProd}
        />
      )}
    </div>
  );
}

