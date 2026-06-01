import { API_BASE_URL } from './config';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import { Home, BookOpen, User as UserIcon, HelpCircle, CreditCard, Pencil, Moon, Sun, Phone, MapPin, MessageSquare, Info, Shield, Bell, Settings, LogOut, CheckCircle, FileText, Camera, ShoppingBag, ArrowRightLeft, Sparkles, Trophy, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import DynamicPage from './pages/DynamicPage';
import Dashboard from './pages/Dashboard';
import LearningPath from './pages/LearningPath';
import Lesson from './pages/Lesson';
import Shop from './pages/Shop';
import Exchange from './pages/Exchange';
import Ranking from './pages/Ranking';
import Community from './pages/Community';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';
import BullCoin from './components/BullCoin';
import VestiaIcon from './components/VestiaIcon';
import VestiaBill from './components/VestiaBill';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

function LanguageSelector({ language, toggleLanguage }: { language: string, toggleLanguage: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <motion.button 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'var(--gray-bg)', 
          border: '2px solid var(--border-color)', 
          color: 'var(--text-color)', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '8px 12px', 
          cursor: 'pointer', 
          borderRadius: '16px', 
          fontWeight: 'bold', 
          gap: '8px',
          fontSize: '14px'
        }}
      >
        {language === 'es' ? '🇪🇸' : '🇺🇸'}
        <span>{language.toUpperCase()}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                background: 'var(--card-bg)',
                border: '2px solid var(--border-color)',
                borderRadius: '16px',
                padding: '8px',
                zIndex: 100,
                minWidth: '140px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            >
              {[
                { code: 'es', label: 'Español', flag: '🇪🇸' },
                { code: 'en', label: 'English', flag: '🇺🇸' }
              ].map((lang) => (
                <motion.div
                  key={lang.code}
                  whileHover={{ background: 'var(--gray-bg)' }}
                  onClick={() => {
                    if (language !== lang.code) toggleLanguage();
                    setIsOpen(false);
                  }}
                  style={{ 
                    padding: '10px 12px', 
                    cursor: 'pointer', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    fontSize: '14px',
                    color: language === lang.code ? 'var(--primary-red)' : 'var(--text-color)',
                    fontWeight: language === lang.code ? '800' : '600'
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Navbar({ 
  user, 
  theme, 
  toggleTheme, 
  language, 
  toggleLanguage, 
  t,
  isCrazyMode,
  toggleCrazyMode,
  notifications,
  unreadCount,
  markNotificationsRead
}: { 
  user: any, 
  theme: string, 
  toggleTheme: () => void, 
  language: string, 
  toggleLanguage: () => void, 
  t: any,
  isCrazyMode: boolean,
  toggleCrazyMode: () => void,
  notifications: any[],
  unreadCount: number,
  markNotificationsRead: () => void
}) {
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const langObj = t?.[language] || t?.['es'] || {};

  useEffect(() => {
    if (!user || user.lives >= 5 || !user.last_life_regen) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const lastRegen = new Date(user.last_life_regen);
      const diffMs = now.getTime() - lastRegen.getTime();
      const nextRegenMs = 10 * 60 * 1000; // 10 minutes
      const timeLeftMs = nextRegenMs - (diffMs % nextRegenMs);
      
      const mins = Math.floor(timeLeftMs / 60000);
      const secs = Math.floor((timeLeftMs % 60000) / 1000);
      setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav style={{
      height: '80px',
      padding: '0 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--card-bg)',
      borderBottom: '2px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'background-color 0.3s, border-color 0.3s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
           <VestiaIcon size={32} />
           <span style={{ fontWeight: 900, fontSize: '24px', color: 'var(--primary-red)', letterSpacing: '-1.5px' }}>INVESTIA</span>
        </Link>
        
        <div className="nav-links" style={{ display: 'flex', gap: '30px' }}>
          {[
            { to: '/dashboard', label: langObj.courses || 'Cursos' },
            { to: '/exchange', label: langObj.exchange || 'Exchange' },
            { to: '/ranking', label: 'Ranking' },
            { to: '/community', label: langObj.community || 'Comunidad' },
            { to: '/shop', label: langObj.tienda || 'Tienda' },
            { to: '/admin', label: langObj.admin || 'Admin', show: isAdmin }
          ].map((link) => (
            (link.show || link.show === undefined) && (
              <motion.div key={link.to} whileHover={{ y: -2 }}>
                <Link
                  to={link.to}
                  style={{
                    textDecoration: 'none',
                    color: location.pathname === link.to ? 'var(--primary-red)' : 'var(--text-color)',
                    fontWeight: '800',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            )
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px', background: 'var(--gray-bg)', padding: '8px 20px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={unreadCount > 0 ? { duration: 2, repeat: Infinity } : {}}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsRead();
                }}
                style={{ background: 'none', border: 'none', color: unreadCount > 0 ? 'var(--primary-red)' : 'var(--secondary-text)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Bell size={20} fill={unreadCount > 0 ? 'var(--primary-red)' : 'none'} />
                {unreadCount > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary-red)', color: 'white', fontSize: '10px', fontWeight: '900', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--gray-bg)' }}
                  >
                    {unreadCount}
                  </motion.div>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: '-10px',
                        width: '320px',
                        maxHeight: '450px',
                        background: 'var(--card-bg)',
                        border: '2px solid var(--border-color)',
                        borderRadius: '24px',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                        zIndex: 999,
                        overflowY: 'auto'
                      }}
                    >
                      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', fontWeight: '900', fontSize: '16px' }}>
                        {language === 'en' ? 'Notifications' : 'Notificaciones'}
                      </div>
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <Link 
                            key={n.id} 
                            to={n.link || '#'} 
                            onClick={() => setShowNotifications(false)}
                            style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', borderBottom: '1px solid var(--border-color)', background: n.is_read ? 'transparent' : 'rgba(229, 57, 53, 0.03)' }}
                          >
                            <div style={{ fontWeight: '800', color: 'var(--text-color)', fontSize: '14px', marginBottom: '4px' }}>{n.title}</div>
                            <div style={{ color: 'var(--secondary-text)', fontSize: '13px', lineHeight: '1.4' }}>{n.content}</div>
                            <div style={{ fontSize: '11px', color: 'var(--secondary-text)', opacity: 0.6, marginTop: '5px' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                          </Link>
                        ))
                      ) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                          {language === 'en' ? 'No notifications yet' : 'No tienes notificaciones'}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BullCoin size={20} />
              <span style={{ fontWeight: '900', fontSize: '15px', color: 'var(--text-color)' }}>{Math.floor(user.points || 0)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <VestiaBill size={20} />
               <span style={{ fontWeight: '900', fontSize: '15px', color: 'var(--text-color)' }}>{(user.vestias || 0).toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <motion.div animate={user.lives < 5 ? { opacity: [1, 0.5, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
                   <Heart size={20} color={user.lives > 0 ? "var(--primary-red)" : "var(--secondary-text)"} fill={user.lives > 0 ? "var(--primary-red)" : "none"} />
                </motion.div>
                <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>{user.lives}</div>
              </div>
              {timeLeft && <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary-text)', minWidth: '35px' }}>{timeLeft}</span>}
            </div>
          </div>
        )}

        <LanguageSelector language={language} toggleLanguage={toggleLanguage} />
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          style={{ background: 'var(--gray-bg)', border: '2px solid var(--border-color)', color: 'var(--text-color)', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {user ? (
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ textAlign: 'right', lineHeight: '1' }}>
              <div style={{ fontWeight: '900', fontSize: '14px', color: 'var(--text-color)' }}>{user.name ? user.name.split(' ')[0] : 'Usuario'}</div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary-red)', marginTop: '2px' }}>LVL {user.level || 1}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gray-bg)', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
              {user.avatar_url ? (
                <img src={`${API_BASE_URL}${user.avatar_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-text)' }}><UserIcon size={20} /></div>
              )}
            </div>
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '14px' }}>{langObj.login || 'Entrar'}</Link>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '14px' }}>{langObj.register || 'Unirse'}</Link>
          </div>
        )}
      </div>
    </nav>
  );
}


function AppContent({ 
  user, 
  setUser, 
  handleLogout, 
  theme, 
  toggleTheme,
  language,
  toggleLanguage,
  translations,
  getT,
  isCrazyMode,
  toggleCrazyMode
}: { 
  user: any, 
  setUser: any, 
  handleLogout: () => void, 
  theme: string, 
  toggleTheme: () => void,
  language: string,
  toggleLanguage: () => void,
  translations: any,
  getT: (obj: any, field: string) => string,
  isCrazyMode: boolean,
  toggleCrazyMode: () => void
}) {
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const t = translations;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/notifications`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markNotificationsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/community/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
    } catch (err) {}
  };

  return (
    <div className="app">
      <Navbar 
        user={user} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        language={language} 
        toggleLanguage={toggleLanguage} 
        t={t}
        isCrazyMode={isCrazyMode}
        toggleCrazyMode={toggleCrazyMode}
        notifications={notifications}
        unreadCount={unreadCount}
        markNotificationsRead={markNotificationsRead}
      />
      <main style={{ paddingBottom: '80px', minHeight: 'calc(100vh - 130px)' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><DynamicPage slug="home" /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition>{user ? <Dashboard user={user} setUser={setUser} language={language} getT={getT} t={t} /> : <Navigate to="/login" />}</PageTransition>} />
            <Route path="/path/:courseId" element={<PageTransition><LearningPath user={user} setUser={setUser} language={language} getT={getT} t={t} /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login onLogin={setUser} /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register onLogin={setUser} /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><Profile user={user} setUser={setUser} onLogout={handleLogout} language={language} t={t} toggleTheme={toggleTheme} /></PageTransition>} />
            <Route path="/course/:courseId" element={<PageTransition><LearningPath user={user} setUser={setUser} language={language} getT={getT} t={t} /></PageTransition>} />
            <Route path="/lesson/:id" element={<PageTransition>{user ? <Lesson user={user} setUser={setUser} language={language} getT={getT} t={t} isCrazyMode={isCrazyMode} /> : <Navigate to="/login" />}</PageTransition>} />

            <Route path="/admin" element={<PageTransition>{user?.role === 'admin' ? <Admin user={user} setUser={setUser} /> : <Navigate to="/" />}</PageTransition>} />
            
            <Route path="/contact" element={<PageTransition><DynamicPage slug="contact" /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><DynamicPage slug="privacy" /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><DynamicPage slug="terms" /></PageTransition>} />
            <Route path="/page/:slug" element={<PageTransition><DynamicPage /></PageTransition>} />
            <Route path="/shop" element={<PageTransition><Shop user={user} setUser={setUser} language={language} t={t} /></PageTransition>} />
            <Route path="/exchange" element={<PageTransition><Exchange user={user} setUser={setUser} language={language} /></PageTransition>} />
            <Route path="/ranking" element={<PageTransition><Ranking user={user} setUser={setUser} language={language} /></PageTransition>} />
            <Route path="/faq" element={<PageTransition><DynamicPage slug="faq" /></PageTransition>} />
            <Route path="/help" element={<PageTransition><DynamicPage slug="help" /></PageTransition>} />
            <Route path="/community" element={<PageTransition><Community user={user} language={language} /></PageTransition>} />
            <Route path="/cookies" element={<PageTransition><DynamicPage slug="cookies" /></PageTransition>} />
            <Route path="/risk" element={<PageTransition><DynamicPage slug="risk" /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound language={language} /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer user={user} />
      
      <CookieConsent />

      <div className="bottom-nav">
        <Link to="/"><Home color={location.pathname === '/' || location.pathname === '/dashboard' ? 'var(--primary-red)' : 'var(--text-color)'} /></Link>
        {!isAdmin && <Link to="/exchange"><ArrowRightLeft color={location.pathname === '/exchange' ? 'var(--primary-red)' : 'var(--text-color)'} /></Link>}
        {!isAdmin && <Link to="/ranking"><Trophy color={location.pathname === '/ranking' ? 'var(--primary-red)' : 'var(--text-color)'} /></Link>}
        {!isAdmin && <Link to="/shop"><ShoppingBag color={location.pathname === '/shop' ? 'var(--primary-red)' : 'var(--text-color)'} /></Link>}
        <Link to="/contact"><HelpCircle color={location.pathname === '/contact' ? 'var(--primary-red)' : 'var(--text-color)'} /></Link>
        <Link to="/profile" style={{ position: 'relative' }}>
          {user?.avatar_url ? (
            <img
              src={`${API_BASE_URL}${user.avatar_url}`}
              alt="Profile"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: location.pathname === '/profile' ? '2px solid var(--primary-red)' : '2px solid transparent'
              }}
            />
          ) : (
            <UserIcon color={location.pathname === '/profile' ? 'var(--primary-red)' : 'var(--text-color)'} />
          )}
          {user && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'var(--primary-red)',
              color: 'white',
              fontSize: '8px',
              fontWeight: '900',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid white'
            }}>
              {user.level || 1}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');
  const [isCrazyMode, setIsCrazyMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.id) {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      const fetchStatus = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/courses/status`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            const statusData = await res.json();
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            
            // Check if status changed to avoid unnecessary re-renders
            if (statusData.points !== currentUser.points || 
                statusData.vestias !== currentUser.vestias || 
                statusData.lives !== currentUser.lives ||
                statusData.level !== currentUser.level) {
              const updatedUser = { ...currentUser, ...statusData };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }
        } catch (err) {}
      };
      
      const interval = setInterval(fetchStatus, 15000); // Every 15 seconds
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const toggleCrazyMode = () => setIsCrazyMode(!isCrazyMode);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const translations = {
    es: {
      courses: "Cursos",
      hola: "Hola",
      descubre_cursos: "Continúa tu aprendizaje o descubre nuevos cursos.",
      puntos: "Toros",
      tienda: "Tienda",
      exchange: "Exchange",
      community: "Comunidad",
      vidas: "Vidas",
      tus_cursos: "Tus Cursos en Curso",
      inscribirse: "Inscribirse Gratis",
      continuar_leccion: "Continuar Lección",
      acceder_curso: "Acceder al curso",
      empezar: "Empezar",
      perfil: "Perfil",
      ajustes: "Ajustes",
      login: "Entrar",
      register: "Unirse",
      admin: "Admin",
      notificaciones: "Notificaciones",
      sin_notificaciones: "No tienes notificaciones"
    },
    en: {
      courses: "Courses",
      hola: "Hello",
      descubre_cursos: "Continue your learning or discover new courses.",
      puntos: "Toros",
      tienda: "Shop",
      exchange: "Exchange",
      community: "Community",
      vidas: "Lives",
      tus_cursos: "Your Ongoing Courses",
      inscribirse: "Enroll for Free",
      continuar_leccion: "Continue Lesson",
      acceder_curso: "Go to Course",
      empezar: "Start",
      perfil: "Profile",
      ajustes: "Settings",
      login: "Login",
      register: "Join",
      admin: "Admin",
      notificaciones: "Notifications",
      sin_notificaciones: "No notifications yet"
    }
  };

  const getT = (obj: any, field: string) => {
    return obj[field + '_' + language] || obj[field] || '';
  };

  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" />
      <AppContent 
        user={user} 
        setUser={setUser} 
        handleLogout={handleLogout} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        language={language} 
        toggleLanguage={toggleLanguage} 
        translations={translations}
        getT={getT}
        isCrazyMode={isCrazyMode}
        toggleCrazyMode={toggleCrazyMode}
      />
    </Router>
  );
}

export default App;
