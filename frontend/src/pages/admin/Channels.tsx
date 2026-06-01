import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, User as UserIcon, Send } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';

export default function Channels() {
  const [channelApps, setChannelApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [appMessages, setAppMessages] = useState<any[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [approveForm, setApproveForm] = useState({ name: '', description: '' });

  const fetchChannelApps = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/community/admin/applications`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setChannelApps(await res.json());
  }, []);

  useEffect(() => {
    fetchChannelApps();
  }, [fetchChannelApps]);

  const handleSelectApp = async (app: any) => {
    setSelectedApp(app);
    const res = await fetch(`${API_BASE_URL}/api/community/application/${app.id}/messages`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setAppMessages(await res.json());
  };

  const sendAppReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    const res = await fetch(`${API_BASE_URL}/api/community/application/${selectedApp.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ message: replyInput })
    });
    if (res.ok) {
      setReplyInput('');
      handleSelectApp(selectedApp);
    }
  };

  const updateAppStatus = async (status: 'approved' | 'rejected') => {
    const res = await fetch(`${API_BASE_URL}/api/community/admin/applications/${selectedApp.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ status, ...approveForm })
    });
    if (res.ok) {
      toast.success('Status updated');
      setSelectedApp(null);
      fetchChannelApps();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0 }}>Gestión de Canales</h2>
          <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Revisa solicitudes de comunidad y aprueba nuevos creadores</p>
       </div>

       <div className="flex-responsive" style={{ display: 'flex', gap: '35px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: '320px' }}>
             <div className="card" style={{ padding: '15px', background: 'var(--card-bg)', border: '2px solid var(--border-color)', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '15px 20px', fontSize: '12px', fontWeight: '950', color: 'var(--secondary-text)', letterSpacing: '1px' }}>SOLICITUDES ENTRANTES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {channelApps.map(app => (
                     <motion.div 
                        key={app.id} 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSelectApp(app)} 
                        style={{ padding: '20px', borderRadius: '22px', cursor: 'pointer', background: selectedApp?.id === app.id ? 'rgba(229, 57, 53, 0.08)' : 'var(--gray-bg)', border: selectedApp?.id === app.id ? '2px solid var(--primary-red)' : '2px solid transparent', transition: 'all 0.2s' }}
                     >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                           <div style={{ fontWeight: '900', fontSize: '16px' }}>{app.user_name}</div>
                           <div style={{ fontSize: '9px', fontWeight: '950', background: app.status === 'approved' ? 'var(--primary-green)' : (app.status === 'rejected' ? 'var(--primary-red)' : '#FF9800'), color: 'white', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>{app.status}</div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text)', fontWeight: '700' }}>{new Date(app.created_at).toLocaleDateString()} • {app.user_email}</div>
                     </motion.div>
                   ))}
                </div>
                {channelApps.length === 0 && <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--secondary-text)', fontSize: '14px', fontWeight: '700' }}>No hay solicitudes pendientes</div>}
             </div>
          </div>

          <div style={{ flex: 2, minWidth: '450px' }}>
             {selectedApp ? (
               <div className="card" style={{ background: 'var(--card-bg)', border: '2px solid var(--border-color)', padding: '40px', borderRadius: '35px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '2px solid var(--gray-bg)', paddingBottom: '20px' }}>
                     <div>
                        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '950' }}>TICKET #{selectedApp.id}</h3>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px', alignItems: 'center' }}>
                           <UserIcon size={14} color="var(--primary-red)" />
                           <span style={{ fontSize: '14px', fontWeight: '800' }}>{selectedApp.user_name}</span>
                        </div>
                     </div>
                     <span style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '700' }}>{new Date(selectedApp.created_at).toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '30px 0', maxHeight: '500px', overflowY: 'auto', background: 'var(--gray-bg)', padding: '30px', borderRadius: '25px', border: '1px solid var(--border-color)' }}>
                     {appMessages.map(m => (
                       <div key={m.id} style={{ alignSelf: m.sender_role === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: m.sender_role === 'admin' ? 'var(--primary-red)' : 'var(--card-bg)', color: m.sender_role === 'admin' ? 'white' : 'var(--text-color)', padding: '18px 25px', borderRadius: '22px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: m.sender_role === 'admin' ? 'none' : '2px solid var(--border-color)' }}>
                          <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '8px', fontWeight: '950', textTransform: 'uppercase' }}>{m.sender_name} {m.sender_role === 'admin' ? '(Staff)' : ''}</div>
                          <div style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: '600' }}>{m.message}</div>
                          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '10px', textAlign: 'right', fontWeight: '800' }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                       </div>
                     ))}
                  </div>

                  <form onSubmit={sendAppReply} style={{ display: 'flex', gap: '15px', marginBottom: '45px' }}>
                     <input type="text" value={replyInput} onChange={e => setReplyInput(e.target.value)} placeholder="Redacta una respuesta oficial..." style={{ flexGrow: 1, padding: '18px 25px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '600' }} />
                     <button type="submit" className="btn-primary" style={{ width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={24} /></button>
                  </form>

                  {selectedApp.status === 'pending' && (
                    <div style={{ borderTop: '3px solid var(--gray-bg)', paddingTop: '35px' }}>
                       <h4 style={{ marginBottom: '25px', fontWeight: '950', color: 'var(--primary-red)', letterSpacing: '1px', fontSize: '14px' }}>PANEL DE APROBACIÓN FINAL</h4>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                             <div>
                                <label style={{ fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)', marginBottom: '10px', display: 'block', textTransform: 'uppercase' }}>NOMBRE PÚBLICO DEL CANAL</label>
                                <input type="text" placeholder="Ej: Análisis de Inversión" value={approveForm.name} onChange={e => setApproveForm({...approveForm, name: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '700' }} />
                             </div>
                             <div>
                                <label style={{ fontSize: '11px', fontWeight: '950', color: 'var(--secondary-text)', marginBottom: '10px', display: 'block', textTransform: 'uppercase' }}>DESCRIPCIÓN COMERCIAL</label>
                                <textarea placeholder="Describe el propósito del canal para los usuarios..." value={approveForm.description} onChange={e => setApproveForm({...approveForm, description: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '100px', fontWeight: '600' }} />
                             </div>
                          </div>
                          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                             <button onClick={() => updateAppStatus('approved')} className="btn-primary" style={{ flex: 1, padding: '18px', fontWeight: '950', letterSpacing: '1px' }}>APROBAR Y CREAR CANAL</button>
                             <button onClick={() => updateAppStatus('rejected')} className="btn-secondary" style={{ flex: 1, padding: '18px', fontWeight: '800', border: '2px solid var(--border-color)', background: 'transparent', color: 'var(--primary-red)' }}>RECHAZAR SOLICITUD</button>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
             ) : (
               <div className="card" style={{ textAlign: 'center', padding: '150px 40px', color: 'var(--secondary-text)', background: 'var(--card-bg)', border: '3px dashed var(--border-color)', borderRadius: '35px' }}>
                  <Megaphone size={64} style={{ opacity: 0.15, marginBottom: '25px' }} />
                  <p style={{ fontSize: '20px', fontWeight: '800' }}>Gestor de Solicitudes</p>
                  <p style={{ fontSize: '15px' }}>Selecciona un ticket de la lista para ver el historial y tomar una decisión.</p>
               </div>
             )}
          </div>
       </div>
    </motion.div>
  );
}
