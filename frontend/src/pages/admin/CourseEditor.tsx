import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Plus, Info, FileText, Coins, Settings, Eye, Trophy } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { CourseIcon, IconPicker } from './Common';
import toast from 'react-hot-toast';

export default function CourseEditor({ editingCourseId, selectedCourse, categories, onSave, onCancel }: any) {
  const [formTab, setFormTab] = useState<'general' | 'content' | 'pricing' | 'settings'>('general');
  const [newCourse, setNewCourse] = useState<any>({ 
    title: '', title_en: '', 
    description: '', description_en: '', 
    points_reward: 100, points_price: 0, 
    category_id: 1, category: 'General', category_en: 'General',
    difficulty: 'beginner', visibility: 'public', access_level: 'free',
    icon: 'Book', imageFile: null, order_index: 0
  });

  const [categoriesList, setCategories] = useState<any[]>(categories || []);

  useEffect(() => {
    if (editingCourseId && selectedCourse) {
      setNewCourse({ ...selectedCourse, imageFile: null });
    }
    if (!categories || categories.length === 0) {
      fetch(`${API_BASE_URL}/api/settings/categories`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        .then(res => res.json())
        .then(data => setCategories(data));
    }
  }, [editingCourseId, selectedCourse, categories]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    Object.entries(newCourse).forEach(([key, value]) => {
      if (key === 'imageFile' && value) {
        formData.append('image', value as any);
      } else if (value !== null) {
        formData.append(key, value as string);
      }
    });

    const url = editingCourseId ? `${API_BASE_URL}/api/courses/${editingCourseId}` : `${API_BASE_URL}/api/courses`;
    const method = editingCourseId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });

    if (res.ok) {
      toast.success(editingCourseId ? 'Curso actualizado' : 'Curso creado');
      onSave();
    } else {
      toast.error('Error al guardar el curso');
    }
  };

  return (
    <div className="card" style={{ marginBottom: '45px', padding: 0, borderRadius: '40px', border: 'none', background: 'var(--card-bg)', boxShadow: '0 30px 70px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)' }}>
        <div 
          style={{ flex: 1, padding: '25px 40px', borderRight: '2px solid var(--border-color)', background: 'linear-gradient(135deg, var(--primary-red), #FF5252)', color: 'white' }}
        >
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '15px' }}>
            {editingCourseId ? <Pencil size={28} /> : <Plus size={28} />} 
            {editingCourseId ? 'STUDIO: EDITAR CURSO' : 'STUDIO: NUEVO CURSO'}
          </h3>
          <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '14px', fontWeight: '600' }}>Configura los detalles, precios y visibilidad global</p>
        </div>
        <div style={{ display: 'flex', padding: '0 20px', alignItems: 'stretch' }}>
          {[
            { id: 'general', label: 'GENERAL', icon: Info },
            { id: 'content', label: 'CONTENIDO', icon: FileText },
            { id: 'pricing', label: 'PRECIOS', icon: Coins },
            { id: 'settings', label: 'AJUSTES', icon: Settings }
          ].map(tab => (
            <button 
              key={tab.id}
              type="button"
              onClick={() => setFormTab(tab.id as any)}
              style={{
                padding: '0 25px',
                border: 'none',
                background: 'transparent',
                color: formTab === tab.id ? 'var(--primary-red)' : 'var(--secondary-text)',
                fontWeight: '900',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: formTab === tab.id ? '4px solid var(--primary-red)' : '4px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: '550px' }}>
         <div style={{ flex: 2, padding: '40px', borderRight: '2px solid var(--border-color)' }}>
            <form onSubmit={handleSave} id="course-form">
              <AnimatePresence mode="wait">
                {formTab === 'general' && (
                  <motion.div key="general" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>TÍTULO DEL CURSO (ES)</label>
                          <input type="text" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} style={{ width: '100%', padding: '16px 20px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '800' }} required placeholder="Ej: Fundamentos de Inversión" />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>COURSE TITLE (EN)</label>
                          <input type="text" value={newCourse.title_en} onChange={e => setNewCourse({...newCourse, title_en: e.target.value})} style={{ width: '100%', padding: '16px 20px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '800' }} required placeholder="Ej: Investment Foundations" />
                        </div>
                     </div>
                     <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>SELECCIONAR ICONO</label>
                        <IconPicker selected={newCourse.icon} onSelect={(icon) => setNewCourse({...newCourse, icon})} />
                     </div>
                     <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)' }}>CATEGORÍA PRINCIPAL</label>
                        <select 
                          value={newCourse.category_id} 
                          onChange={e => {
                            const cat = categoriesList.find((c: any) => c.id === parseInt(e.target.value));
                            setNewCourse({...newCourse, category_id: cat?.id || 1, category: cat?.name || 'General', category_en: cat?.name_en || 'General' });
                          }} 
                          style={{ width: '100%', padding: '16px 20px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800', appearance: 'none' }}
                        >
                          {categoriesList.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                     </div>
                  </motion.div>
                )}

                {formTab === 'content' && (
                  <motion.div key="content" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                     <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>DESCRIPCIÓN COMPLETA (ES)</label>
                        <textarea value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '150px', fontSize: '15px', lineHeight: '1.6', fontWeight: '600' }} required placeholder="Explica detalladamente qué aprenderán los alumnos..." />
                     </div>
                     <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>FULL DESCRIPTION (EN)</label>
                        <textarea value={newCourse.description_en} onChange={e => setNewCourse({...newCourse, description_en: e.target.value})} style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '150px', fontSize: '15px', lineHeight: '1.6', fontWeight: '600' }} required placeholder="Provide a detailed English description..." />
                     </div>
                  </motion.div>
                )}

                {formTab === 'pricing' && (
                  <motion.div key="pricing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        <div style={{ background: 'var(--gray-bg)', padding: '25px', borderRadius: '25px', border: '2px solid var(--border-color)' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontWeight: '950', fontSize: '13px' }}>
                              <Coins size={18} color="#FFC107" /> PRECIO DE ACCESO (TRS)
                           </label>
                           <input type="number" value={newCourse.points_price} onChange={e => setNewCourse({...newCourse, points_price: parseInt(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--card-bg)', color: 'var(--text-color)', fontSize: '24px', fontWeight: '900', textAlign: 'center' }} />
                        </div>
                        <div style={{ background: 'var(--gray-bg)', padding: '25px', borderRadius: '25px', border: '2px solid var(--border-color)' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontWeight: '950', fontSize: '13px' }}>
                              <Trophy size={18} color="var(--primary-green)" /> RECOMPENSA (XP)
                           </label>
                           <input type="number" value={newCourse.points_reward} onChange={e => setNewCourse({...newCourse, points_reward: parseInt(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--card-bg)', color: 'var(--text-color)', fontSize: '24px', fontWeight: '900', textAlign: 'center' }} />
                        </div>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        <div>
                           <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)' }}>DIFICULTAD ESTIMADA</label>
                           <select value={newCourse.difficulty} onChange={e => setNewCourse({...newCourse, difficulty: e.target.value})} style={{ width: '100%', padding: '16px 20px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800' }}>
                             <option value="beginner">Principiante (L1)</option>
                             <option value="intermediate">Intermedio (L2)</option>
                             <option value="advanced">Avanzado (L3)</option>
                           </select>
                        </div>
                        <div>
                           <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)' }}>NIVEL DE ACCESO</label>
                           <select value={newCourse.access_level} onChange={e => setNewCourse({...newCourse, access_level: e.target.value})} style={{ width: '100%', padding: '16px 20px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800' }}>
                             <option value="free">Gratis (Todos los usuarios)</option>
                             <option value="premium">Premium (Solo Suscriptores / VST)</option>
                           </select>
                        </div>
                     </div>
                  </motion.div>
                )}

                {formTab === 'settings' && (
                  <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                     <div style={{ background: 'var(--gray-bg)', padding: '30px', borderRadius: '30px', border: '2px solid var(--border-color)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '950', fontSize: '16px', marginBottom: '15px' }}>
                           <Eye size={20} color="var(--primary-red)" /> VISIBILIDAD GLOBAL
                        </label>
                        <div style={{ display: 'flex', gap: '15px' }}>
                           {[
                              { id: 'public', label: 'PÚBLICO', desc: 'Visible para todos los usuarios en el catálogo principal.' },
                              { id: 'private', label: 'PRIVADO', desc: 'Oculto para usuarios. Solo accesible desde el panel Admin.' }
                           ].map(opt => (
                              <button
                                 key={opt.id}
                                 type="button"
                                 onClick={() => setNewCourse({...newCourse, visibility: opt.id})}
                                 style={{
                                    flex: 1,
                                    padding: '20px',
                                    borderRadius: '20px',
                                    border: newCourse.visibility === opt.id ? '2.5px solid var(--primary-red)' : '2.5px solid transparent',
                                    background: newCourse.visibility === opt.id ? 'var(--card-bg)' : 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                 }}
                              >
                                 <div style={{ fontWeight: '950', fontSize: '14px', color: newCourse.visibility === opt.id ? 'var(--primary-red)' : 'var(--text-color)', marginBottom: '5px' }}>{opt.label}</div>
                                 <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: '600', lineHeight: '1.4' }}>{opt.desc}</div>
                              </button>
                           ))}
                        </div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        <div>
                           <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)' }}>ORDEN DE APARICIÓN</label>
                           <input type="number" value={newCourse.order_index} onChange={e => setNewCourse({...newCourse, order_index: parseInt(e.target.value)})} style={{ width: '100%', padding: '16px 20px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '800' }} />
                        </div>
                        <div>
                           <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)' }}>IMAGEN DE PORTADA</label>
                           <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--gray-bg)', padding: '20px', borderRadius: '20px', border: '2px dashed var(--border-color)' }}>
                              <input type="file" accept="image/*" onChange={e => setNewCourse({...newCourse, imageFile: e.target.files?.[0] || null})} style={{ flex: 1, fontSize: '12px' }} />
                              {editingCourseId && !newCourse.imageFile && selectedCourse?.image_url && (
                                 <img src={`${API_BASE_URL}${selectedCourse.image_url}`} style={{ height: '40px', borderRadius: '8px' }} alt="Current" />
                              )}
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
         </div>

         <div style={{ flex: 1, padding: '40px', background: 'var(--gray-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ marginBottom: '20px', fontSize: '12px', fontWeight: '950', color: 'var(--secondary-text)', letterSpacing: '2px', textTransform: 'uppercase' }}>VISTA PREVIA EN VIVO</div>
            
            <motion.div 
              style={{ 
                width: '320px', 
                padding: '30px', 
                borderRadius: '32px', 
                background: 'var(--card-bg)', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '2px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ width: '60px', height: '55px', borderRadius: '16px', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)', border: '1px solid var(--border-color)' }}>
                    <CourseIcon name={newCourse.icon} size={32} />
                 </div>
              </div>
              <div>
                 <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '950', background: 'rgba(229, 57, 53, 0.12)', color: 'var(--primary-red)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>{newCourse.difficulty}</span>
                    <span style={{ fontSize: '9px', fontWeight: '950', background: 'var(--gray-bg)', color: 'var(--secondary-text)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>{newCourse.category || 'General'}</span>
                 </div>
                 <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', lineHeight: '1.2' }}>{newCourse.title || 'Título del Curso'}</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--secondary-text)', lineHeight: '1.5', margin: 0, height: '40px', overflow: 'hidden' }}>
                {newCourse.description || 'Aquí aparecerá la descripción de tu curso cuando empieces a escribir...'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--gray-bg)', paddingTop: '15px' }}>
                 <div style={{ fontSize: '12px', fontWeight: '800', color: newCourse.points_price > 0 ? '#FFC107' : 'var(--primary-green)' }}>
                    {newCourse.points_price > 0 ? `${newCourse.points_price} TRS` : 'GRATIS'}
                 </div>
                 <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.5 }}>0 LECCIONES</div>
              </div>
            </motion.div>

            <div style={{ marginTop: '40px', width: '100%', display: 'flex', gap: '15px' }}>
              <button type="submit" form="course-form" className="btn-primary" style={{ flex: 2, padding: '18px', fontSize: '15px', letterSpacing: '1px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(229, 57, 53, 0.2)' }}>
                {editingCourseId ? 'ACTUALIZAR' : 'PUBLICAR'}
              </button>
              <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: '18px', fontWeight: '800', borderRadius: '20px' }}>
                CANCELAR
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}
