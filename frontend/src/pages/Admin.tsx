import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Trash, Pencil, ChevronLeft, Users, Eye, Shield, User as UserIcon, 
  Check, X, BarChart2, Search, ChevronDown, UserMinus, Lock, Filter, 
  ArrowUpDown, Tag, MessageCircle, Settings, ShoppingBag, ArrowRightLeft,
  Book, TrendingUp, ShieldCheck, Zap, Award, DollarSign, PieChart, 
  Briefcase, Target, Wallet, Coins, Globe, Landmark, TrendingDown,
  Activity, BarChart, LineChart, Layers, Database, Cpu, Lightbulb, Gift,
  FileText, ChevronRight, LayoutDashboard, RefreshCw, LogOut, Cookie, Megaphone, Send, Type, Image, Minus, Trophy, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import BullCoin from '../components/BullCoin';

const icons: any = {
  Book, TrendingUp, TrendingDown, ShieldCheck, Zap, Award, DollarSign, PieChart, 
  Briefcase, Target, Wallet, Coins, Globe, Landmark, Activity, BarChart, 
  LineChart, Layers, Database, Cpu, Lightbulb
};

const CourseIcon = ({ name, size = 48 }: { name: string, size?: number }) => {
  const IconComponent = icons[name] || Book;
  return <IconComponent size={size} />;
};

import toast from 'react-hot-toast';

