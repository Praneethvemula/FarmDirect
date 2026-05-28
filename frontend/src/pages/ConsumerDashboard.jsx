import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, X, Package, ClipboardList, MapPin, CreditCard, Truck, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORY_EMOJI = { Vegetables: '🥬', Fruits: '🍎', Grains: '🌾', Dairy: '🥛', Spices: '🌶️', Pulses: '🫘', Other: '📦' };

const STATUS_BADGE = {
  Pending: 'badge-yellow', Accepted: 'badge-blue',
  Shipped: 'badge-orange', Delivered: 'badge-green', Cancelled: 'badge-red',
};
const STATUS_ICON = { Pending: '⏳', Accepted: '✅', Shipped: '🚚', Delivered: '📦', Cancelled: '❌' };

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;
    let totalMilisecondDuraton = 1000;
    let incrementTime = (totalMilisecondDuraton / end) * 5;
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}</span>;
};

function OrderModal({ cart, onClose, onSuccess }) {
  const [form, setForm] = useState({ deliveryAddress: '', paymentMethod: 'COD' });
  const [loading, setLoading] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.deliveryAddress) return toast.error('Please enter delivery address');
    setLoading(true);
    try {
      // Group by farmer
      const byFarmer = {};
      cart.forEach(item => {
        if (!byFarmer[item.farmerId]) byFarmer[item.farmerId] = [];
        byFarmer[item.farmerId].push(item);
      });
      for (const [farmerId, items] of Object.entries(byFarmer)) {
        const products = items.map(i => ({ productId: i.id, quantity: i.quantity, priceAtPurchase: i.price }));
        const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
        await api.post('/consumer/orders', { farmerId, products, totalAmount, paymentMethod: form.paymentMethod, deliveryAddress: form.deliveryAddress });
      }
      toast.success('Order placed successfully! 🎉');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirm Order</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Cart items */}
        <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qty: {item.quantity} {item.unit}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(34,197,94,0.08)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)', marginBottom: '20px' }}>
          <span style={{ fontWeight: 700 }}>Total Amount</span>
          <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '18px', fontFamily: 'Outfit' }}>₹{total.toLocaleString('en-IN')}</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label"><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />Delivery Address</label>
            <textarea className="form-input" value={form.deliveryAddress} onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))} placeholder="Enter your full delivery address..." rows={2} required />
          </div>
          <div className="form-group">
            <label className="form-label"><CreditCard size={12} style={{ display: 'inline', marginRight: '4px' }} />Payment Method</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['COD','UPI','Card'].map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setForm(f => ({ ...f, paymentMethod: m }))}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                    borderColor: form.paymentMethod === m ? 'var(--primary)' : 'var(--border-light)',
                    background: form.paymentMethod === m ? 'rgba(34,197,94,0.15)' : 'var(--bg-elevated)',
                    color: form.paymentMethod === m ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
                  }}
                >{m}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Placing...</> : '🛒 Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ConsumerDashboard({ activeTab }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try { 
      const { data } = await api.get('/consumer/products', { params: { search, category } }); 
      setProducts(data); 
    }
    catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try { const { data } = await api.get('/consumer/orders'); setOrders(data); }
    catch { toast.error('Failed to load orders'); }
    finally { setLoadingOrders(false); }
  };

  useEffect(() => { 
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, category]);

  useEffect(() => { fetchOrders(); }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, farmerId: product.farmer?.id || product.farmerId, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`, { duration: 1500 });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  // eslint-disable-next-line no-unused-vars
  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.farmer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* Dashboard overview */}
      {activeTab === 'dashboard' && (
        <>
          <div className="page-header animate-fade-slide">
            <h1 style={{ fontSize: '38px', letterSpacing: '-1.5px' }}>
              👋 Hello, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="delay-1" style={{ opacity: 0.7 }}>Welcome back to your fresh marketing portal</p>
          </div>

          <div className="grid-3 animate-fade-slide delay-1" style={{ marginBottom: '32px' }}>
            <div className="glass-card p-6">
              <div className="stat-icon stat-icon-green" style={{ marginBottom: '16px' }}><Package size={24} /></div>
              <div className="stat-value"><AnimatedCounter value={products.length} /></div>
              <div className="stat-label">Market Products</div>
            </div>
            <div className="glass-card p-6">
              <div className="stat-icon stat-icon-orange" style={{ marginBottom: '16px' }}><ClipboardList size={24} /></div>
              <div className="stat-value"><AnimatedCounter value={orders.length} /></div>
              <div className="stat-label">Total Purchases</div>
            </div>
            <div className="glass-card p-6">
              <div className="stat-icon stat-icon-blue" style={{ marginBottom: '16px' }}><ShoppingCart size={24} /></div>
              <div className="stat-value"><AnimatedCounter value={cart.length} /></div>
              <div className="stat-label">Items in Cart</div>
            </div>
          </div>

          {/* Recent orders */}
          <div className="animate-fade-slide delay-2">
            <div className="section-title"><Clock size={16} style={{ marginRight: '8px' }} />Recent Orders Explorer</div>
            {loadingOrders ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
            ) : orders.length === 0 ? (
              <div className="empty-state glass-card"><ShoppingCart size={40} /><h3>No commerce history</h3><p>Start your first healthy purchase today</p></div>
            ) : (
              <div className="table-wrap glass-card" style={{ padding: '8px' }}>
                <table>
                  <thead><tr><th>Order ID</th><th>Farmer</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px', opacity: 0.6 }}>#{String(o.id).padStart(6, '0')}</td>
                        <td style={{ fontWeight: 600 }}>{o.farmer?.name}</td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'} badge-pulse`}>
                            {STATUS_ICON[o.status]} {o.status}
                          </span>
                        </td>
                        <td style={{ opacity: 0.6, fontSize: '12px' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Marketplace */}
      {activeTab === 'market' && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Outfit' }}>Marketplace</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Fresh produce directly from verified farmers</p>
            </div>
            {cart.length > 0 && (
              <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
                <ShoppingCart size={16} /> Cart ({cart.length}) · ₹{cartTotal.toLocaleString('en-IN')}
              </button>
            )}
          </div>

          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={16} />
              <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or farmers..." />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '8px 14px', borderRadius: '20px', border: '1px solid',
                    borderColor: category === c ? 'var(--primary)' : 'var(--border-light)',
                    background: category === c ? 'rgba(34,197,94,0.15)' : 'var(--bg-elevated)',
                    color: category === c ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s',
                  }}
                >{CATEGORY_EMOJI[c] || '🌿'} {c}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><Package size={48} /><h3>No products found</h3><p>Try adjusting your search or filters</p></div>
          ) : (
            <div className="grid-4">
              {filtered.map(p => (
                <div key={p.id} className="product-card">
                  <div
                    className="product-img"
                    style={p.images?.[0] ? {
                      backgroundImage: `url(${p.images[0]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      fontSize: 0,
                    } : {}}
                  >
                    {!p.images?.[0] && (CATEGORY_EMOJI[p.category] || '🌿')}
                  </div>
                  <div className="product-body">
                    <div className="product-name">{p.name}</div>
                    <div className="product-farmer">🌾 {p.farmer?.name} · {p.farmer?.location}</div>
                    <span className="badge badge-blue" style={{ marginBottom: '8px' }}>{p.category}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '8px 0' }}>
                      <span className="product-price">₹{p.price}</span>
                      <span className="product-unit">/{p.unit}</span>
                    </div>
                    <div className="product-stock">Stock: {p.stock} {p.unit}</div>
                    <button
                      className="btn btn-primary w-full mt-2"
                      style={{ marginTop: '12px' }}
                      disabled={p.stock === 0}
                      onClick={() => addToCart(p)}
                    >
                      <ShoppingCart size={14} /> {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cart sidebar (if items) */}
          {cart.length > 0 && (
            <div style={{
              position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--bg-card)', border: '1px solid var(--primary)',
              borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 24px var(--primary-glow)',
              zIndex: 200, animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={18} color="var(--primary)" />
                <span style={{ fontWeight: 700 }}>{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
                <span style={{ color: 'var(--text-muted)' }}>·</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontFamily: 'Outfit', fontSize: '16px' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowOrderModal(true)}>Checkout →</button>
            </div>
          )}
        </>
      )}

      {/* My Orders */}
      {activeTab === 'orders' && (
        <>
          <div className="page-header">
            <h1>My Orders</h1>
            <p>Track all your orders from farmers</p>
          </div>
          {loadingOrders ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state"><ClipboardList size={48} /><h3>No orders yet</h3><p>Browse the marketplace and place your first order!</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(o => (
                <div key={o.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>ORDER #{String(o.id).padStart(8, '0').toUpperCase()}</div>
                      <div style={{ fontWeight: 600 }}>From: {o.farmer?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>₹{o.totalAmount.toLocaleString('en-IN')}</div>
                      <span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{STATUS_ICON[o.status]} {o.status}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', gap: '0', marginBottom: '12px' }}>
                    {['Pending','Accepted','Shipped','Delivered'].map((s, idx) => {
                      const steps = ['Pending','Accepted','Shipped','Delivered'];
                      const currentIdx = steps.indexOf(o.status);
                      const done = idx <= currentIdx && o.status !== 'Cancelled';
                      return (
                        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: idx === 0 ? 0 : 1, height: '2px', background: done && idx > 0 ? 'var(--primary)' : 'var(--border-light)', transition: 'background 0.3s' }} />
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: done ? 'var(--primary)' : 'var(--bg-elevated)', border: `2px solid ${done ? 'var(--primary)' : 'var(--border-light)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {done && <CheckCircle size={12} color="#fff" />}
                            </div>
                            <div style={{ flex: idx === 3 ? 0 : 1, height: '2px', background: idx < currentIdx && o.status !== 'Cancelled' ? 'var(--primary)' : 'var(--border-light)', transition: 'background 0.3s' }} />
                          </div>
                          <span style={{ fontSize: '10px', color: done ? 'var(--primary)' : 'var(--text-muted)' }}>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    📍 {o.deliveryAddress} · 💳 {o.payment?.paymentMethod || o.paymentMethod || 'COD'} · {o.payment?.paymentStatus || o.paymentStatus || 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showOrderModal && (
        <OrderModal
          cart={cart}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => { setCart([]); fetchOrders(); }}
        />
      )}
    </div>
  );
}
