import React, { useState, useEffect } from 'react';
import { User as UserIcon, Camera, LogOut, Settings, Moon, Sun, Shield, CreditCard, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import BullCoin from '../components/BullCoin';
import VestiaBill from '../components/VestiaBill';
import VestiaIcon from '../components/VestiaIcon';

interface ProfileProps {
  user: any;
  setUser: (user: any) => void;
  onLogout: () => void;
  language: string;
  t: any;
  toggleTheme: () => void;
}

function StatCard({ icon, value, label }: { icon: any, value: any, label: string }) {
  return (
    <div style={{ background: 'var(--gray-bg)', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
      <div style={{ marginBottom: '5px' }}>{icon}</div>
      <h4 style={{ margin: 0, fontSize: '24px', color: 'var(--text-color)' }}>{value}</h4>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '900', color: 'var(--secondary-text)', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

function SettingsOption({ icon, title, desc, btnText, onClick }: { icon: any, title: string, desc: string, btnText: string, onClick?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--gray-bg)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ background: 'var(--card-bg)', padding: '10px', borderRadius: '12px', color: 'var(--primary-red)' }}>{icon}</div>
        <div>
          <h4 style={{ margin: 0, color: 'var(--text-color)' }}>{title}</h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--secondary-text)' }}>{desc}</p>
        </div>
      </div>
      <button className="btn-secondary" onClick={onClick} style={{ padding: '8px 20px', textTransform: 'none', fontSize: '14px' }}>{btnText}</button>
    </div>
  );
}

function ProfileField({ icon, label, value, isEditing, isTextArea, onChange, placeholder }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-text)', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>
        {icon} {label}
      </div>
      {isEditing ? (
        isTextArea ? (
          <textarea 
            className="btn-secondary"
            style={{ width: '100%', minHeight: '100px', textAlign: 'left', textTransform: 'none', background: 'var(--gray-bg)', color: 'var(--text-color)', padding: '12px 20px', resize: 'vertical' }}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <input 
            type="text"
            className="btn-secondary"
            style={{ width: '100%', textAlign: 'left', textTransform: 'none', background: 'var(--gray-bg)', color: 'var(--text-color)', padding: '12px 20px' }}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        )
      ) : (
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', color: value ? 'var(--text-color)' : 'var(--secondary-text)', fontWeight: '600' }}>
          {value || 'No especificado'}
        </div>
      )}
    </div>
  );
}

