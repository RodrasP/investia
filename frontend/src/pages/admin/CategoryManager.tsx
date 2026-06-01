import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash, Pencil, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', name_en: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/settings/categories`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setCategories(await res.json());
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `${API_BASE_URL}/api/settings/categories/${isEditing}` : `${API_BASE_URL}/api/settings/categories`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      toast.success(isEditing ? 'Categoría actualizada' : 'Categoría creada');
      setShowForm(false);
      setIsEditing(null);
      setForm({ name: '', name_en: '' });
      fetchCategories();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta categoría? Los cursos asociados podrían quedar huérfanos.')) return;
    const res = await fetch(`${API_BASE_URL}/api/settings/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toast.success('Categoría eliminada');
      fetchCategories();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0 }}>Gestión de Categorías</h2>
          <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Organiza los cursos por temática para facilitar la navegación</p>
        </div>
        <button onClick={() => { setShowForm(true); setIsEditing(null); setForm({ name: '', name_en: '' }); }} className="btn-primary" style={{ padding: '12px 25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={20} /> NUEVA CATEGORÍA
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '30px', borderRadius: '30px', marginBottom: '35px', border: '3px solid var(--primary-red)', background: 'var(--card-bg)' }}>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '900' }}>NOMBRE (ES)</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="ej: Criptomonedas" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)' }} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '900' }}>NAME (EN)</label>
              <input type="text" value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} placeholder="ej: Cryptocurrencies" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)' }} required />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary" style={{ padding: '12px 25px', borderRadius: '12px' }}>{isEditing ? 'GUARDAR' : 'CREAR'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: '12px 20px', borderRadius: '12px' }}><X size={18} /></button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {categories.map(cat => (
          <div key={cat.id} className="card" style={{ padding: '25px', borderRadius: '25px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '950', fontSize: '18px' }}>{cat.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '600' }}>{cat.name_en}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setIsEditing(cat.id); setForm(cat); setShowForm(true); }} style={{ padding: '8px', borderRadius: '10px', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer' }}><Pencil size={16} /></button>
              <button onClick={() => handleDelete(cat.id)} style={{ padding: '8px', borderRadius: '10px', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer', color: 'var(--primary-red)' }}><Trash size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
