import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, LayoutDashboard, Users, Pencil, Plus, Eye, Trash, UserMinus, Book, X, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';

export default function CourseDetails({ selectedCourse, onBack, onManageLesson }: any) {
  const [courseTab, setCourseTab] = useState<'lessons' | 'users'>('lessons');
  const [lessons, setLessons] = useState<any[]>([]);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [newLesson, setNewLesson] = useState<any>({ title: '', title_en: '', description: '', description_en: '', content: '', content_en: '', sort_order: 0, order_index: 0 });
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([]);
  const [selectedUserAnswers, setSelectedUserAnswers] = useState<any[]>([]);

  const fetchLessons = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/courses/${selectedCourse.id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setLessons(data.lessons || []);
  }, [selectedCourse.id]);

  const fetchEnrolledUsers = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/courses/${selectedCourse.id}/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setEnrolledUsers(await res.json());
  }, [selectedCourse.id]);

  const fetchUserAnswers = useCallback(async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/answers?courseId=${selectedCourse.id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setSelectedUserAnswers(await res.json());
  }, [selectedCourse.id]);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons();
      if (courseTab === 'users') fetchEnrolledUsers();
    }
  }, [selectedCourse, courseTab, fetchLessons, fetchEnrolledUsers]);

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingLessonId ? `${API_BASE_URL}/api/courses/lessons/${editingLessonId}` : `${API_BASE_URL}/api/courses/${selectedCourse.id}/lessons`;
    const method = editingLessonId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(newLesson)
    });
    if (res.ok) {
      toast.success(editingLessonId ? 'Lección actualizada' : 'Lección creada');
      setEditingLessonId(null);
      setNewLesson({ title: '', title_en: '', description: '', description_en: '', content: '', content_en: '', sort_order: 0, order_index: 0 });
      fetchLessons();
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!window.confirm('¿Eliminar esta lección?')) return;
    const res = await fetch(`${API_BASE_URL}/api/courses/lessons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) { toast.success('Lección eliminada'); fetchLessons(); }
  };

  const handleExpelUser = async (userId: number) => {
    if (!window.confirm('¿Seguro que quieres expulsar a este usuario del curso? Perderá todo su progreso en él.')) return;
    const res = await fetch(`${API_BASE_URL}/api/admin/courses/${selectedCourse.id}/enrollments/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toast.success('Usuario expulsado');
      fetchEnrolledUsers();
    }
  };

  const handleResetCourseProgress = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres reiniciar TODO el progreso de este curso para el usuario? Esta acción es irreversible.')) return;
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/reset-progress`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({ courseId: selectedCourse.id })
    });
    if (res.ok) {
      toast.success('Progreso del curso reiniciado');
      fetchEnrolledUsers();
    } else {
      toast.error('Error al reiniciar el progreso');
    }
  };

  const handleResetQuestion = async (userId: number, questionId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/questions/${questionId}/reset`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toast.success('Pregunta reiniciada');
      fetchUserAnswers(userId);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div className="card" style={{ padding: '30px 40px', borderRadius: '35px', marginBottom: '35px', border: 'none', background: 'var(--card-bg)', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
             <motion.button 
               whileHover={{ x: -5 }}
               onClick={onBack} 
               style={{ width: '50px', height: '50px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             >
               <ChevronLeft size={24} />
             </motion.button>
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                   <span style={{ fontSize: '10px', fontWeight: '950', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary-red)', padding: '4px 10px', borderRadius: '8px' }}>PANEL DE CONTROL</span>
                   <span style={{ fontSize: '10px', fontWeight: '950', background: 'var(--gray-bg)', color: 'var(--secondary-text)', padding: '4px 10px', borderRadius: '8px' }}>ID: #{selectedCourse.id}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '950', color: 'var(--text-color)' }}>{selectedCourse.title}</h2>
             </div>
          </div>
          
          <div style={{ display: 'flex', background: 'var(--gray-bg)', padding: '6px', borderRadius: '20px', gap: '5px', border: '1px solid var(--border-color)' }}>
             {[
               { id: 'lessons', label: 'LECCIONES', icon: LayoutDashboard },
               { id: 'users', label: 'ALUMNOS', icon: Users }
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setCourseTab(tab.id as any)} 
                 style={{ 
                   padding: '12px 30px', 
                   borderRadius: '16px', 
                   border: 'none', 
                   background: courseTab === tab.id ? 'var(--card-bg)' : 'transparent', 
                   color: courseTab === tab.id ? 'var(--primary-red)' : 'var(--secondary-text)',
                   fontWeight: '900', 
                   fontSize: '13px',
                   cursor: 'pointer', 
                   display: 'flex',
                   alignItems: 'center',
                   gap: '10px',
                   boxShadow: courseTab === tab.id ? '0 8px 15px rgba(0,0,0,0.05)' : 'none',
                   transition: 'all 0.2s'
                 }}
               >
                 <tab.icon size={18} /> {tab.label}
               </button>
             ))}
          </div>
       </div>

       {courseTab === 'lessons' ? (
         <>
            <AnimatePresence>
               {(editingLessonId !== null || newLesson.title !== '' || (lessons || []).length === 0) && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     style={{ overflow: 'hidden' }}
                   >
                     <div className="card" style={{ marginBottom: '45px', padding: '40px', borderRadius: '40px', border: '3px solid var(--primary-red)', background: 'var(--card-bg)', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                           <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '950', color: 'var(--primary-red)', fontSize: '22px' }}>
                              {editingLessonId ? <Pencil size={24} /> : <Plus size={24} />} 
                              {editingLessonId ? 'STUDIO: EDITAR LECCIÓN' : 'STUDIO: NUEVA LECCIÓN'}
                           </h3>
                        </div>
                        
                        <form onSubmit={handleSaveLesson} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                           <div>
                             <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>TÍTULO DE LA LECCIÓN (ES)</label>
                             <input type="text" placeholder="Ej: Velas Japonesas y Patrones" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} style={{ width: '100%', padding: '18px 22px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '800' }} required />
                           </div>
                           <div>
                             <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>LESSON TITLE (EN)</label>
                             <input type="text" placeholder="Ej: Japanese Candlesticks" value={newLesson.title_en} onChange={e => setNewLesson({...newLesson, title_en: e.target.value})} style={{ width: '100%', padding: '18px 22px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '800' }} required />
                           </div>
                           <div style={{ gridColumn: 'span 2' }}>
                             <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>RESUMEN EJECUTIVO / DESCRIPCIÓN (ES)</label>
                             <textarea value={newLesson.description} onChange={e => setNewLesson({...newLesson, description: e.target.value})} style={{ width: '100%', padding: '22px', borderRadius: '25px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '100px', fontSize: '15px', lineHeight: '1.7', fontWeight: '600' }} placeholder="¿De qué trata esta lección? Sé breve y directo." />
                           </div>
                           <div>
                             <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>CONTENIDO COMPLETO (ES)</label>
                             <textarea value={newLesson.content} onChange={e => setNewLesson({...newLesson, content: e.target.value})} style={{ width: '100%', padding: '22px', borderRadius: '25px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '300px', fontSize: '15px', lineHeight: '1.7', fontWeight: '600' }} placeholder="Escribe aquí toda la teoría..." />
                           </div>
                           <div>
                             <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>FULL CONTENT (EN)</label>
                             <textarea value={newLesson.content_en} onChange={e => setNewLesson({...newLesson, content_en: e.target.value})} style={{ width: '100%', padding: '22px', borderRadius: '25px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '300px', fontSize: '15px', lineHeight: '1.7', fontWeight: '600' }} placeholder="Write the theory in English..." />
                           </div>
                           <div style={{ display: 'flex', gap: '15px', gridColumn: 'span 2' }}>
                             <button type="submit" className="btn-primary" style={{ flex: 2, padding: '20px', fontWeight: '950', fontSize: '15px', letterSpacing: '1px', borderRadius: '18px' }}>GUARDAR LECCIÓN</button>
                             <button type="button" onClick={() => { setEditingLessonId(null); setNewLesson({ title: '', title_en: '', description: '', description_en: '', content: '', content_en: '', sort_order: 0, order_index: 0 }); }} className="btn-secondary" style={{ flex: 1, padding: '20px', fontWeight: '900', borderRadius: '18px' }}>DESCARTAR</button>
                           </div>
                        </form>
                     </div>
                   </motion.div>
               )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 10px' }}>
                   <h3 style={{ fontSize: '24px', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <LayoutDashboard size={24} color="var(--primary-red)" /> RUTA DE APRENDIZAJE
                   </h3>
                   <div style={{ fontSize: '14px', fontWeight: '900', background: 'rgba(229, 57, 53, 0.08)', color: 'var(--primary-red)', padding: '8px 20px', borderRadius: '12px', border: '1px solid rgba(229, 57, 53, 0.1)' }}>{lessons.length} LECCIONES TOTALES</div>
                </div>
                
                {lessons.map((lesson, idx) => (
                  <motion.div 
                    key={lesson.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="card" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '25px 40px', 
                      background: 'var(--card-bg)', 
                      borderRadius: '35px', 
                      border: '2px solid var(--border-color)', 
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '35px' }}>
                        <div style={{ 
                          width: '55px', 
                          height: '55px', 
                          borderRadius: '20px', 
                          background: 'linear-gradient(135deg, var(--primary-red), #FF5252)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '20px', 
                          fontWeight: '950', 
                          color: 'white',
                          boxShadow: '0 8px 20px rgba(229, 57, 53, 0.2)'
                        }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontWeight: '950', fontSize: '20px', color: 'var(--text-color)', marginBottom: '4px' }}>{lesson.title}</div>
                          <div style={{ fontSize: '14px', color: 'var(--secondary-text)', maxWidth: '550px', fontWeight: '600', opacity: 0.8 }}>{lesson.description || 'Sin descripción configurada.'}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <motion.button 
                          whileHover={{ scale: 1.05, background: 'var(--primary-red)', color: 'white' }}
                          className="btn-secondary" 
                          style={{ padding: '15px 30px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '950', fontSize: '13px', background: 'rgba(229, 57, 53, 0.05)', color: 'var(--primary-red)', border: 'none' }} 
                          onClick={() => onManageLesson(lesson)}
                        >
                           <Eye size={18} /> GESTIONAR PREGUNTAS
                        </motion.button>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           <button 
                             className="btn-secondary" 
                             style={{ width: '48px', height: '48px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'transparent' }} 
                             onClick={() => { setEditingLessonId(lesson.id); setNewLesson(lesson); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                           >
                              <Pencil size={18} />
                           </button>
                           <button 
                             className="btn-secondary" 
                             style={{ width: '48px', height: '48px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'transparent', color: 'var(--primary-red)' }} 
                             onClick={() => handleDeleteLesson(lesson.id)}
                           >
                              <Trash size={18} />
                           </button>
                        </div>
                    </div>
                  </motion.div>
                ))}
            </div>
         </>
       ) : (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '30px' }}>
               {enrolledUsers.map(user => (
                 <motion.div 
                   key={user.id} 
                   whileHover={{ y: -8 }}
                   className="card" 
                   style={{ padding: '35px', borderRadius: '40px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                 >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                       <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                          <div style={{ width: '60px', height: '60px', borderRadius: '22px', background: 'linear-gradient(135deg, var(--primary-red), #FF5252)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', color: 'white' }}>
                             {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <div style={{ fontWeight: '950', fontSize: '20px', color: 'var(--text-color)' }}>{user.name}</div>
                             <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '700' }}>{user.email}</div>
                          </div>
                       </div>
                       <button className="btn-secondary" style={{ width: '40px', height: '40px', borderRadius: '12px', color: 'var(--primary-red)', border: 'none', background: 'rgba(229, 57, 53, 0.05)' }} onClick={() => handleExpelUser(user.id)}>
                          <UserMinus size={18} />
                       </button>
                    </div>

                    <div style={{ background: 'var(--gray-bg)', padding: '25px', borderRadius: '30px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)', letterSpacing: '1.5px' }}>PROGRESO</span>
                          <span style={{ fontSize: '14px', fontWeight: '950', color: 'var(--primary-red)' }}>{Math.round(((user.completed_lessons || 0) / (user.total_lessons || 1)) * 100)}%</span>
                       </div>
                       <div style={{ height: '14px', background: 'var(--card-bg)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-color)', padding: '2px' }}>
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${((user.completed_lessons || 0) / (user.total_lessons || 1)) * 100}%` }}
                             style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary-red), #FF5252)', borderRadius: '20px' }} 
                          />
                       </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                       <button 
                          className="btn-secondary" 
                          style={{ flex: 2, padding: '15px', borderRadius: '18px', fontWeight: '950', fontSize: '13px', background: 'var(--gray-bg)', border: '2px solid var(--border-color)' }}
                          onClick={() => fetchUserAnswers(user.id)}
                       >
                          HISTORIAL
                       </button>
                       <button 
                          className="btn-secondary" 
                          style={{ flex: 1, padding: '15px', borderRadius: '18px', fontWeight: '950', fontSize: '11px', background: 'rgba(229, 57, 53, 0.05)', color: 'var(--primary-red)', border: '2px solid rgba(229, 57, 53, 0.1)' }}
                          onClick={() => handleResetCourseProgress(user.id)}
                       >
                          REINICIAR
                       </button>
                    </div>
                 </motion.div>
               ))}
            </div>

            {selectedUserAnswers.length > 0 && (
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '45px', borderRadius: '45px', background: 'var(--card-bg)', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '2px solid var(--border-color)', paddingBottom: '25px' }}>
                     <h3 style={{ margin: 0, fontSize: '26px', fontWeight: '950' }}>Auditando: {selectedUserAnswers[0]?.user_name}</h3>
                     <button onClick={() => setSelectedUserAnswers([])} style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                     {selectedUserAnswers.map((ans: any) => (
                       <div key={ans.ua_id} style={{ padding: '25px', background: 'var(--gray-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'relative' }}>
                          <div style={{ position: 'absolute', right: '20px', top: '20px' }}>
                             {ans.is_correct ? <CheckCircle size={24} color="var(--primary-green)" /> : <X size={24} color="var(--primary-red)" />}
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: '950', color: 'var(--secondary-text)', marginBottom: '8px' }}>LECCIÓN: {ans.lesson_title}</div>
                          <div style={{ fontWeight: '900', fontSize: '17px', marginBottom: '12px' }}>{ans.question_text}</div>
                          <div style={{ fontSize: '14px', background: 'var(--card-bg)', padding: '12px 15px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                             <span style={{ color: 'var(--secondary-text)', fontWeight: '700' }}>Respuesta:</span> <span style={{ fontWeight: '800', color: ans.is_correct ? 'var(--primary-green)' : 'var(--primary-red)' }}>{ans.answer_text}</span>
                          </div>
                          <button 
                             className="btn-secondary" 
                             style={{ width: '100%', padding: '12px', fontSize: '12px', fontWeight: '900', color: 'var(--primary-red)', border: '2px solid var(--primary-red)' }} 
                             onClick={() => handleResetQuestion(ans.user_id, ans.question_id)}
                          >
                             BORRAR Y REINICIAR PREGUNTA
                          </button>
                       </div>
                     ))}
                  </div>
               </motion.div>
            )}
         </div>
       )}
    </motion.div>
  );
}
