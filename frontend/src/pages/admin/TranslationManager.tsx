import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Save, RefreshCw, Plus, Trash } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';

export default function TranslationManager() {
  const [translations, setTranslations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newKey, setNewKey] = useState({ key: '', es: '', en: '' });
  const [showAddForm, setShowForm] = useState(false);

  const fetchTranslations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/translations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const keys = Object.keys(data.es || {});
      const transArray = keys.map(key => ({
        key,
        es: (data.es || {})[key] || '',
        en: (data.en || {})[key] || ''
      }));
      setTranslations(transArray);
    } catch (err) {
      console.error('Error fetching translations:', err);
      toast.error('Error al cargar traducciones');
    }
  }, []);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    const es: any = {};
    const en: any = {};
    translations.forEach(t => {
      es[t.key] = t.es;
      en[t.key] = t.en;
    });

    const res = await fetch(`${API_BASE_URL}/api/settings/translations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ es, en })
    });

    if (res.ok) {
      toast.success('Traducciones actualizadas correctamente');
      fetchTranslations();
    } else {
      toast.error('Error al guardar traducciones');
    }
    setIsSaving(false);
  };

  const handleAddKey = () => {
    if (!newKey.key.trim()) return toast.error('La clave es obligatoria');
    if (translations.some(t => t.key === newKey.key)) return toast.error('Esa clave ya existe');
    
    setTranslations([...translations, newKey]);
    setNewKey({ key: '', es: '', en: '' });
    setShowForm(false);
  };

  const removeKey = (key: string) => {
    if (window.confirm(`¿Seguro que quieres eliminar la clave "${key}"?`)) {
      setTranslations(translations.filter(t => t.key !== key));
    }
  };

  const filtered = translations.filter(t => 
    (t.key || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.es || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.en || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0 }}>Gestor de Idiomas</h2>
          <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Controla cada palabra de la plataforma en ES y EN</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setShowForm(!showAddForm)} className="btn-secondary" style={{ padding: '12px 25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Plus size={18} /> AÑADIR CLAVE
          </button>
          <button onClick={handleSaveAll} disabled={isSaving} className="btn-primary" style={{ padding: '12px 30px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isSaving ? <RefreshCw size={18} className="spin" /> : <Save size={18} />} 
            {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="card" style={{ padding: '30px', borderRadius: '25px', marginBottom: '35px', border: '2px solid var(--primary-red)', background: 'rgba(229, 57, 53, 0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '900' }}>Nueva Clave de Texto</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr auto', gap: '15px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '900' }}>CLAVE (SNAKE_CASE)</label>
              <input type="text" value={newKey.key} onChange={e => setNewKey({...newKey, key: e.target.value.toUpperCase()})} placeholder="ej: BTN_START" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '900' }}>ESPAÑOL</label>
              <input type="text" value={newKey.es} onChange={e => setNewKey({...newKey, es: e.target.value})} placeholder="Texto en español..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '900' }}>ENGLISH</label>
              <input type="text" value={newKey.en} onChange={e => setNewKey({...newKey, en: e.target.value})} placeholder="English text..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }} />
            </div>
            <button onClick={handleAddKey} className="btn-primary" style={{ padding: '12px 25px', borderRadius: '12px' }}>AÑADIR</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '0', borderRadius: '30px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
        <div style={{ padding: '25px 30px', background: 'var(--gray-bg)', borderBottom: '2px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Buscar por clave o contenido..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '600' }}
            />
          </div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary-text)' }}>{filtered.length} RESULTADOS</div>
        </div>

        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '15px 30px', fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)', width: '25%' }}>CLAVE SISTEMA</th>
                <th style={{ textAlign: 'left', padding: '15px 30px', fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)', width: '35%' }}>TRADUCCIÓN ESPAÑOL</th>
                <th style={{ textAlign: 'left', padding: '15px 30px', fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)', width: '35%' }}>ENGLISH TRANSLATION</th>
                <th style={{ padding: '15px 30px', width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr key={t.key} style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                  <td style={{ padding: '15px 30px' }}>
                    <code style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary-red)', background: 'rgba(229, 57, 53, 0.05)', padding: '4px 8px', borderRadius: '6px' }}>{t.key}</code>
                  </td>
                  <td style={{ padding: '15px 30px' }}>
                    <textarea 
                      value={t.es} 
                      onChange={e => {
                        const newTrans = [...translations];
                        const item = newTrans.find(item => item.key === t.key);
                        if (item) item.es = e.target.value;
                        setTranslations(newTrans);
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid transparent', background: 'transparent', resize: 'vertical', minHeight: '40px', fontSize: '14px', fontWeight: '500' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--border-color)', e.target.style.background = 'var(--card-bg)')}
                      onBlur={e => (e.target.style.borderColor = 'transparent', e.target.style.background = 'transparent')}
                    />
                  </td>
                  <td style={{ padding: '15px 30px' }}>
                    <textarea 
                      value={t.en} 
                      onChange={e => {
                        const newTrans = [...translations];
                        const item = newTrans.find(item => item.key === t.key);
                        if (item) item.en = e.target.value;
                        setTranslations(newTrans);
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid transparent', background: 'transparent', resize: 'vertical', minHeight: '40px', fontSize: '14px', fontWeight: '500' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--border-color)', e.target.style.background = 'var(--card-bg)')}
                      onBlur={e => (e.target.style.borderColor = 'transparent', e.target.style.background = 'transparent')}
                    />
                  </td>
                  <td style={{ padding: '15px 30px' }}>
                    <button onClick={() => removeKey(t.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)', opacity: 0.3 }}>
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