const Profile: React.FC<ProfileProps> = ({ user, setUser, onLogout, language, t, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'subscription' | 'finance' | 'security'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (user) {
      setFormData(user);
      if (user.avatar_url) {
        setAvatarPreview(`${API_BASE_URL}${user.avatar_url}`);
      }
    }
  }, [user]);

  const langObj = t?.[language] || t?.['es'] || {};

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--primary-red)', fontWeight: 'bold' }}>
        Cargando perfil...
      </div>
    );
  }

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error(language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/password`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error');
    }
  };

  useEffect(() => {
    if (activeTab === 'subscription' || activeTab === 'finance') {
      fetchBillingInfo();
    }
  }, [activeTab]);

  const fetchBillingInfo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/billing`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setBillingInfo(data.card);
      }
    } catch (err) {}
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/create-setup-session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Error creando sesión');
      }
    } catch (err) {
      toast.error('Error');
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          location: formData.location,
          telegram_user: formData.telegram_user
        })
      });

      if (file) {
        const avatarData = new FormData();
        avatarData.append('avatar', file);
        await fetch(`${API_BASE_URL}/api/auth/profile/avatar`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: avatarData
        });
      }

      if (res.ok) {
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        toast.success(language === 'es' ? 'Perfil actualizado' : 'Profile updated');
        setUser(profileData);
        localStorage.setItem('user', JSON.stringify(profileData));
        setIsEditing(false);
      }
    } catch (err) {
      toast.error('Error actualizando perfil');
    }
  };

  const toggleAutoRenew = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/subscription/auto-renew`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ autoRenew: !user.auto_renew })
      });
      if (res.ok) {
        const updatedUser = { ...user, auto_renew: !user.auto_renew ? 1 : 0 };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success(language === 'es' ? 'Preferencia actualizada' : 'Preference updated');
      }
    } catch (err) {}
  };

  const tabs = [
    { id: 'personal', label: language === 'es' ? 'Datos Personales' : 'Personal Data', icon: <UserIcon size={18} /> },
    { id: 'subscription', label: language === 'es' ? 'Suscripción' : 'Subscription', icon: null },
    { id: 'finance', label: language === 'es' ? 'Finanzas' : 'Finance', icon: <CreditCard size={18} /> },
    { id: 'security', label: language === 'es' ? 'Seguridad' : 'Security', icon: <Lock size={18} /> }
  ];

  return (
    <div className="container" style={{ marginTop: '40px', paddingBottom: '100px' }}>
      <div className="flex-responsive" style={{ gap: '40px', alignItems: 'flex-start' }}>
        
        {/* Left Side */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '32px', border: '2px solid var(--border-color)', textAlign: 'center', marginBottom: '20px' }}
          >
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 25px' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '32px', overflow: 'hidden', background: 'var(--gray-bg)', border: '4px solid var(--primary-red)' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-text)' }}><UserIcon size={50} /></div>
                )}
              </div>
              <label style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--primary-red)', color: 'white', width: '35px', height: '35px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={18} />
                <input type="file" hidden onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setAvatarPreview(URL.createObjectURL(f));
                  }
                }} />
              </label>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-color)', marginBottom: '5px' }}>{user.name}</h2>
            <p style={{ color: 'var(--secondary-text)', fontSize: '14px', marginBottom: '25px' }}>{user.email}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    borderRadius: '16px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--primary-red)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-color)',
                    fontWeight: '800',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
              <button 
                onClick={onLogout} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 20px', 
                  borderRadius: '16px', 
                  border: 'none', 
                  background: 'rgba(229, 57, 53, 0.1)', 
                  color: 'var(--primary-red)', 
                  fontWeight: '800', 
                  cursor: 'pointer' 
                }}
              >
                <LogOut size={18} />
                {language === 'es' ? 'Cerrar Sesión' : 'Logout'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Side */}
        <div style={{ flex: '2', minWidth: '350px' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '32px', border: '2px solid var(--border-color)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{language === 'es' ? 'Datos Personales' : 'Personal Data'}</h3>
                  <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>
                    {isEditing ? (language === 'es' ? 'GUARDAR' : 'SAVE') : (language === 'es' ? 'EDITAR' : 'EDIT')}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <ProfileField icon={<UserIcon size={18} />} label={language === 'es' ? 'Nombre' : 'Name'} value={formData.name} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, name: v})} />
                  <ProfileField icon={null} label={language === 'es' ? 'Teléfono' : 'Phone'} value={formData.phone} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, phone: v})} />
                  <ProfileField icon={null} label={language === 'es' ? 'Ubicación' : 'Location'} value={formData.location} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, location: v})} />
                  <ProfileField icon={null} label={language === 'es' ? 'Telegram' : 'Telegram'} value={formData.telegram_user} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, telegram_user: v})} />
                  <div style={{ gridColumn: 'span 2' }}>
                    <ProfileField icon={null} label="Bio" value={formData.bio} isEditing={isEditing} isTextArea onChange={(v: string) => setFormData({...formData, bio: v})} />
                  </div>
                </div>

                <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <StatCard icon={<BullCoin size={20} />} value={Math.floor(user.points || 0)} label="Toros" />
                  <StatCard icon={<VestiaBill size={20} />} value={(user.vestias || 0).toFixed(1)} label="Vestias" />
                </div>
              </motion.div>
            )}

            {activeTab === 'subscription' && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '32px', border: '2px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px' }}>{language === 'es' ? 'Tu Suscripción' : 'Your Subscription'}</h3>
                  <div style={{ background: 'var(--gray-bg)', padding: '30px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--secondary-text)', textTransform: 'uppercase' }}>Plan Actual</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary-red)' }}>{user.subscription_status === 'pro' ? 'PRO' : 'GRATIS'}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '32px', border: '2px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px' }}>{language === 'es' ? 'Datos Bancarios' : 'Financial Data'}</h3>
                  <button onClick={handleUpdatePaymentMethod} className="btn-secondary" style={{ width: '100%', padding: '15px' }}>
                    {language === 'es' ? 'CAMBIAR MÉTODO DE PAGO' : 'CHANGE PAYMENT METHOD'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '32px', border: '2px solid var(--border-color)' }}
              >
                <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px' }}>{language === 'es' ? 'Seguridad' : 'Security'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input type="password" placeholder="Actual" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="btn-secondary" style={{ width: '100%', padding: '12px' }} />
                  <input type="password" placeholder="Nueva" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="btn-secondary" style={{ width: '100%', padding: '12px' }} />
                  <button onClick={handleUpdatePassword} className="btn-primary" style={{ padding: '10px 30px' }}>{language === 'es' ? 'ACTUALIZAR' : 'UPDATE'}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
