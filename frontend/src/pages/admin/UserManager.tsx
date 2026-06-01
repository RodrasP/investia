import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User as UserIcon, Shield, Sparkles, Heart, Trophy, X, CheckCircle, Search, Trash, Pencil } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import BullCoinIcon from '../../components/BullCoin';
import VestiaBill from '../../components/VestiaBill';
import toast from 'react-hot-toast';

const UserEditorModal = ({ user, onClose, onUpdate }: any) => {
  const [editForm, setEditForm] = useState({
    points: user?.points || 0,
    lives: user?.lives || 5,
    vestias: user?.vestias || 0,
    subscription_status: user?.subscription_status || 'free',
    premium_months: 1,
    role: user?.role || 'user'
  });

  const handleUpdate = async () => {
    const resStats = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/stats`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({
        points: parseInt(editForm.points as any),
        lives: parseInt(editForm.lives as any),
        vestias: parseFloat(editForm.vestias as any),
        subscription_status: editForm.subscription_status,
        premium_months: editForm.premium_months
      })
    });

    if (editForm.role !== user.role) {
      await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ role: editForm.role })
      });
    }

    if (resStats.ok) {
      toast.success('Usuario actualizado con éxito');
      onUpdate();
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '100%', maxWidth: '550px', padding: '45px', borderRadius: '45px', background: 'var(--card-bg)', boxShadow: '0 40px 100px rgba(0,0,0,0.3)', border: '2px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
           <div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '950' }}>Editor Maestro: {user?.name}</h3>
              <p style={{ margin: '5px 0 0', color: 'var(--secondary-text)', fontSize: '13px', fontWeight: '700' }}>Control total sobre el balance y privilegios</p>
           </div>
           <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '35px' }}>
           <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)' }}><BullCoinIcon size={14} /> TOROS (PUNTOS)</label>
              <input type="number" value={editForm.points} onChange={e => setEditForm({...editForm, points: parseInt(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '900', fontSize: '18px' }} />
           </div>
           <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)' }}><VestiaBill size={14} /> VESTIAS (PREMIUM)</label>
              <input type="number" step="0.1" value={editForm.vestias} onChange={e => setEditForm({...editForm, vestias: parseFloat(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '900', fontSize: '18px' }} />
           </div>
           <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)' }}><Heart size={14} color="var(--primary-red)" /> VIDAS</label>
              <input type="number" max="5" value={editForm.lives} onChange={e => setEditForm({...editForm, lives: parseInt(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '900', fontSize: '18px' }} />
           </div>
           <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '950', fontSize: '11px', color: 'var(--secondary-text)' }}><Shield size={14} color="var(--primary-red)" /> ROL DE USUARIO</label>
              <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '900' }}>
                 <option value="user">ESTUDIANTE (USER)</option>
                 <option value="admin">ADMINISTRADOR (ADMIN)</option>
              </select>
           </div>
        </div>

        <div style={{ background: 'rgba(229, 57, 53, 0.03)', padding: '30px', borderRadius: '30px', border: '2px dashed var(--border-color)', marginBottom: '35px' }}>
           <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '950', color: 'var(--primary-red)', letterSpacing: '1px' }}>SUSCRIPCIÓN PREMIUM</h4>
           <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
              <div>
                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '950', fontSize: '10px', color: 'var(--secondary-text)' }}>ESTADO</label>
                 <select value={editForm.subscription_status} onChange={e => setEditForm({...editForm, subscription_status: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '800' }}>
                    <option value="free">GRATUITA (BÁSICO)</option>
                    <option value="premium">PREMIUM (SUSCRIPTOR)</option>
                 </select>
              </div>
              {editForm.subscription_status === 'premium' && (
                <div>
                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: '950', fontSize: '10px', color: 'var(--secondary-text)' }}>MESES A AÑADIR</label>
                   <input type="number" value={editForm.premium_months} onChange={e => setEditForm({...editForm, premium_months: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '900', textAlign: 'center' }} />
                </div>
              )}
           </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
           <button onClick={handleUpdate} className="btn-primary" style={{ flex: 2, padding: '20px', borderRadius: '18px', fontWeight: '950', fontSize: '15px', letterSpacing: '1px' }}>GUARDAR CAMBIOS MAESTROS</button>
           <button onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '20px', borderRadius: '18px', fontWeight: '900' }}>CANCELAR</button>
        </div>
      </motion.div>
    </div>
  );
};

const UserHistoryModal = ({ globalHistory, onClose }: any) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '40px' }}>
     <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ width: '100%', maxWidth: '1000px', height: '90vh', padding: '50px', borderRadius: '50px', background: 'var(--card-bg)', boxShadow: '0 50px 120px rgba(0,0,0,0.4)', border: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
           <div>
              <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '950' }}>Auditoría de Desempeño</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--secondary-text)', fontSize: '16px', fontWeight: '600' }}>Historial completo de respuestas y actividad educativa</p>
           </div>
           <button onClick={onClose} style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px', alignContent: 'start' }}>
           {globalHistory.length > 0 ? globalHistory.map((ans: any, idx: number) => (
             <div key={ans.ua_id || idx} style={{ padding: '30px', background: 'var(--gray-bg)', borderRadius: '35px', border: '1px solid var(--border-color)', position: 'relative' }}>
                <div style={{ position: 'absolute', right: '25px', top: '25px' }}>
                   {ans.is_correct ? <CheckCircle size={32} color="var(--primary-green)" fill="rgba(76,175,80,0.1)" /> : <X size={32} color="var(--primary-red)" strokeWidth={3} />}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                   <span style={{ fontSize: '10px', fontWeight: '950', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary-red)', padding: '5px 12px', borderRadius: '10px' }}>{ans.course_title}</span>
                   <span style={{ fontSize: '10px', fontWeight: '950', background: 'var(--border-color)', color: 'var(--secondary-text)', padding: '5px 12px', borderRadius: '10px' }}>{ans.lesson_title}</span>
                </div>
                <div style={{ fontWeight: '900', fontSize: '18px', marginBottom: '20px', lineHeight: '1.4', paddingRight: '40px' }}>{ans.question_text}</div>

                <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '22px', border: '1px solid var(--border-color)' }}>
                   <div style={{ fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)', marginBottom: '8px', letterSpacing: '1px' }}>RESPUESTA ENTREGADA:</div>
                   <div style={{ fontWeight: '800', fontSize: '15px', color: ans.is_correct ? 'var(--primary-green)' : 'var(--primary-red)' }}>{ans.answer_text || '(Sin texto)'}</div>
                   <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--secondary-text)', opacity: 0.6 }}>{new Date(ans.answered_at).toLocaleString()}</div>
                </div>
             </div>
           )) : (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                <Search size={64} style={{ opacity: 0.1, marginBottom: '25px' }} />
                <p style={{ fontSize: '20px', fontWeight: '950', color: 'var(--secondary-text)' }}>No se ha registrado actividad aún.</p>
             </div>
           )}
        </div>
     </motion.div>
  </div>
);

export default function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [globalHistory, setGlobalHistory] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setUsers(await res.json());
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchGlobalUserAnswers = async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/answers`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      setGlobalHistory(await res.json());
      setShowHistoryModal(true);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <AnimatePresence>
          {userToEdit && (
            <UserEditorModal 
              user={userToEdit} 
              onClose={() => setUserToEdit(null)} 
              onUpdate={fetchUsers} 
            />
          )}
          {showHistoryModal && (
            <UserHistoryModal 
              globalHistory={globalHistory} 
              onClose={() => setShowHistoryModal(false)} 
            />
          )}
       </AnimatePresence>
       
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
             <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0 }}>Comunidad de Inversores</h2>
             <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px', fontWeight: '600' }}>Monitorea el desempeño y gestiona privilegios globales</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o email..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '300px', padding: '12px 12px 12px 45px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '600' }}
              />
            </div>
            <div className="card" style={{ padding: '12px 25px', borderRadius: '18px', background: 'var(--gray-bg)', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-color)' }}>
               <Users size={22} color="var(--primary-red)" />
               <span style={{ fontSize: '16px' }}>{filteredUsers.length} MIEMBROS</span>
            </div>
          </div>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '30px' }}>
          {filteredUsers.map(user => (
            <motion.div 
              key={user.id} 
              whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
              className="card" 
              style={{ 
                padding: '35px', 
                borderRadius: '45px', 
                border: '2px solid var(--border-color)', 
                background: 'var(--card-bg)', 
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
               <div style={{ 
                 position: 'absolute', 
                 top: '20px', 
                 right: '-35px', 
                 width: '140px', 
                 background: user.role === 'admin' ? 'var(--primary-red)' : 'var(--gray-bg)',
                 color: user.role === 'admin' ? 'white' : 'var(--secondary-text)',
                 textAlign: 'center',
                 padding: '5px 0',
                 transform: 'rotate(45deg)',
                 fontSize: '10px',
                 fontWeight: '950',
                 boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                 letterSpacing: '1px'
               }}>
                 {user.role.toUpperCase()}
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                     <div style={{ 
                       width: '65px', 
                       height: '65px', 
                       borderRadius: '24px', 
                       background: 'var(--gray-bg)', 
                       display: 'flex', 
                       alignItems: 'center', 
                       justifyContent: 'center', 
                       fontWeight: '950', 
                       color: 'var(--secondary-text)', 
                       overflow: 'hidden', 
                       border: '2px solid var(--border-color)',
                       boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
                     }}>
                        {user.avatar_url ? <img src={`${API_BASE_URL}${user.avatar_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" /> : <UserIcon size={30} />}
                     </div>
                     <div>
                        <div style={{ fontWeight: '950', fontSize: '21px', color: 'var(--text-color)' }}>{user.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '700', opacity: 0.8 }}>{user.email}</div>
                     </div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                  {user.subscription_status === 'premium' && (
                     <div style={{ background: 'linear-gradient(45deg, #FFD700, #FFA500)', color: 'rgba(0,0,0,0.8)', padding: '8px 15px', borderRadius: '12px', fontSize: '11px', fontWeight: '950', boxShadow: '0 5px 15px rgba(255, 165, 0, 0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} /> MIEMBRO PREMIUM
                     </div>
                  )}
               </div>

               <div style={{ background: 'var(--gray-bg)', padding: '25px', borderRadius: '30px', marginBottom: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', border: '1px solid var(--border-color)' }}>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '10px', fontWeight: '950', color: 'var(--secondary-text)', marginBottom: '5px', letterSpacing: '1px' }}>TOROS</div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#FF9800', fontWeight: '950', fontSize: '16px' }}>
                        <BullCoinIcon size={18} /> {user.points}
                     </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '10px', fontWeight: '950', color: 'var(--secondary-text)', marginBottom: '5px', letterSpacing: '1px' }}>VESTIAS</div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--primary-green)', fontWeight: '950', fontSize: '16px' }}>
                        <VestiaBill size={18} /> {(user.vestias || 0).toFixed(1)}
                     </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '10px', fontWeight: '950', color: 'var(--secondary-text)', marginBottom: '5px', letterSpacing: '1px' }}>VIDAS</div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--primary-red)', fontWeight: '950', fontSize: '16px' }}>
                        <Heart size={18} fill="var(--primary-red)" /> {user.lives}
                     </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '10px', fontWeight: '950', color: 'var(--secondary-text)', marginBottom: '5px', letterSpacing: '1px' }}>NIVEL</div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--primary-green)', fontWeight: '950', fontSize: '16px' }}>
                        <Trophy size={18} /> {user.level || 1}
                     </div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '10px' }}>
                  <motion.button 
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     className="btn-secondary" 
                     style={{ flex: 1, padding: '15px', borderRadius: '18px', fontWeight: '950', fontSize: '12px', background: 'transparent', border: '2.5px solid var(--border-color)', cursor: 'pointer' }}
                     onClick={() => fetchGlobalUserAnswers(user.id)}
                  >
                     HISTORIAL
                  </motion.button>
                  <motion.button 
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     className="btn-primary" 
                     style={{ flex: 1, padding: '15px', borderRadius: '18px', fontWeight: '950', fontSize: '12px', cursor: 'pointer' }}
                     onClick={() => setUserToEdit(user)}
                  >
                     EDITAR STATS
                  </motion.button>
               </div>
            </motion.div>
          ))}
       </div>
    </motion.div>
  );
}
