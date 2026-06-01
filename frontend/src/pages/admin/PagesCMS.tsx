import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash, Pencil, Type, Image, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';

export default function PagesCMS() {
  const [pages, setPages] = useState<any[]>([]);
  const [editingCMSPage, setEditingCMSPage] = useState<any>(null);
  const [cmsBlocks, setCmsBlocks] = useState<any[]>([]);

  const fetchPages = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/pages`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setPages(await res.json());
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleEditPage = (page: any) => {
    setEditingCMSPage(page);
    try {
      const parsed = JSON.parse(page.content);
      setCmsBlocks(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setCmsBlocks([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCMSContent = async () => {
    const res = await fetch(`${API_BASE_URL}/api/pages/${editingCMSPage.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ ...editingCMSPage, title: editingCMSPage.title, content: JSON.stringify(cmsBlocks), is_published: editingCMSPage.is_published })
    });
    if (res.ok) {
      toast.success('Contenido guardado');
      setEditingCMSPage(null);
      fetchPages();
    }
  };

  const addBlock = (type: string) => {
    const newBlocks = [...cmsBlocks];
    if (type === 'heading') newBlocks.push({ type: 'heading', text: 'Nuevo Encabezado', level: 2 });
    else if (type === 'text') newBlocks.push({ type: 'text', content: 'Escribe aquí tu contenido...' });
    else if (type === 'image') newBlocks.push({ type: 'image', url: '', alt: '' });
    else if (type === 'divider') newBlocks.push({ type: 'divider' });
    setCmsBlocks(newBlocks);
  };

  const updateBlock = (index: number, data: any) => {
    const newBlocks = [...cmsBlocks];
    newBlocks[index] = { ...newBlocks[index], ...data };
    setCmsBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    setCmsBlocks(cmsBlocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === cmsBlocks.length - 1)) return;
    const newBlocks = [...cmsBlocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setCmsBlocks(newBlocks);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '35px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0 }}>Páginas Estáticas (CMS)</h2>
        <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Diseña y publica páginas de información legal y corporativa</p>
      </div>

      <AnimatePresence>
        {editingCMSPage && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '45px' }}>
            <div className="card" style={{ padding: '40px', borderRadius: '40px', border: '3px solid var(--primary-red)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '950' }}>EDITANDO: {editingCMSPage.title}</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <button onClick={handleSaveCMSContent} className="btn-primary" style={{ padding: '10px 25px', borderRadius: '12px' }}>PUBLICAR CAMBIOS</button>
                     <button onClick={() => setEditingCMSPage(null)} className="btn-secondary" style={{ padding: '10px 25px', borderRadius: '12px' }}>CANCELAR</button>
                  </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--gray-bg)', padding: '30px', borderRadius: '25px', border: '1px solid var(--border-color)' }}>
                  {cmsBlocks.map((block, idx) => (
                    <div key={idx} className="card" style={{ padding: '20px', borderRadius: '15px', display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--card-bg)' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <button onClick={() => moveBlock(idx, 'up')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronUp size={16} /></button>
                          <button onClick={() => moveBlock(idx, 'down')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronDown size={16} /></button>
                       </div>
                       
                       <div style={{ flexGrow: 1 }}>
                          {block.type === 'heading' && (
                             <div style={{ display: 'flex', gap: '15px' }}>
                                <select value={block.level} onChange={e => updateBlock(idx, { level: parseInt(e.target.value) })} style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', fontWeight: '900' }}>
                                   <option value={1}>H1</option>
                                   <option value={2}>H2</option>
                                   <option value={3}>H3</option>
                                </select>
                                <input type="text" value={block.text} onChange={e => updateBlock(idx, { text: e.target.value })} style={{ flexGrow: 1, padding: '10px 15px', borderRadius: '10px', border: '1px solid var(--border-color)', fontWeight: '800', fontSize: '18px' }} />
                             </div>
                          )}
                          {block.type === 'text' && (
                             <textarea value={block.content} onChange={e => updateBlock(idx, { content: e.target.value })} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '100px', fontWeight: '500' }} />
                          )}
                          {block.type === 'image' && (
                             <div style={{ display: 'flex', gap: '15px' }}>
                                <input type="text" placeholder="URL de la imagen..." value={block.url} onChange={e => updateBlock(idx, { url: e.target.value })} style={{ flexGrow: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
                                <input type="text" placeholder="Texto alternativo..." value={block.alt} onChange={e => updateBlock(idx, { alt: e.target.value })} style={{ flexGrow: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
                             </div>
                          )}
                          {block.type === 'divider' && <div style={{ height: '2px', background: 'var(--border-color)', width: '100%' }} />}
                       </div>

                       <button onClick={() => removeBlock(idx)} style={{ color: 'var(--primary-red)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash size={18} /></button>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                     <button onClick={() => addBlock('heading')} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><Type size={16} /> ENCABEZADO</button>
                     <button onClick={() => addBlock('text')} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><FileText size={16} /> TEXTO</button>
                     <button onClick={() => addBlock('image')} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><Image size={16} /> IMAGEN</button>
                     <button onClick={() => addBlock('divider')} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><Minus size={16} /> DIVISOR</button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {pages.map(page => (
          <motion.div key={page.id} whileHover={{ scale: 1.03 }} className="card" style={{ padding: '30px', borderRadius: '30px', border: '2px solid var(--border-color)', background: 'var(--card-bg)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ fontWeight: '950', fontSize: '18px' }}>{page.title}</div>
                <div style={{ fontSize: '10px', fontWeight: '950', background: page.is_published ? 'var(--primary-green)' : 'var(--gray-bg)', color: page.is_published ? 'white' : 'var(--secondary-text)', padding: '4px 10px', borderRadius: '8px' }}>{page.is_published ? 'PUBLICADA' : 'BORRADOR'}</div>
             </div>
             <div style={{ fontSize: '13px', color: 'var(--secondary-text)', marginBottom: '25px', fontWeight: '600' }}>/{page.slug}</div>
             <button onClick={() => handleEditPage(page)} className="btn-secondary" style={{ width: '100%', padding: '12px', borderRadius: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Pencil size={18} /> EDITAR CONTENIDO</button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