const FilterDropdown = ({ value, options, onChange, icon: Icon, label, searchable, multi }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selectedOptions = multi 
    ? options.filter((o: any) => Array.isArray(value) && value.includes(o.value))
    : [options.find((o: any) => (o && o.value === value))].filter(Boolean);

  const filteredOptions = searchable 
    ? options.filter((opt: any) => opt && opt.label && opt.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (optValue: any) => {
    if (multi) {
      if (optValue === 'all') {
        onChange(['all']);
      } else {
        const currentValues = Array.isArray(value) ? value : [value].filter(v => v !== undefined);
        let newValue = [...currentValues];
        
        if (newValue.includes('all')) {
          newValue = [optValue];
        } else if (newValue.includes(optValue)) {
          newValue = newValue.filter(v => v !== optValue);
          if (newValue.length === 0) newValue = ['all'];
        } else {
          newValue.push(optValue);
        }
        onChange(newValue);
      }
    } else {
      onChange(optValue);
      setIsOpen(false);
      setSearch('');
    }
  };

  const getLabel = () => {
    if (multi) {
      const isAll = !Array.isArray(value) || value.includes('all') || value.length === 0;
      if (isAll) return label;
      if (value.length === 1) return selectedOptions[0]?.label || label;
      return `${value.length} seleccionadas`;
    }
    return selectedOptions[0]?.label || label;
  };

  return (
    <div style={{ position: 'relative', minWidth: '180px' }}>
      <motion.button
        whileHover={{ scale: 1.02, borderColor: 'var(--primary-red)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 15px 12px 40px',
          borderRadius: '16px',
          border: '2px solid var(--border-color)',
          background: 'var(--card-bg)',
          color: 'var(--text-color)',
          fontSize: '14px',
          fontWeight: '700',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', left: '12px', color: 'var(--secondary-text)', display: 'flex' }}>
          <Icon size={18} />
        </div>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '5px' }}>
          {getLabel()}
        </span>
        <ChevronDown size={16} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
              onClick={() => { setIsOpen(false); setSearch(''); }} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'var(--card-bg)',
                border: '2px solid var(--border-color)',
                borderRadius: '18px',
                padding: '8px',
                zIndex: 999,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                maxHeight: '350px',
                minWidth: '220px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {searchable && (
                <div style={{ padding: '5px', marginBottom: '5px' }}>
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)',
                    }}
                  />
                </div>
              )}
              <div style={{ overflowY: 'auto', flexGrow: 1 }}>
                {filteredOptions.map((opt: any) => {
                   const isSelected = multi 
                    ? (Array.isArray(value) && value.includes(opt.value))
                    : value === opt.value;

                   return (
                    <motion.div
                      key={opt.value}
                      whileHover={{ background: 'var(--gray-bg)' }}
                      onClick={() => handleSelect(opt.value)}
                      style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: isSelected ? '800' : '500',
                        color: isSelected ? 'var(--primary-red)' : 'var(--text-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      {opt.label}
                      {isSelected && <Check size={14} />}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: any) => (
  <motion.div
    whileHover={{ x: 5, background: 'var(--gray-bg)' }}
    onClick={onClick}
    style={{
      padding: '12px 15px',
      borderRadius: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: active ? 'var(--primary-red)' : 'var(--text-color)',
      background: active ? 'rgba(229, 57, 53, 0.08)' : 'transparent',
      fontWeight: active ? '800' : '600',
      transition: 'all 0.2s',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    }}
  >
    <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
      <Icon size={collapsed ? 24 : 20} />
    </div>
    {!collapsed && <span style={{ fontSize: '15px' }}>{label}</span>}
    {active && !collapsed && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-red)' }} />}
  </motion.div>
);

const ConfirmModal = ({ title, message, onConfirm, onClose, isAlert }: any) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '32px', border: '2px solid var(--border-color)', maxWidth: '450px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
      <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>{title}</h3>
      <p style={{ color: 'var(--secondary-text)', lineHeight: '1.6', marginBottom: '30px' }}>{message}</p>
      <div style={{ display: 'flex', gap: '15px' }}>
        <button onClick={onConfirm} className="btn-primary" style={{ flex: 1 }}>{isAlert ? 'ENTENDIDO' : 'CONFIRMAR'}</button>
        {!isAlert && <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>CANCELAR</button>}
      </div>
    </motion.div>
  </div>
);

export default function Admin({ handleLogout }: { handleLogout?: () => void }) {
  const [view, setView] = useState<'courses' | 'users' | 'settings' | 'pages' | 'courseDetails' | 'lessonDetails' | 'categories' | 'translations' | 'shop' | 'exchange' | 'mysteryBox' | 'cookies' | 'courseProgress' | 'userAnswers' | 'courseAllAnswers' | 'channels'>('courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Mystery Box State
  const [mbSettings, setMbSettings] = useState({
    base_cost: 200,
    prob_nothing: 10,
    prob_trs_small: 40,
    prob_trs_medium: 30,
    prob_trs_large: 15,
    prob_jackpot: 5,
    trs_small_min: 10,
    trs_small_max: 50,
    trs_medium_min: 50,
    trs_medium_max: 200,
    trs_large_min: 200,
    trs_large_max: 1000,
    jackpot_min: 1000,
    jackpot_max: 10000
  });

  // CMS builder state
  const [editingPage, setEditingPage] = useState<any>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', title_en: '', description: '', description_en: '', points: 50, xp_reward: 100, category_id: 1, difficulty: 'beginner', visibility: 'public', order_index: 0, imageFile: null as File | null });
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState<any>(null);

  // Filters State
  const [adminCourseSearchQuery, setAdminCourseSearchQuery] = useState('');
  const [adminSelectedCategory, setAdminSelectedCategory] = useState(['all']);
  const [adminSelectedDifficulty, setAdminSelectedDifficulty] = useState('all');
  const [adminSortBy, setAdminSortBy] = useState('newest');
  const [adminCategories, setAdminCategories] = useState<any[]>([]);

  // User details state
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [userCoursesProgress, setUserCourseProgress] = useState<any[]>([]);
  const [userAnswersData, setUserAnswersData] = useState<any[]>([]);
  const [courseAllAnswersData, setCourseAllAnswersData] = useState<any[]>([]);

  // Channel Applications state
  const [channelApps, setChannelApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [appMessages, setAppMessages] = useState<any[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [approveForm, setApproveForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCourses();
    fetchUsers();
    fetchCategories();
    fetchTranslations();
    fetchMbSettings();
    fetchPages();
  }, []);

  const fetchChannelApps = async () => {
    const res = await fetch(`${API_BASE_URL}/api/community/admin/applications`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    setChannelApps(await res.json());
  };

  const handleSelectApp = async (app: any) => {
    setSelectedApp(app);
    const res = await fetch(`${API_BASE_URL}/api/community/application/${app.id}/messages`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    setAppMessages(await res.json());
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

  const fetchPages = async () => {
    const res = await fetch(`${API_BASE_URL}/api/pages`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) setPages(await res.json());
  };

  const fetchMbSettings = async () => {
    const res = await fetch(`${API_BASE_URL}/api/shop/mystery-box/settings`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) {
      const data = await res.json();
      setMbSettings({
        base_cost: data.cost || 20,
        prob_nothing: data.nothing_prob * 100 || 10,
        prob_trs_small: data.normal_prob * 100 || 40,
        prob_trs_medium: 0,
        prob_trs_large: 0,
        prob_jackpot: data.jackpot_prob * 100 || 5,
        trs_small_min: data.normal_amount || 10,
        trs_small_max: data.normal_amount || 50,
        trs_medium_min: 50,
        trs_medium_max: 200,
        trs_large_min: 200,
        trs_large_max: 1000,
        jackpot_min: data.jackpot_amount || 1000,
        jackpot_max: data.jackpot_amount || 10000
      });
    }
  };

  const fetchCourses = async () => {
    const res = await fetch(`${API_BASE_URL}/api/courses`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const data = await res.json();
    setCourses(data);
    
    const catsMap: any = { all: data.length };
    data.forEach((c: any) => {
      catsMap[c.category] = (catsMap[c.category] || 0) + 1;
    });
    setAdminCategories(Object.entries(catsMap).map(([name, count]) => ({ name, count })));
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) setUsers(await res.json());
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE_URL}/api/settings/categories`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    setCategories(await res.json());
  };

  const fetchTranslations = async () => {
    const res = await fetch(`${API_BASE_URL}/api/settings/translations`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const data = await res.json();
    setTranslations(Object.entries(data.es || {}).map(([key, esVal]) => ({
      key,
      es: esVal as string,
      en: data.en?.[key] as string || ''
    })));
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    Object.entries(newCourse).forEach(([key, value]) => {
      if (key === 'imageFile' && value) {
        formData.append('image', value);
      } else if (value !== null) {
        formData.append(key, value as string);
      }
    });

    const url = editingCourseId ? `${API_BASE_URL}/api/courses/${editingCourseId}` : `${API_BASE_URL}/api/courses`;
    const method = editingCourseId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });

    if (res.ok) {
      toast.success(editingCourseId ? 'Curso actualizado' : 'Curso creado');
      setShowForm(false);
      setEditingCourseId(null);
      setNewCourse({ title: '', title_en: '', description: '', description_en: '', points: 50, xp_reward: 100, category_id: 1, difficulty: 'beginner', visibility: 'public', order_index: 0, imageFile: null });
      fetchCourses();
    } else {
      toast.error('Error al guardar el curso');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('¿Eliminar este curso?')) return;
    const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) { toast.success('Curso eliminado'); fetchCourses(); }
  };

  const fetchLessons = async (courseId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const data = await res.json();
    setLessons(data.lessons || []);
  };

  const handleSelectCourse = (course: any) => {
    setSelectedCourse(course);
    fetchLessons(course.id);
    setView('courseDetails');
  };

  const handleUpdateUserStats = async (userId: number, stats: any) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/stats`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(stats)
    });
    if (res.ok) { toast.success('Usuario actualizado'); fetchUsers(); }
  };

  const handleUpdateUserRole = async (userId: number, role: string) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ role })
    });
    if (res.ok) { toast.success('Rol actualizado'); fetchUsers(); }
  };

  const handleSaveMbSettings = async () => {
    const body = {
      cost: mbSettings.base_cost,
      nothing_prob: mbSettings.prob_nothing / 100,
      normal_prob: mbSettings.prob_trs_small / 100,
      jackpot_prob: mbSettings.prob_jackpot / 100,
      normal_amount: mbSettings.trs_small_min,
      jackpot_amount: mbSettings.jackpot_min,
      life_prob: (100 - mbSettings.prob_nothing - mbSettings.prob_trs_small - mbSettings.prob_jackpot) / 100
    };
    const res = await fetch(`${API_BASE_URL}/api/shop/mystery-box/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(body)
    });
    if (res.ok) toast.success('Ajustes guardados');
    else toast.error('Error al guardar ajustes');
  };

  const renderChannels = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <h2 style={{ marginBottom: '30px' }}>Solicitudes de Canales</h2>
       <div className="flex-responsive" style={{ gap: '30px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
             <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--card-bg)', border: '2px solid var(--border-color)', borderRadius: '24px' }}>
                {channelApps.map(app => (
                  <div key={app.id} onClick={() => handleSelectApp(app)} style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: selectedApp?.id === app.id ? 'var(--gray-bg)' : 'transparent', transition: 'all 0.2s' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <div style={{ fontWeight: '800' }}>{app.user_name}</div>
                        <div style={{ fontSize: '10px', fontWeight: '900', background: app.status === 'approved' ? '#4CAF50' : (app.status === 'rejected' ? '#F44336' : '#FF9800'), color: 'white', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>{app.status}</div>
                     </div>
                     <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{new Date(app.created_at).toLocaleDateString()} • {app.user_email}</div>
                  </div>
                ))}
                {channelApps.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>No hay solicitudes</div>}
             </div>
          </div>

          <div style={{ flex: 2, minWidth: '400px' }}>
             {selectedApp ? (
               <div className="card" style={{ background: 'var(--card-bg)', border: '2px solid var(--border-color)', padding: '30px', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                     <h3 style={{ margin: 0 }}>Ticket #{selectedApp.id} - {selectedApp.user_name}</h3>
                     <span style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Solicitado el {new Date(selectedApp.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '20px 0', maxHeight: '400px', overflowY: 'auto', background: 'var(--gray-bg)', padding: '25px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                     {appMessages.map(m => (
                       <div key={m.id} style={{ alignSelf: m.sender_role === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: m.sender_role === 'admin' ? 'var(--primary-red)' : 'var(--card-bg)', color: m.sender_role === 'admin' ? 'white' : 'var(--text-color)', padding: '15px 20px', borderRadius: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: m.sender_role === 'admin' ? 'none' : '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '6px', fontWeight: 'bold' }}>{m.sender_name} {m.sender_role === 'admin' ? '(Admin)' : ''}</div>
                          <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{m.message}</div>
                          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '8px', textAlign: 'right' }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                       </div>
                     ))}
                  </div>
                  <form onSubmit={sendAppReply} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
                     <input type="text" value={replyInput} onChange={e => setReplyInput(e.target.value)} placeholder="Escribe tu respuesta al usuario..." style={{ flexGrow: 1, padding: '15px 20px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '15px' }} />
                     <button type="submit" className="btn-primary" style={{ padding: '0 25px' }}><Send size={20} /></button>
                  </form>
                  {selectedApp.status === 'pending' && (
                    <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '30px' }}>
                       <h4 style={{ marginBottom: '20px', fontWeight: '900', color: 'var(--primary-red)' }}>ACCIONES DE APROBACIÓN</h4>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', gap: '15px' }}>
                             <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', fontWeight: '900', color: 'var(--secondary-text)', marginBottom: '8px', display: 'block' }}>NOMBRE DEL CANAL</label>
                                <input type="text" placeholder="Ej: Noticias de Juan" value={approveForm.name} onChange={e => setApproveForm({...approveForm, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} />
                             </div>
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: '900', color: 'var(--secondary-text)', marginBottom: '8px', display: 'block' }}>DESCRIPCIÓN BREVE</label>
                            <textarea placeholder="Ej: Un espacio para compartir mis análisis diarios." value={approveForm.description} onChange={e => setApproveForm({...approveForm, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '80px' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                             <button onClick={() => updateAppStatus('approved')} className="btn-primary" style={{ flex: 1, padding: '15px' }}>APROBAR CANAL</button>
                             <button onClick={() => updateAppStatus('rejected')} className="btn-secondary" style={{ flex: 1, padding: '15px', background: 'none', border: '2px solid var(--border-color)' }}>RECHAZAR SOLICITUD</button>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
             ) : (
               <div className="card" style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--secondary-text)', background: 'var(--card-bg)', border: '2px dashed var(--border-color)', borderRadius: '24px' }}>
                  <Megaphone size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                  <p style={{ fontSize: '18px', fontWeight: '600' }}>Selecciona una solicitud para revisarla</p>
               </div>
             )}
          </div>
       </div>
    </motion.div>
  );

  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', title_en: '', description: '', description_en: '', content: '', content_en: '', sort_order: 0 });

  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState({ text: '', text_en: '', points: 10, difficulty: 'easy', type: 'multiple_choice' });
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [newAnswer, setNewAnswer] = useState({ text: '', text_en: '', is_correct: false });

  const [editingCMSPage, setEditingCMSPage] = useState<any>(null);
  const [cmsBlocks, setCmsBlocks] = useState<any[]>([]);

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
      setNewLesson({ title: '', title_en: '', description: '', description_en: '', content: '', content_en: '', sort_order: 0 });
      fetchLessons(selectedCourse.id);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!window.confirm('¿Eliminar esta lección?')) return;
    const res = await fetch(`${API_BASE_URL}/api/courses/lessons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) { toast.success('Lección eliminada'); fetchLessons(selectedCourse.id); }
  };

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
      fetchLessonDetails(selectedLesson.id);
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
      fetchLessonDetails(selectedLesson.id);
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
      fetchLessonDetails(selectedLesson.id);
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
      fetchLessonDetails(selectedLesson.id);
    }
  };

  const fetchLessonDetails = async (lessonId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/courses/lessons/${lessonId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setSelectedLesson(data);
    setQuestions(data.questions || []);
    setView('lessonDetails');
  };

  const renderLessonDetails = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <button onClick={() => setView('courseDetails')} className="btn-secondary" style={{ padding: '10px' }}><ChevronLeft size={20} /></button>
          <h2>Preguntas: {selectedLesson?.title}</h2>
       </div>

       <div className="card" style={{ marginBottom: '30px', padding: '30px', borderRadius: '24px' }}>
          <h3>{editingQuestionId ? 'Editar Pregunta' : 'Nueva Pregunta'}</h3>
          <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
             <input type="text" placeholder="Texto de la pregunta (ES)" value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} required />
             <input type="text" placeholder="Texto de la pregunta (EN)" value={newQuestion.text_en} onChange={e => setNewQuestion({...newQuestion, text_en: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} required />
             <div style={{ display: 'flex', gap: '15px' }}>
                <select value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }}>
                   <option value="easy">Fácil (L1)</option>
                   <option value="medium">Medio (L2)</option>
                   <option value="hard">Difícil (L3)</option>
                </select>
                <input type="number" placeholder="Puntos" value={newQuestion.points} onChange={e => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})} style={{ width: '100px', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} />
             </div>
             <div style={{ display: 'flex', gap: '15px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>GUARDAR PREGUNTA</button>
                <button type="button" onClick={() => { setEditingQuestionId(null); setNewQuestion({ text: '', text_en: '', points: 10, difficulty: 'easy', type: 'multiple_choice' }); }} className="btn-secondary" style={{ flex: 1 }}>LIMPIAR</button>
             </div>
          </form>
       </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map(q => (
            <div key={q.id} className="card" style={{ padding: '25px', borderRadius: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                     <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary-red)', marginBottom: '5px' }}>{q.difficulty.toUpperCase()} • {q.points} PUNTOS</div>
                     <div style={{ fontWeight: '800', fontSize: '18px' }}>{q.text}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => { setEditingQuestionId(q.id); setNewQuestion(q); }}><Pencil size={16} /></button>
                     <button className="btn-secondary" style={{ padding: '8px', color: 'var(--primary-red)' }} onClick={() => handleDeleteQuestion(q.id)}><Trash size={16} /></button>
                  </div>
               </div>

               <div style={{ background: 'var(--gray-bg)', padding: '20px', borderRadius: '18px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '900', marginBottom: '15px' }}>RESPUESTAS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     {q.answers?.map((a: any) => (
                       <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: 'var(--card-bg)', borderRadius: '12px', border: a.is_correct ? '2px solid var(--primary-green)' : '1px solid var(--border-color)' }}>
                          <div style={{ fontWeight: '700' }}>{a.text} {a.is_correct && '✅'}</div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                             <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }} onClick={() => { setEditingAnswerId(a.id); setNewAnswer(a); }}><Pencil size={14} /></button>
                             <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-red)' }} onClick={() => handleDeleteAnswer(a.id)}><Trash size={14} /></button>
                          </div>
                       </div>
                     ))}
                     
                     <form onSubmit={(e) => handleSaveAnswer(e, q.id)} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <input type="text" placeholder="Nueva respuesta..." value={newAnswer.text} onChange={e => setNewAnswer({...newAnswer, text: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)' }} required />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                           <input type="checkbox" checked={newAnswer.is_correct} onChange={e => setNewAnswer({...newAnswer, is_correct: e.target.checked})} /> CORRECTA
                        </label>
                        <button type="submit" className="btn-primary" style={{ padding: '0 15px' }}>+</button>
                     </form>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </motion.div>
  );

  const renderCourseDetails = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <button onClick={() => setView('courses')} className="btn-secondary" style={{ padding: '10px' }}><ChevronLeft size={20} /></button>
          <h2>{selectedCourse?.title} - Lecciones</h2>
       </div>
       {(editingLessonId !== null || newLesson.title !== '' || lessons.length === 0) && (
          <div className="card" style={{ marginBottom: '30px', padding: '30px', borderRadius: '24px' }}>
             <h3>{editingLessonId ? 'Editar Lección' : 'Nueva Lección'}</h3>
             <form onSubmit={handleSaveLesson} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div>
                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>TÍTULO (ES)</label>
                   <input type="text" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} required />
                </div>
                <div>
                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>TÍTULO (EN)</label>
                   <input type="text" value={newLesson.title_en} onChange={e => setNewLesson({...newLesson, title_en: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>DESCRIPCIÓN (ES)</label>
                   <textarea value={newLesson.description} onChange={e => setNewLesson({...newLesson, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                   <button type="submit" className="btn-primary" style={{ flex: 1 }}>GUARDAR</button>
                   <button type="button" onClick={() => { setEditingLessonId(null); setNewLesson({ title: '', title_en: '', description: '', description_en: '', content: '', content_en: '', sort_order: 0 }); }} className="btn-secondary" style={{ flex: 1 }}>LIMPIAR</button>
                </div>
             </form>
          </div>
       )}
       <div className="card" style={{ padding: '30px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h3>Lecciones ({lessons.length})</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             {lessons.map((lesson, idx) => (
               <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', background: 'var(--gray-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--card-bg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900' }}>{idx + 1}</div>
                     <div><div style={{ fontWeight: '800' }}>{lesson.title}</div><div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{lesson.description?.substring(0, 60)}...</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => fetchLessonDetails(lesson.id)}><Eye size={16} /> PREGUNTAS</button>
                     <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => { setEditingLessonId(lesson.id); setNewLesson(lesson); }}><Pencil size={16} /></button>
                     <button className="btn-secondary" style={{ padding: '8px', color: 'var(--primary-red)' }} onClick={() => handleDeleteLesson(lesson.id)}><Trash size={16} /></button>
                  </div>
               </div>
             ))}
             {lessons.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary-text)' }}>No hay lecciones en este curso</div>}
          </div>
       </div>
    </motion.div>
  );

  const renderCourses = () => {
    const filteredCourses = courses.filter(c => (c.title.toLowerCase().includes(adminCourseSearchQuery.toLowerCase()) || c.category?.toLowerCase().includes(adminCourseSearchQuery.toLowerCase())) && (adminSelectedCategory.includes('all') || adminSelectedCategory.includes(c.category)));
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
            <div><h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Cursos</h2><p style={{ color: 'var(--secondary-text)', margin: '5px 0 0' }}>Gestiona el contenido educativo de la plataforma</p></div>
            <button onClick={() => { setEditingCourseId(null); setShowForm(true); }} className="btn-primary" style={{ padding: '15px 30px' }}><Plus size={22} /> NUEVO CURSO</button>
        </div>
        {showForm && (
          <div className="card" style={{ marginBottom: '30px', padding: '30px', borderRadius: '24px', border: '2px solid var(--primary-red)' }}>
            <h3 style={{ marginBottom: '25px' }}>{editingCourseId ? 'Editar Curso' : 'Crear Nuevo Curso'}</h3>
            <form onSubmit={handleSaveCourse} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>TÍTULO (ES)</label><input type="text" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} required /></div>
              <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>TÍTULO (EN)</label><input type="text" value={newCourse.title_en} onChange={e => setNewCourse({...newCourse, title_en: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} required /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>DESCRIPCIÓN (ES)</label><textarea value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '80px' }} required /></div>
              <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>DIFICULTAD</label><select value={newCourse.difficulty} onChange={e => setNewCourse({...newCourse, difficulty: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }}><option value="beginner">Principiante</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option></select></div>
              <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>VISIBILIDAD</label><select value={newCourse.visibility} onChange={e => setNewCourse({...newCourse, visibility: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }}><option value="public">Público</option><option value="private">Privado (Solo Admin)</option></select></div>
              <div style={{ gridColumn: 'span 2' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>IMAGEN DEL CURSO</label><input type="file" onChange={e => setNewCourse({...newCourse, imageFile: e.target.files?.[0] || null})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} /></div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}><button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingCourseId ? 'ACTUALIZAR' : 'CREAR'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex: 1 }}>CANCELAR</button></div>
            </form>
          </div>
        )}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
           <div style={{ position: 'relative', flexGrow: 1 }}><Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} size={20} /><input type="text" placeholder="Buscar cursos..." value={adminCourseSearchQuery} onChange={e => setAdminCourseSearchQuery(e.target.value)} style={{ width: '100%', padding: '15px 15px 15px 50px', borderRadius: '18px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '600' }} /></div>
           <FilterDropdown label="Categoría" icon={Filter} options={[{ value: 'all', label: 'Todas las Categorías' }, ...adminCategories.map(c => ({ value: c.name, label: c.name }))]} value={adminSelectedCategory} onChange={setAdminSelectedCategory} multi />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
           {filteredCourses.map(course => (
             <motion.div key={course.id} whileHover={{ y: -5 }} className="card" style={{ padding: '25px', borderRadius: '28px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)' }}><CourseIcon name={course.icon} size={32} /></div><div style={{ display: 'flex', gap: '8px' }}><button onClick={() => { setEditingCourseId(course.id); setNewCourse({ ...course, imageFile: null }); setShowForm(true); }} className="btn-secondary" style={{ padding: '8px', borderRadius: '10px' }}><Pencil size={18} /></button><button onClick={() => handleDeleteCourse(course.id)} className="btn-secondary" style={{ padding: '8px', borderRadius: '10px', color: 'var(--primary-red)' }}><Trash size={18} /></button></div></div>
                <div><h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>{course.title}</h3><div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}><span style={{ fontSize: '10px', fontWeight: '900', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary-red)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>{course.difficulty}</span><span style={{ fontSize: '10px', fontWeight: '900', background: 'var(--gray-bg)', color: 'var(--secondary-text)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>{course.category}</span></div></div>
                <p style={{ fontSize: '14px', color: 'var(--secondary-text)', lineHeight: '1.5', margin: 0, height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.description}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Book size={16} color="var(--secondary-text)" /><span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary-text)' }}>{course.lesson_count || 0} lecciones</span></div><button onClick={() => handleSelectCourse(course)} className="btn-secondary" style={{ padding: '8px 15px', fontSize: '12px', border: '2px solid var(--border-color)' }}>GESTIONAR <ChevronRight size={14} /></button></div>
             </motion.div>
           ))}
        </div>
      </motion.div>
    );
  };

  const renderUsers = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}><h2>Usuarios ({users.length})</h2></div>
       <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--card-bg)', border: '2px solid var(--border-color)', borderRadius: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
             <thead style={{ background: 'var(--gray-bg)', borderBottom: '2px solid var(--border-color)' }}><tr><th style={{ padding: '20px', fontSize: '12px', fontWeight: '900', color: 'var(--secondary-text)' }}>USUARIO</th><th style={{ padding: '20px', fontSize: '12px', fontWeight: '900', color: 'var(--secondary-text)' }}>STATS</th><th style={{ padding: '20px', fontSize: '12px', fontWeight: '900', color: 'var(--secondary-text)' }}>ROL</th><th style={{ padding: '20px', fontSize: '12px', fontWeight: '900', color: 'var(--secondary-text)' }}>ACCIONES</th></tr></thead>
             <tbody>{users.map(user => (<tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}><td style={{ padding: '20px' }}><div style={{ fontWeight: '800' }}>{user.name}</div><div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{user.email}</div></td><td style={{ padding: '20px' }}><div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><BullCoin size={14} /> <span style={{ fontWeight: '700' }}>{user.points}</span></div><div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Zap size={14} color="var(--primary-red)" /> <span style={{ fontWeight: '700' }}>{user.lives}</span></div><div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Trophy size={14} color="#FFD700" /> <span style={{ fontWeight: '700' }}>{user.level || 1}</span></div></div></td><td style={{ padding: '20px' }}><select value={user.role} onChange={(e) => handleUpdateUserRole(user.id, e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: 'bold' }}><option value="user">USER</option><option value="admin">ADMIN</option></select></td><td style={{ padding: '20px' }}><button className="btn-secondary" style={{ padding: '8px 15px', fontSize: '12px' }} onClick={() => { const pts = prompt('Nuevos Toros (TRS):', user.points); const lives = prompt('Nuevas Vidas:', user.lives); if (pts !== null || lives !== null) { handleUpdateUserStats(user.id, { points: pts !== null ? parseInt(pts) : user.points, lives: lives !== null ? parseInt(lives) : user.lives }); } }}>EDITAR STATS</button></td></tr>))}</tbody>
          </table>
       </div>
    </motion.div>
  );

  const handleSaveCategory = async (cat: any) => {
    const url = cat.id ? `${API_BASE_URL}/api/settings/categories/${cat.id}` : `${API_BASE_URL}/api/settings/categories`;
    const method = cat.id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(cat) });
    if (res.ok) { toast.success('Categoría guardada'); fetchCategories(); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    const res = await fetch(`${API_BASE_URL}/api/settings/categories/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) { toast.success('Categoría eliminada'); fetchCategories(); }
  };

  const renderCategories = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}><h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Categorías</h2><button className="btn-primary" onClick={() => { const name = prompt('Nombre de la categoría (ES):'); const name_en = prompt('Nombre de la categoría (EN):'); if (name && name_en) handleSaveCategory({ name, name_en }); }}><Plus size={20} /> NUEVA CATEGORÍA</button></div>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>{categories.map(cat => (<div key={cat.id} className="card" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px' }}><div><div style={{ fontWeight: '900', fontSize: '18px' }}>{cat.name}</div><div style={{ fontSize: '12px', color: 'var(--secondary-text)', fontWeight: 'bold' }}>{cat.name_en}</div></div><div style={{ display: 'flex', gap: '8px' }}><button className="btn-secondary" style={{ padding: '10px', borderRadius: '12px' }} onClick={() => { const name = prompt('Nuevo nombre (ES):', cat.name); const name_en = prompt('Nuevo nombre (EN):', cat.name_en); if (name && name_en) handleSaveCategory({ id: cat.id, name, name_en }); }}><Pencil size={18} /></button><button className="btn-secondary" style={{ padding: '10px', borderRadius: '12px', color: 'var(--primary-red)' }} onClick={() => handleDeleteCategory(cat.id)}><Trash size={18} /></button></div></div>))}</div>
    </motion.div>
  );

  const renderPages = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Páginas CMS</h2>
          <button className="btn-primary" onClick={async () => {
             const title = prompt('Título de la página:');
             const slug = prompt('Slug de la página (ej: terminos-y-condiciones):');
             if (title && slug) {
                const res = await fetch(`${API_BASE_URL}/api/pages`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                   body: JSON.stringify({ title, slug, content: '[]', is_published: false })
                });
                if (res.ok) { fetchPages(); toast.success('Página creada'); }
             }
          }}><Plus size={20} /> NUEVA PÁGINA</button>
       </div>

       {editingCMSPage && (
          <div className="card" style={{ marginBottom: '30px', padding: '30px', borderRadius: '24px', border: '2px solid var(--primary-red)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                   <h3 style={{ margin: 0 }}>Diseñador Visual: {editingCMSPage.title}</h3>
                   <p style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>Añade y organiza bloques para construir tu página</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                   <button onClick={handleSaveCMSContent} className="btn-primary" style={{ padding: '10px 25px' }}>GUARDAR CAMBIOS</button>
                   <button onClick={() => setEditingCMSPage(null)} className="btn-secondary">CANCELAR</button>
                </div>
             </div>

             <div style={{ background: 'var(--gray-bg)', padding: '30px', borderRadius: '20px', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {cmsBlocks.map((block, idx) => (
                  <motion.div key={idx} layout className="card" style={{ padding: '20px', position: 'relative', border: '2px solid transparent', hover: { borderColor: 'var(--primary-red)' } }}>
                     <div style={{ position: 'absolute', right: '15px', top: '15px', display: 'flex', gap: '5px' }}>
                        <button onClick={() => moveBlock(idx, 'up')} style={{ padding: '5px', borderRadius: '5px', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer' }}><ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} /></button>
                        <button onClick={() => moveBlock(idx, 'down')} style={{ padding: '5px', borderRadius: '5px', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer' }}><ChevronDown size={14} /></button>
                        <button onClick={() => removeBlock(idx)} style={{ padding: '5px', borderRadius: '5px', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary-red)', border: 'none', cursor: 'pointer' }}><Trash size={14} /></button>
                     </div>
                     
                     <div style={{ marginBottom: '10px', fontSize: '10px', fontWeight: '900', color: 'var(--secondary-text)', textTransform: 'uppercase' }}>Bloque: {block.type}</div>

                     {block.type === 'heading' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <select value={block.level} onChange={e => updateBlock(idx, { level: parseInt(e.target.value) })} style={{ padding: '8px', borderRadius: '8px', background: 'var(--gray-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
                              <option value={1}>H1</option>
                              <option value={2}>H2</option>
                              <option value={3}>H3</option>
                           </select>
                           <input type="text" value={block.text} onChange={e => updateBlock(idx, { text: e.target.value })} style={{ flex: 1, padding: '8px 15px', borderRadius: '10px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)', fontSize: block.level === 1 ? '24px' : '18px', fontWeight: 'bold' }} />
                        </div>
                     )}

                     {block.type === 'text' && (
                        <textarea value={block.content} onChange={e => updateBlock(idx, { content: e.target.value })} style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)', lineHeight: '1.6' }} />
                     )}

                     {block.type === 'image' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                           <input type="text" placeholder="URL de la imagen" value={block.url} onChange={e => updateBlock(idx, { url: e.target.value })} style={{ padding: '10px', borderRadius: '10px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }} />
                           <input type="text" placeholder="Texto alternativo" value={block.alt} onChange={e => updateBlock(idx, { alt: e.target.value })} style={{ padding: '10px', borderRadius: '10px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }} />
                        </div>
                     )}

                     {block.type === 'divider' && <div style={{ height: '2px', background: 'var(--border-color)', margin: '10px 0' }} />}
                  </motion.div>
                ))}

                {cmsBlocks.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary-text)', fontStyle: 'italic' }}>Tu página está vacía. Añade bloques abajo.</div>}
             </div>

             <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px', border: '2px dashed var(--border-color)', borderRadius: '20px' }}>
                <button onClick={() => addBlock('heading')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Type size={18} /> TÍTULO</button>
                <button onClick={() => addBlock('text')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> TEXTO</button>
                <button onClick={() => addBlock('image')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Image size={18} /> IMAGEN</button>
                <button onClick={() => addBlock('divider')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Minus size={18} /> SEPARADOR</button>
             </div>

             <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={editingCMSPage.is_published} onChange={e => setEditingCMSPage({...editingCMSPage, is_published: e.target.checked})} />
                <label style={{ fontWeight: 'bold' }}>PUBLICAR PÁGINA INMEDIATAMENTE</label>
             </div>
          </div>
       )}

       <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {pages.map(page => (
            <div key={page.id} className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', borderRadius: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '900', fontSize: '20px' }}>{page.title}</div>
                  <div style={{ fontSize: '10px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px', background: page.is_published ? 'var(--primary-green)' : 'var(--gray-bg)', color: page.is_published ? 'white' : 'var(--secondary-text)' }}>
                     {page.is_published ? 'PUBLICADA' : 'BORRADOR'}
                  </div>
               </div>
               <div style={{ fontSize: '14px', color: 'var(--secondary-text)', fontWeight: 'bold' }}>Slug: <code style={{ color: 'var(--primary-red)' }}>/{page.slug}</code></div>
               <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn-secondary" style={{ flex: 1, fontWeight: '800' }} onClick={() => { 
                    setEditingCMSPage(page); 
                    try {
                      const parsed = JSON.parse(page.content);
                      setCmsBlocks(Array.isArray(parsed) ? parsed : []);
                    } catch(e) {
                      setCmsBlocks([{ type: 'text', content: page.content }]);
                    }
                  }}>DISEÑADOR VISUAL</button>
                  <button className="btn-secondary" style={{ padding: '12px', color: 'var(--primary-red)', borderRadius: '12px' }} onClick={async () => {
                     if (window.confirm('¿Eliminar esta página?')) {
                        const res = await fetch(`${API_BASE_URL}/api/pages/${page.slug}`, {
                           method: 'DELETE',
                           headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (res.ok) { fetchPages(); toast.success('Página eliminada'); }
                     }
                  }}><Trash size={20} /></button>
               </div>
            </div>
          ))}
       </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <h2 style={{ marginBottom: '30px' }}>Ajustes Globales</h2>
       <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
          <div className="card" style={{ padding: '30px', borderRadius: '24px' }}>
             <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Sparkles color="var(--primary-red)" /> Mystery Box</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>COSTE BASE (TRS)</label><input type="number" value={mbSettings.base_cost} onChange={e => setMbSettings({...mbSettings, base_cost: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                   <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>PROB. NADA (%)</label><input type="number" value={mbSettings.prob_nothing} onChange={e => setMbSettings({...mbSettings, prob_nothing: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} /></div>
                   <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '12px' }}>PROB. JACKPOT (%)</label><input type="number" value={mbSettings.prob_jackpot} onChange={e => setMbSettings({...mbSettings, prob_jackpot: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)' }} /></div>
                </div>
                <button onClick={handleSaveMbSettings} className="btn-primary" style={{ marginTop: '10px' }}>GUARDAR AJUSTES</button>
             </div>
          </div>
          <div className="card" style={{ padding: '30px', borderRadius: '24px', opacity: 0.6 }}><h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Globe color="var(--primary-red)" /> Traducciones</h3><p>Gestión de cadenas de texto (Próximamente)</p><button disabled className="btn-secondary">CONFIGURAR</button></div>
       </div>
    </motion.div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-bg)' }}>
      {/* Sidebar */}
      <div style={{ width: isSidebarCollapsed ? '80px' : '260px', background: 'var(--card-bg)', borderRight: '2px solid var(--border-color)', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '5px', transition: 'all 0.3s' }}>
        <div style={{ padding: '20px', textAlign: isSidebarCollapsed ? 'center' : 'left', color: 'var(--primary-red)', fontWeight: '900', fontSize: '20px', borderBottom: '2px solid var(--border-color)', marginBottom: '20px' }}>{isSidebarCollapsed ? 'I' : 'INVESTIA ADMIN'}</div>
        <SidebarItem icon={LayoutDashboard} label="Cursos" active={view === 'courses' || view === 'courseDetails'} onClick={() => setView('courses')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={Users} label="Usuarios" active={view === 'users'} onClick={() => setView('users')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={Tag} label="Categorías" active={view === 'categories'} onClick={() => setView('categories')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={Megaphone} label="Canales" active={view === 'channels'} onClick={() => { setView('channels'); fetchChannelApps(); }} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={FileText} label="Páginas" active={view === 'pages'} onClick={() => setView('pages')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={Settings} label="Ajustes" active={view === 'settings'} onClick={() => setView('settings')} collapsed={isSidebarCollapsed} />
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SidebarItem icon={RefreshCw} label="Colapsar" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={LogOut} label="Salir" onClick={handleLogout} collapsed={isSidebarCollapsed} />
        </div>
      </div>
      {/* Main Content Area */}
      <div style={{ flexGrow: 1, padding: '40px', overflowY: 'auto', maxHeight: '100vh' }}>
        <AnimatePresence mode="wait">
          {view === 'courses' && renderCourses()}
          {view === 'courseDetails' && renderCourseDetails()}
          {view === 'lessonDetails' && renderLessonDetails()}
          {view === 'channels' && renderChannels()}
          {view === 'users' && renderUsers()}
          {view === 'settings' && renderSettings()}
          {view === 'categories' && renderCategories()}
          {view === 'pages' && renderPages()}
          {view === 'translations' && <div className="card">Gestión de traducciones (Próximamente)</div>}
        </AnimatePresence>
      </div>
    </div>
  );
}

