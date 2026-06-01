import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText, Pencil, Plus, Search, Trash, CheckCircle, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';

export default function LessonDetails({ selectedLesson, onBack, onUpdateLesson }: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState<any>({ text: '', text_en: '', points: 10, difficulty: 'easy', type: 'multiple_choice' });
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [newAnswer, setNewAnswer] = useState<any>({ text: '', text_en: '', is_correct: false });
  const [lessonContent, setLessonContent] = useState({ content: selectedLesson?.content || '', content_en: selectedLesson?.content_en || '' });

  const fetchQuestions = useCallback(async () => {
    if (!selectedLesson) return;
    const res = await fetch(`${API_BASE_URL}/api/courses/lessons/${selectedLesson.id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setQuestions(data.questions || []);
  }, [selectedLesson]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingQuestionId ? `${API_BASE_URL}/api/courses/questions/${editingQuestionId}` : `${API_BASE_URL}/api/courses/lessons/${selectedLesson.id}/questions`;
    const method = editingQuestionId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(newQuestion)
    });
    if (res.ok) {
      toast.success('Pregunta guardada');
      setEditingQuestionId(null);
      setNewQuestion({ text: '', text_en: '', points: 10, difficulty: 'easy', type: 'multiple_choice' });
      fetchQuestions();
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    const res = await fetch(`${API_BASE_URL}/api/courses/questions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toast.success('Pregunta eliminada');
      fetchQuestions();
    }
  };

  const handleSaveAnswer = async (e: React.FormEvent, questionId: number) => {
    e.preventDefault();
    const url = editingAnswerId ? `${API_BASE_URL}/api/courses/answers/${editingAnswerId}` : `${API_BASE_URL}/api/courses/questions/${questionId}/answers`;
    const method = editingAnswerId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(newAnswer)
    });
    if (res.ok) {
      toast.success('Respuesta guardada');
      setEditingAnswerId(null);
      setNewAnswer({ text: '', text_en: '', is_correct: false });
      fetchQuestions();
    }
  };

  const handleDeleteAnswer = async (id: number) => {
    if (!window.confirm('¿Eliminar esta respuesta?')) return;
    const res = await fetch(`${API_BASE_URL}/api/courses/answers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toast.success('Respuesta eliminada');
      fetchQuestions();
    }
  };

  const handleSaveLessonContent = async () => {
    const res = await fetch(`${API_BASE_URL}/api/courses/lessons/${selectedLesson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({
        ...selectedLesson,
        content: lessonContent.content,
        content_en: lessonContent.content_en
      })
    });
    if (res.ok) {
      toast.success('Contenido actualizado');
      onUpdateLesson();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '35px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
             <motion.button 
               whileHover={{ x: -5 }}
               onClick={onBack} 
               style={{ width: '50px', height: '50px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             >
               <ChevronLeft size={24} />
             </motion.button>
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                   <span style={{ fontSize: '10px', fontWeight: '950', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary-red)', padding: '4px 10px', borderRadius: '8px' }}>BANCO DE PREGUNTAS</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '950', color: 'var(--text-color)' }}>Lección: {selectedLesson?.title}</h2>
             </div>
          </div>
       </div>

       <div className="card" style={{ marginBottom: '45px', padding: '40px', borderRadius: '40px', border: 'none', background: 'var(--card-bg)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
             <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={22} color="var(--primary-red)" /> CONTENIDO DE LA LECCIÓN
             </h3>
             <button onClick={handleSaveLessonContent} className="btn-primary" style={{ padding: '10px 25px', borderRadius: '12px', fontSize: '13px' }}>
               GUARDAR TEXTOS
             </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
             <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>TEORÍA DE LA LECCIÓN (ES)</label>
                <textarea 
                  value={lessonContent.content} 
                  onChange={e => setLessonContent({...lessonContent, content: e.target.value})} 
                  style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '200px', fontSize: '15px', lineHeight: '1.6', fontWeight: '600' }} 
                  placeholder="Escribe aquí el contenido teórico..."
                />
             </div>
             <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>LESSON THEORY (EN)</label>
                <textarea 
                  value={lessonContent.content_en} 
                  onChange={e => setLessonContent({...lessonContent, content_en: e.target.value})} 
                  style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '200px', fontSize: '15px', lineHeight: '1.6', fontWeight: '600' }} 
                  placeholder="Write the theory in English..."
                />
             </div>
          </div>
       </div>

       <div className="card" style={{ marginBottom: '45px', padding: '40px', borderRadius: '40px', border: '3px solid var(--primary-red)', background: 'var(--card-bg)', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
          <h3 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '950', color: 'var(--primary-red)', fontSize: '22px' }}>
             {editingQuestionId ? <Pencil size={24} /> : <Plus size={24} />} 
             {editingQuestionId ? 'STUDIO: EDITAR PREGUNTA' : 'STUDIO: NUEVA PREGUNTA'}
          </h3>
          
          <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                   <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>ENUNCIADO DE LA PREGUNTA (ES)</label>
                   <textarea placeholder="Ej: ¿Cuál es el principal beneficio de diversificar una cartera?" value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} style={{ width: '100%', padding: '20px', borderRadius: '22px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '90px', fontSize: '17px', lineHeight: '1.5', fontWeight: '700' }} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                   <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>QUESTION TEXT (EN)</label>
                   <textarea placeholder="Ej: What is the main benefit of diversifying a portfolio?" value={newQuestion.text_en} onChange={e => setNewQuestion({...newQuestion, text_en: e.target.value})} style={{ width: '100%', padding: '20px', borderRadius: '22px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '90px', fontSize: '17px', lineHeight: '1.5', fontWeight: '700' }} required />
                </div>
                
                <div>
                   <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)' }}>MECÁNICA DE RESPUESTA</label>
                   <select value={newQuestion.type} onChange={e => setNewQuestion({...newQuestion, type: e.target.value})} style={{ width: '100%', padding: '18px 22px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800', appearance: 'none' }}>
                      <option value="multiple_choice">Opción Múltiple (Botones)</option>
                      <option value="true_false">Verdadero / Falso</option>
                      <option value="text_input">Entrada de Texto Libre</option>
                   </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)' }}>DIFICULTAD</label>
                      <select value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})} style={{ width: '100%', padding: '18px 22px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800', appearance: 'none' }}>
                         <option value="easy">Principiante (L1)</option>
                         <option value="medium">Intermedio (L2)</option>
                         <option value="hard">Experto (L3)</option>
                      </select>
                   </div>
                   <div>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)' }}>VALOR XP</label>
                      <input type="number" value={newQuestion.points} onChange={e => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})} style={{ width: '100%', padding: '18px 22px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '950', textAlign: 'center', fontSize: '18px' }} />
                   </div>
                </div>
             </div>

             <div style={{ display: 'flex', gap: '15px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '20px', fontSize: '15px', fontWeight: '950', letterSpacing: '1px', borderRadius: '18px' }}>{editingQuestionId ? 'ACTUALIZAR PREGUNTA' : 'AÑADIR AL BANCO'}</button>
                <button type="button" onClick={() => { setEditingQuestionId(null); setNewQuestion({ text: '', text_en: '', points: 10, difficulty: 'easy', type: 'multiple_choice' }); }} className="btn-secondary" style={{ flex: 1, padding: '20px', fontWeight: '900', borderRadius: '18px' }}>DESCARTAR</button>
             </div>
          </form>
       </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {(questions || []).map((q, qIdx) => (
            <motion.div 
              key={q.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIdx * 0.05 }}
              className="card" 
              style={{ padding: '40px', borderRadius: '45px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', gap: '30px' }}>
                     <div style={{ width: '60px', height: '60px', borderRadius: '22px', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', color: 'var(--primary-red)', border: '1px solid var(--border-color)', fontSize: '22px' }}>{qIdx + 1}</div>
                     <div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                           <span style={{ fontSize: '9px', fontWeight: '950', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary-red)', padding: '5px 12px', borderRadius: '10px', textTransform: 'uppercase' }}>{q.difficulty}</span>
                           <span style={{ fontSize: '9px', fontWeight: '950', background: 'var(--gray-bg)', color: 'var(--secondary-text)', padding: '5px 12px', borderRadius: '10px', textTransform: 'uppercase' }}>{q.type.replace('_', ' ')}</span>
                           <span style={{ fontSize: '9px', fontWeight: '950', background: 'var(--primary-green)', color: 'white', padding: '5px 12px', borderRadius: '10px' }}>{q.points} PTS</span>
                        </div>
                        <div style={{ fontWeight: '900', fontSize: '22px', lineHeight: '1.4', color: 'var(--text-color)', maxWidth: '800px' }}>{q.text}</div>
                        <div style={{ color: 'var(--secondary-text)', fontSize: '15px', marginTop: '8px', fontStyle: 'italic', fontWeight: '600', opacity: 0.8 }}>{q.text_en}</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <motion.button 
                       whileHover={{ scale: 1.1 }}
                       className="btn-secondary" 
                       style={{ width: '48px', height: '48px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'transparent' }} 
                       onClick={() => { setEditingQuestionId(q.id); setNewQuestion(q); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                     >
                        <Pencil size={20} />
                     </motion.button>
                     <motion.button 
                       whileHover={{ scale: 1.1 }}
                       className="btn-secondary" 
                       style={{ width: '48px', height: '48px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'transparent', color: 'var(--primary-red)' }} 
                       onClick={() => handleDeleteQuestion(q.id)}
                     >
                        <Trash size={20} />
                     </motion.button>
                  </div>
               </div>

               <div style={{ background: 'var(--gray-bg)', padding: '35px', borderRadius: '35px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                     {(q.answers || []).map((a: any) => (
                       <motion.div 
                         key={a.id} 
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 25px', background: 'var(--card-bg)', borderRadius: '22px', border: a.is_correct ? '3px solid var(--primary-green)' : '2px solid var(--border-color)', boxShadow: a.is_correct ? '0 10px 25px rgba(76, 175, 80, 0.15)' : 'none' }}
                       >
                          <div>
                             <div style={{ fontWeight: '900', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-color)' }}>
                                {a.text} {a.is_correct && <CheckCircle size={20} color="var(--primary-green)" fill="rgba(76,175,80,0.1)" />}
                             </div>
                             <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '600', marginTop: '4px' }}>{a.text_en}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                             <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)', padding: '10px' }} onClick={() => { setEditingAnswerId(a.id); setNewAnswer(a); }}><Pencil size={16} /></button>
                             <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-red)', padding: '10px' }} onClick={() => handleDeleteAnswer(a.id)}><Trash size={16} /></button>
                          </div>
                       </motion.div>
                     ))}
                     
                     <div style={{ gridColumn: 'span 2', marginTop: '15px', background: 'rgba(0,0,0,0.02)', padding: '30px', borderRadius: '30px', border: '2px dashed var(--border-color)' }}>
                        <form onSubmit={(e) => handleSaveAnswer(e, q.id)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '15px', alignItems: 'center' }}>
                           <input type="text" placeholder="Texto en Español..." value={newAnswer.text} onChange={e => setNewAnswer({...newAnswer, text: e.target.value})} style={{ padding: '15px 20px', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '700' }} required />
                           <input type="text" placeholder="English text..." value={newAnswer.text_en} onChange={e => setNewAnswer({...newAnswer, text_en: e.target.value})} style={{ padding: '15px 20px', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '700' }} required />
                           <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '950', cursor: 'pointer', background: 'var(--card-bg)', padding: '12px 20px', borderRadius: '15px', border: '2px solid var(--border-color)' }}>
                              <input type="checkbox" checked={newAnswer.is_correct} onChange={e => setNewAnswer({...newAnswer, is_correct: e.target.checked})} style={{ width: '22px', height: '22px', accentColor: 'var(--primary-green)' }} /> ES CORRECTA
                           </label>
                           <motion.button 
                             whileHover={{ scale: 1.05 }}
                             type="submit" 
                             className="btn-primary" 
                             style={{ width: '60px', height: '52px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                           >
                              <Plus size={24} />
                           </motion.button>
                        </form>
                        {editingAnswerId && <button onClick={() => { setEditingAnswerId(null); setNewAnswer({ text: '', text_en: '', is_correct: false }); }} style={{ marginTop: '20px', display: 'block', margin: '20px auto 0', background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: '950', fontSize: '11px', cursor: 'pointer', letterSpacing: '1px' }}>CANCELAR EDICIÓN</button>}
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
       </div>
    </motion.div>
  );
}
