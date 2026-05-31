import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ShieldCheck, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface CookieSettings {
  title: string;
  description: string;
  accept_all_text: string;
  reject_all_text: string;
  save_preferences_text: string;
  essential_title: string;
  essential_desc: string;
  analytics_title: string;
  analytics_desc: string;
  marketing_title: string;
  marketing_desc: string;
  policy_link_text: string;
  policy_link_url: string;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false
  });

  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings/cookies`)
      .then(res => res.json())
      .then(data => setSettings(data));

    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => setShowBanner(true), 2000);
    } else {
        setPreferences(JSON.parse(consent));
    }
  }, []);

  const handleAcceptAll = () => {
    const all = { essential: true, analytics: true, marketing: true };
    saveConsent(all);
  };

  const handleRejectAll = () => {
    const essentialOnly = { essential: true, analytics: false, marketing: false };
    saveConsent(essentialOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (cons: any) => {
    localStorage.setItem('cookie_consent', JSON.stringify(cons));
    setPreferences(cons);
    setShowBanner(false);
    setShowDetails(false);
  };

  if (!settings || isAdminPage) return null;

  return (
    <>
      {/* Floating Cookie Icon */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowBanner(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          zIndex: 9000,
          background: 'var(--card-bg)',
          color: 'var(--primary-red)',
          border: '2px solid var(--border-color)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}
      >
        <Cookie size={24} />
      </motion.button>

      <AnimatePresence>
        {showBanner && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: '30px', pointerEvents: 'none' }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', pointerEvents: 'auto' }} 
              onClick={() => setShowBanner(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              style={{
                background: 'var(--card-bg)',
                width: '100%',
                maxWidth: '450px',
                borderRadius: '24px',
                border: '2px solid var(--border-color)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                padding: '30px',
                position: 'relative',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'var(--accent-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary-red)' }}>
                  <ShieldCheck size={24} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: 'var(--text-color)' }}>{settings.title}</h2>
              </div>

              {!showDetails ? (
                <>
                  <p style={{ fontSize: '14px', color: 'var(--secondary-text)', lineHeight: '1.6', margin: 0 }}>
                    {settings.description}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={handleAcceptAll} className="btn-primary" style={{ flex: 1, padding: '12px' }}>{settings.accept_all_text}</button>
                      <button onClick={handleRejectAll} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>{settings.reject_all_text}</button>
                    </div>
                    <button 
                      onClick={() => setShowDetails(true)} 
                      style={{ background: 'none', border: 'none', color: 'var(--primary-red)', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                      <SettingsIcon size={16} /> Configurar preferencias
                    </button>
                    <a href={settings.policy_link_url} style={{ textAlign: 'center', color: 'var(--secondary-text)', fontSize: '12px', textDecoration: 'underline' }}>{settings.policy_link_text}</a>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <CookieOption 
                    title={settings.essential_title} 
                    desc={settings.essential_desc} 
                    checked={preferences.essential} 
                    disabled={true} 
                  />
                  <CookieOption 
                    title={settings.analytics_title} 
                    desc={settings.analytics_desc} 
                    checked={preferences.analytics} 
                    onChange={(v) => setPreferences({...preferences, analytics: v})} 
                  />
                  <CookieOption 
                    title={settings.marketing_title} 
                    desc={settings.marketing_desc} 
                    checked={preferences.marketing} 
                    onChange={(v) => setPreferences({...preferences, marketing: v})} 
                  />

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => setShowDetails(false)} className="btn-secondary" style={{ flex: 1 }}>Volver</button>
                    <button onClick={handleSavePreferences} className="btn-primary" style={{ flex: 1 }}>{settings.save_preferences_text}</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

const CookieOption = ({ title, desc, checked, onChange, disabled }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-bg)', borderRadius: '14px' }}>
    <div style={{ flexGrow: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-color)' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{desc}</div>
    </div>
    <div 
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '44px',
        height: '24px',
        background: checked ? 'var(--primary-red)' : '#ccc',
        borderRadius: '12px',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <motion.div 
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px' }}
      />
    </div>
  </div>
);
