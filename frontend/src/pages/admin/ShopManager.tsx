import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash, Pencil, Coins, Heart, Star } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';

export default function ShopManager() {
  const [items, setItems] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ type: 'points', amount: 0, price: 0, price_premium: 0, label: '', label_en: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchItems = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/shop/items`);
    if (res.ok) setItems(await res.json());
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `${API_BASE_URL}/api/shop/items/${isEditing}` : `${API_BASE_URL}/api/shop/items`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      toast.success(isEditing ? 'Item actualizado' : 'Item creado');
      setShowForm(false);
      setIsEditing(null);
      setForm({ type: 'points', amount: 0, price: 0, price_premium: 0, label: '', label_en: '' });
      fetchItems();
    } else {
      toast.error('Error al guardar el item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este item de la tienda?')) return;
    const res = await fetch(`${API_BASE_URL}/api/shop/items/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toast.success('Item eliminado');
      fetchItems();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0 }}>Gestión de la Tienda</h2>
          <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Configura packs de puntos, vidas y ventajas exclusivas</p>
        </div>
        <button onClick={() => { setShowForm(true); setIsEditing(null); setForm({ type: 'points', amount: 0, price: 0, price_premium: 0, label: '', label_en: '' }); }} className="btn-primary" style={{ padding: '12px 25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={20} /> NUEVO ITEM
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '40px', borderRadius: '35px', marginBottom: '45px', border: '3px solid var(--primary-red)', background: 'var(--card-bg)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 30px 0', fontSize: '24px', fontWeight: '900', color: 'var(--primary-red)' }}>{isEditing ? 'EDITAR ITEM' : 'CREAR NUEVO ITEM'}</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)' }}>TIPO DE RECURSO</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '700' }}>
                <option value="points">Puntos (Toros)</option>
                <option value="lives">Vidas</option>
                <option value="subscription">Suscripción Premium</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)' }}>CANTIDAD</label>
              <input type="number" value={form.amount} onChange={e => setForm({...form, amount: parseInt(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '700' }} />
            </div>
            <div></div>
            <div style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
               <div>
                 <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)' }}>ETIQUETA (ES)</label>
                 <input type="text" value={form.label} onChange={e => setForm({...form, label: e.target.value})} placeholder="ej: Pack de 1000 Toros" style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '700' }} required />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)' }}>LABEL (EN)</label>
                 <input type="text" value={form.label_en} onChange={e => setForm({...form, label_en: e.target.value})} placeholder="ej: 1000 Bulls Pack" style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '700' }} required />
               </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)' }}>PRECIO NORMAL (€)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '700' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)' }}>PRECIO PREMIUM (€)</label>
              <input type="number" step="0.01" value={form.price_premium} onChange={e => setForm({...form, price_premium: parseFloat(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '700' }} />
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'end' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '15px', borderRadius: '14px' }}>{isEditing ? 'ACTUALIZAR' : 'CREAR ITEM'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex: 1, padding: '15px', borderRadius: '14px' }}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
        {items.map(item => (
          <motion.div 
            key={item.id} 
            whileHover={{ y: -8 }}
            className="card" 
            style={{ padding: '30px', borderRadius: '35px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
               <div style={{ width: '55px', height: '55px', borderRadius: '18px', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)' }}>
                  {item.type === 'points' ? <Coins size={28} /> : (item.type === 'lives' ? <Heart size={28} fill="var(--primary-red)" /> : <Star size={28} color="#FFD700" />)}
               </div>
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setIsEditing(item.id); setForm(item); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ padding: '10px', borderRadius: '12px', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer' }}><Pencil size={18} /></button>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '10px', borderRadius: '12px', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer', color: 'var(--primary-red)' }}><Trash size={18} /></button>
               </div>
            </div>
            
            <div style={{ fontWeight: '950', fontSize: '20px', marginBottom: '5px' }}>{item.label}</div>
            <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '600', marginBottom: '20px' }}>{item.label_en}</div>

            <div style={{ background: 'var(--gray-bg)', padding: '20px', borderRadius: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ fontSize: '10px', fontWeight: '900', opacity: 0.6 }}>PRECIO NORMAL</div>
                  <div style={{ fontWeight: '950', fontSize: '18px' }}>{item.price} €</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary-red)' }}>PRECIO PREMIUM</div>
                  <div style={{ fontWeight: '950', fontSize: '18px', color: 'var(--primary-green)' }}>{item.price_premium} €</div>
               </div>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
               <span style={{ fontSize: '11px', fontWeight: '950', background: 'rgba(0,0,0,0.05)', padding: '5px 15px', borderRadius: '10px', textTransform: 'uppercase' }}>ID: #{item.id} • {item.amount} UNIDADES</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
