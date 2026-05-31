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
  const [newCourse, setNewCourse] = useState({ 
    title: '', title_en: '', 
    description: '', description_en: '', 
    points_reward: 100, points_price: 0, 
    category_id: 1, category: 'General', category_en: 'General',
    difficulty: 'beginner', visibility: 'public', access_level: 'free',
    icon: 'Book', imageFile: null as File | null 
  });
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

  // Question & CMS state
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState({ text: '', text_en: '', points: 10, difficulty: 'easy', type: 'multiple_choice' });
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [newAnswer, setNewAnswer] = useState({ text: '', text_en: '', is_correct: false });
  const [editingCMSPage, setEditingCMSPage] = useState<any>(null);
  const [cmsBlocks, setCmsBlocks] = useState<any[]>([]);

  // Enrollment state
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([]);
  const [selectedUserAnswers, setSelectedUserAnswers] = useState<any[]>([]);
  const [courseTab, setCourseTab] = useState<'lessons' | 'users'>('lessons');

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
      setNewCourse({ 
        title: '', title_en: '', 
        description: '', description_en: '', 
        points_reward: 100, points_price: 0, 
        category_id: 1, category: 'General', category_en: 'General',
        difficulty: 'beginner', visibility: 'public', access_level: 'free',
        icon: 'Book', imageFile: null 
      });
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
       <div style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0 }}>Gestión de Canales</h2>
          <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Revisa solicitudes de comunidad y aprueba nuevos creadores</p>
       </div>

       <div className="flex-responsive" style={{ gap: '35px', alignItems: 'flex-start' }}>
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
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '35px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <button onClick={() => setView('courseDetails')} className="btn-secondary" style={{ padding: '10px', borderRadius: '12px', background: 'var(--card-bg)' }}><ChevronLeft size={20} /></button>
             <div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '950' }}>Banco de Preguntas</h2>
                <p style={{ margin: 0, color: 'var(--secondary-text)', fontSize: '14px', fontWeight: '700' }}>Lección: <span style={{ color: 'var(--primary-red)' }}>{selectedLesson?.title}</span></p>
             </div>
          </div>
       </div>

       <div className="card" style={{ marginBottom: '45px', padding: '40px', borderRadius: '35px', border: '3px solid var(--primary-red)', background: 'var(--card-bg)', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
          <h3 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '950', color: 'var(--primary-red)' }}>
             {editingQuestionId ? <Pencil size={24} /> : <Plus size={24} />} 
             {editingQuestionId ? 'EDITAR PREGUNTA EXISTENTE' : 'CREAR NUEVA PREGUNTA'}
          </h3>
          
          <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                   <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '12px', color: 'var(--secondary-text)', letterSpacing: '0.5px' }}>ENUNCIADO DE LA PREGUNTA (ESPAÑOL)</label>
                   <textarea placeholder="Ej: ¿Cuál es el principal beneficio de diversificar una cartera?" value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} style={{ width: '100%', padding: '18px', borderRadius: '20px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '90px', fontSize: '16px', lineHeight: '1.5', fontWeight: '700' }} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                   <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '12px', color: 'var(--secondary-text)', letterSpacing: '0.5px' }}>QUESTION TEXT (ENGLISH)</label>
                   <textarea placeholder="Ej: What is the main benefit of diversifying a portfolio?" value={newQuestion.text_en} onChange={e => setNewQuestion({...newQuestion, text_en: e.target.value})} style={{ width: '100%', padding: '18px', borderRadius: '20px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '90px', fontSize: '16px', lineHeight: '1.5', fontWeight: '700' }} required />
                </div>
                
                <div>
                   <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '12px', color: 'var(--secondary-text)' }}>MECÁNICA DE RESPUESTA</label>
                   <select value={newQuestion.type} onChange={e => setNewQuestion({...newQuestion, type: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800' }}>
                      <option value="multiple_choice">Opción Múltiple (Botones)</option>
                      <option value="true_false">Verdadero / Falso</option>
                      <option value="text_input">Entrada de Texto Libre</option>
                   </select>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                   <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '12px', color: 'var(--secondary-text)' }}>NIVEL DE DIFICULTAD</label>
                      <select value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800' }}>
                         <option value="easy">Principiante (L1)</option>
                         <option value="medium">Intermedio (L2)</option>
                         <option value="hard">Experto (L3)</option>
                      </select>
                   </div>
                   <div style={{ width: '140px' }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '950', fontSize: '12px', color: 'var(--secondary-text)' }}>VALOR (PTS)</label>
                      <input type="number" value={newQuestion.points} onChange={e => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '950', textAlign: 'center', fontSize: '18px' }} />
                   </div>
                </div>
             </div>

             <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '20px', fontSize: '15px', fontWeight: '950', letterSpacing: '1px' }}>{editingQuestionId ? 'ACTUALIZAR PREGUNTA' : 'AÑADIR AL BANCO'}</button>
                <button type="button" onClick={() => { setEditingQuestionId(null); setNewQuestion({ text: '', text_en: '', points: 10, difficulty: 'easy', type: 'multiple_choice' }); }} className="btn-secondary" style={{ flex: 1, padding: '20px', fontWeight: '800' }}>LIMPIAR</button>
             </div>
          </form>
       </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Search size={24} color="var(--primary-red)" /> LISTADO DE PREGUNTAS ({questions.length})
          </h3>
          {questions.map((q, qIdx) => (
            <div key={q.id} className="card" style={{ padding: '35px', borderRadius: '35px', border: '2px solid var(--border-color)', background: 'var(--card-bg)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', gap: '25px' }}>
                     <div style={{ width: '55px', height: '55px', borderRadius: '18px', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', color: 'var(--primary-red)', border: '2px solid var(--border-color)', fontSize: '20px' }}>{qIdx + 1}</div>
                     <div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                           <span style={{ fontSize: '10px', fontWeight: '950', background: 'rgba(229, 57, 53, 0.12)', color: 'var(--primary-red)', padding: '5px 12px', borderRadius: '10px', textTransform: 'uppercase' }}>{q.difficulty}</span>
                           <span style={{ fontSize: '10px', fontWeight: '950', background: 'var(--gray-bg)', color: 'var(--secondary-text)', padding: '5px 12px', borderRadius: '10px', textTransform: 'uppercase' }}>{q.type.replace('_', ' ')}</span>
                           <span style={{ fontSize: '10px', fontWeight: '950', background: 'var(--primary-green)', color: 'white', padding: '5px 12px', borderRadius: '10px' }}>{q.points} PTS</span>
                        </div>
                        <div style={{ fontWeight: '900', fontSize: '21px', lineHeight: '1.4', color: 'var(--text-color)' }}>{q.text}</div>
                        <div style={{ color: 'var(--secondary-text)', fontSize: '15px', marginTop: '6px', fontStyle: 'italic', fontWeight: '600' }}>{q.text_en}</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <button className="btn-secondary" style={{ padding: '12px', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'transparent' }} onClick={() => { setEditingQuestionId(q.id); setNewQuestion(q); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil size={20} /></button>
                     <button className="btn-secondary" style={{ padding: '12px', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'transparent', color: 'var(--primary-red)' }} onClick={() => handleDeleteQuestion(q.id)}><Trash size={20} /></button>
                  </div>
               </div>

               <div style={{ background: 'var(--gray-bg)', padding: '30px', borderRadius: '28px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '950', marginBottom: '20px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>CONFIGURACIÓN DE RESPUESTAS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     {q.answers?.map((a: any) => (
                       <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 25px', background: 'var(--card-bg)', borderRadius: '18px', border: a.is_correct ? '3px solid var(--primary-green)' : '2px solid var(--border-color)', boxShadow: a.is_correct ? '0 10px 20px rgba(76, 175, 80, 0.15)' : 'none' }}>
                          <div>
                             <div style={{ fontWeight: '900', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-color)' }}>
                                {a.text} {a.is_correct && <Check size={20} color="var(--primary-green)" />}
                             </div>
                             <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '600', marginTop: '2px' }}>{a.text_en}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                             <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)', padding: '8px' }} onClick={() => { setEditingAnswerId(a.id); setNewAnswer(a); }}><Pencil size={18} /></button>
                             <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-red)', padding: '8px' }} onClick={() => handleDeleteAnswer(a.id)}><Trash size={18} /></button>
                          </div>
                       </div>
                     ))}
                     
                     <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.03)', padding: '25px', borderRadius: '22px', border: '2px dashed var(--border-color)' }}>
                        <div style={{ fontSize: '12px', fontWeight: '950', marginBottom: '15px', color: 'var(--secondary-text)' }}>{editingAnswerId ? 'EDITAR RESPUESTA SELECCIONADA' : 'RÁPIDA ADICIÓN DE RESPUESTA'}</div>
                        <form onSubmit={(e) => handleSaveAnswer(e, q.id)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '15px', alignItems: 'center' }}>
                           <input type="text" placeholder="Texto (ES)" value={newAnswer.text} onChange={e => setNewAnswer({...newAnswer, text: e.target.value})} style={{ padding: '12px 18px', borderRadius: '12px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '700' }} required />
                           <input type="text" placeholder="Text (EN)" value={newAnswer.text_en} onChange={e => setNewAnswer({...newAnswer, text_en: e.target.value})} style={{ padding: '12px 18px', borderRadius: '12px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '700' }} required />
                           <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '950', cursor: 'pointer', background: 'var(--card-bg)', padding: '10px 15px', borderRadius: '12px', border: '2px solid var(--border-color)' }}>
                              <input type="checkbox" checked={newAnswer.is_correct} onChange={e => setNewAnswer({...newAnswer, is_correct: e.target.checked})} style={{ width: '20px', height: '20px' }} /> CORRECTA
                           </label>
                           <button type="submit" className="btn-primary" style={{ padding: '0 25px', height: '48px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(229, 57, 53, 0.2)' }}>
                              <Plus size={24} />
                           </button>
                        </form>
                        {editingAnswerId && <button onClick={() => { setEditingAnswerId(null); setNewAnswer({ text: '', text_en: '', is_correct: false }); }} style={{ marginTop: '15px', background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}>CANCELAR EDICIÓN</button>}
                     </div>
                  </div>
               </div>
            </div>
          ))}
          {questions.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '100px 40px', color: 'var(--secondary-text)', border: '4px dashed var(--border-color)', borderRadius: '40px' }}>
             <Search size={64} style={{ opacity: 0.15, marginBottom: '25px' }} />
             <p style={{ fontSize: '22px', fontWeight: '800' }}>El banco de preguntas está vacío</p>
             <p style={{ fontSize: '16px', marginTop: '8px' }}>Configura la primera pregunta interactiva usando el panel superior.</p>
          </div>}
       </div>
    </motion.div>
  );

  const fetchEnrolledUsers = async (courseId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}/progress`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setEnrolledUsers(await res.json());
  };

  const fetchUserAnswers = async (userId: number, courseId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/courses/${courseId}/answers`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setSelectedUserAnswers(await res.json());
  };

  const handleExpelUser = async (userId: number) => {
    if (!window.confirm('¿Seguro que quieres expulsar a este usuario del curso? Perderá todo su progreso en él.')) return;
    const res = await fetch(`${API_BASE_URL}/api/admin/courses/${selectedCourse.id}/enrollments/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toast.success('Usuario expulsado');
      fetchEnrolledUsers(selectedCourse.id);
    }
  };

  const handleResetQuestion = async (userId: number, questionId: number) => {
    if (!window.confirm('¿Reiniciar esta pregunta para el usuario?')) return;
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/answers/question/${questionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toast.success('Pregunta reiniciada');
      fetchUserAnswers(userId, selectedCourse.id);
    }
  };

  const renderCourseDetails = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <button onClick={() => setView('courses')} className="btn-secondary" style={{ padding: '10px', borderRadius: '12px' }}><ChevronLeft size={20} /></button>
             <div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900' }}>Panel del Curso</h2>
                <p style={{ margin: 0, color: 'var(--secondary-text)', fontSize: '14px' }}>{selectedCourse?.title}</p>
             </div>
          </div>
          
          <div style={{ display: 'flex', background: 'var(--gray-bg)', padding: '5px', borderRadius: '15px', gap: '5px' }}>
             <button onClick={() => setCourseTab('lessons')} style={{ padding: '10px 25px', borderRadius: '12px', border: 'none', background: courseTab === 'lessons' ? 'var(--card-bg)' : 'transparent', fontWeight: '800', cursor: 'pointer', boxShadow: courseTab === 'lessons' ? '0 5px 10px rgba(0,0,0,0.05)' : 'none' }}>LECCIONES</button>
             <button onClick={() => { setCourseTab('users'); fetchEnrolledUsers(selectedCourse.id); }} style={{ padding: '10px 25px', borderRadius: '12px', border: 'none', background: courseTab === 'users' ? 'var(--card-bg)' : 'transparent', fontWeight: '800', cursor: 'pointer', boxShadow: courseTab === 'users' ? '0 5px 10px rgba(0,0,0,0.05)' : 'none' }}>USUARIOS</button>
          </div>
       </div>

       {courseTab === 'lessons' ? (
         <>
            {(editingLessonId !== null || newLesson.title !== '' || lessons.length === 0) && (
                <div className="card" style={{ marginBottom: '40px', padding: '35px', borderRadius: '32px', border: '3px solid var(--primary-red)', background: 'var(--card-bg)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '950', color: 'var(--primary-red)' }}>
                     {editingLessonId ? <Pencil size={24} /> : <Plus size={24} />} 
                     {editingLessonId ? 'EDITAR LECCIÓN' : 'AÑADIR NUEVA LECCIÓN'}
                  </h3>
                  <form onSubmit={handleSaveLesson} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)', letterSpacing: '0.5px' }}>TÍTULO DE LA LECCIÓN (ES)</label>
                        <input type="text" placeholder="Ej: Introducción a la Bolsa" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '700' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)', letterSpacing: '0.5px' }}>LESSON TITLE (EN)</label>
                        <input type="text" placeholder="Ej: Introduction to Stock Market" value={newLesson.title_en} onChange={e => setNewLesson({...newLesson, title_en: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '700' }} required />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)', letterSpacing: '0.5px' }}>RESUMEN O DESCRIPCIÓN (ES)</label>
                        <textarea value={newLesson.description} onChange={e => setNewLesson({...newLesson, description: e.target.value})} style={{ width: '100%', padding: '18px', borderRadius: '20px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '100px', fontSize: '15px', lineHeight: '1.6' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '15px', gridColumn: 'span 2' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 2, padding: '18px', fontWeight: '950', fontSize: '15px', letterSpacing: '1px' }}>GUARDAR LECCIÓN</button>
                        <button type="button" onClick={() => { setEditingLessonId(null); setNewLesson({ title: '', title_en: '', description: '', description_en: '', content: '', content_en: '', sort_order: 0 }); }} className="btn-secondary" style={{ flex: 1, padding: '18px', fontWeight: '800' }}>LIMPIAR</button>
                      </div>
                  </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                   <h3 style={{ fontSize: '22px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <LayoutDashboard size={22} color="var(--primary-red)" /> ESTRUCTURA DE LECCIONES
                   </h3>
                   <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary-text)', background: 'var(--gray-bg)', padding: '5px 15px', borderRadius: '10px' }}>{lessons.length} TOTAL</span>
                </div>
                
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '25px 35px', background: 'var(--card-bg)', borderRadius: '28px', border: '2px solid var(--border-color)', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--gray-bg)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '950', color: 'var(--primary-red)' }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontWeight: '900', fontSize: '20px', color: 'var(--text-color)' }}>{lesson.title}</div>
                          <div style={{ fontSize: '14px', color: 'var(--secondary-text)', marginTop: '4px', maxWidth: '500px' }}>{lesson.description?.substring(0, 120)}{lesson.description?.length > 120 ? '...' : ''}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" style={{ padding: '12px 22px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900', fontSize: '13px', background: 'var(--gray-bg)', border: 'none' }} onClick={() => fetchLessonDetails(lesson.id)}>
                           <Eye size={18} /> PREGUNTAS
                        </button>
                        <button className="btn-secondary" style={{ padding: '12px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'transparent' }} onClick={() => { setEditingLessonId(lesson.id); setNewLesson(lesson); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                           <Pencil size={18} />
                        </button>
                        <button className="btn-secondary" style={{ padding: '12px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'transparent', color: 'var(--primary-red)' }} onClick={() => handleDeleteLesson(lesson.id)}>
                           <Trash size={18} />
                        </button>
                    </div>
                  </div>
                ))}
                {lessons.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--secondary-text)', border: '3px dashed var(--border-color)', borderRadius: '32px' }}>
                   <Book size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                   <p style={{ fontSize: '18px', fontWeight: '700' }}>No hay lecciones configuradas</p>
                   <p style={{ fontSize: '14px', marginTop: '5px' }}>Usa el formulario de arriba para añadir la primera lección del curso.</p>
                </div>}
            </div>
         </>
       ) : (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px' }}>
               {enrolledUsers.map(user => (
                 <div key={user.id} className="card" style={{ padding: '30px', borderRadius: '32px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', transition: 'all 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                       <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <div style={{ width: '50px', height: '50px', borderRadius: '18px', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', color: 'var(--primary-red)', border: '1px solid var(--border-color)' }}>
                             {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <div style={{ fontWeight: '900', fontSize: '18px' }}>{user.name}</div>
                             <div style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>{user.email}</div>
                          </div>
                       </div>
                       <button className="btn-secondary" style={{ padding: '8px 12px', borderRadius: '10px', color: 'var(--primary-red)', border: 'none', background: 'rgba(229, 57, 53, 0.05)' }} onClick={() => handleExpelUser(user.id)} title="Expulsar del curso">
                          <UserMinus size={18} />
                       </button>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: '950', color: 'var(--secondary-text)', letterSpacing: '1px' }}>PROGRESO DEL CURSO</span>
                          <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary-red)' }}>{Math.round((user.completed_lessons / (user.total_lessons || 1)) * 100)}%</span>
                       </div>
                       <div style={{ height: '12px', background: 'var(--gray-bg)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(user.completed_lessons / (user.total_lessons || 1)) * 100}%` }}
                             style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary-red), #FF5252)', borderRadius: '20px' }} 
                          />
                       </div>
                       <div style={{ fontSize: '12px', color: 'var(--secondary-text)', marginTop: '8px', fontWeight: '800' }}>
                          {user.completed_lessons} de {user.total_lessons} lecciones completadas
                       </div>
                    </div>

                    <button 
                       className="btn-secondary" 
                       style={{ width: '100%', padding: '15px', borderRadius: '18px', fontWeight: '950', fontSize: '13px', letterSpacing: '0.5px', background: 'var(--gray-bg)', border: '2px solid var(--border-color)' }}
                       onClick={() => { fetchUserAnswers(user.id, selectedCourse.id); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
                    >
                       REVISAR RESPUESTAS DETALLADAS
                    </button>
                 </div>
               ))}
               
               {enrolledUsers.length === 0 && <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', color: 'var(--secondary-text)', border: '3px dashed var(--border-color)', borderRadius: '32px' }}>
                  <Users size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                  <p style={{ fontSize: '18px', fontWeight: '700' }}>No hay alumnos inscritos en este curso aún.</p>
               </div>}
            </div>

            {selectedUserAnswers.length > 0 && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '40px', borderRadius: '35px', border: '3px solid var(--primary-green)', background: 'var(--card-bg)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                     <div>
                        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '950' }}>HISTORIAL DE RESPUESTAS</h3>
                        <p style={{ margin: '5px 0 0', color: 'var(--secondary-text)', fontSize: '14px' }}>Analizando desempeño y permitiendo reinicios específicos</p>
                     </div>
                     <button onClick={() => setSelectedUserAnswers([])} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                     {selectedUserAnswers.map(ans => (
                       <div key={ans.ua_id} style={{ padding: '25px', background: 'var(--gray-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'relative' }}>
                          <div style={{ position: 'absolute', right: '20px', top: '20px' }}>
                             {ans.is_correct ? <Check size={24} color="var(--primary-green)" /> : <X size={24} color="var(--primary-red)" />}
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: '950', color: 'var(--secondary-text)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>LECCIÓN: {ans.lesson_title}</div>
                          <div style={{ fontWeight: '900', fontSize: '17px', marginBottom: '12px', paddingRight: '30px' }}>{ans.question_text}</div>
                          <div style={{ fontSize: '14px', background: 'var(--card-bg)', padding: '12px 15px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                             <span style={{ color: 'var(--secondary-text)', fontWeight: '700' }}>Respuesta:</span> <span style={{ fontWeight: '800', color: ans.is_correct ? 'var(--primary-green)' : 'var(--primary-red)' }}>{ans.answer_text}</span>
                          </div>
                          <button 
                             className="btn-secondary" 
                             style={{ width: '100%', padding: '12px', fontSize: '12px', fontWeight: '900', color: 'var(--primary-red)', background: 'transparent', border: '2px solid var(--primary-red)' }} 
                             onClick={() => handleResetQuestion(ans.user_id, ans.question_id)}
                          >
                             BORRAR REGISTRO Y REINICIAR PREGUNTA
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

  const renderCourses = () => {
    const filteredCourses = courses.filter(c => (c.title.toLowerCase().includes(adminCourseSearchQuery.toLowerCase()) || c.category?.toLowerCase().includes(adminCourseSearchQuery.toLowerCase())) && (adminSelectedCategory.includes('all') || adminSelectedCategory.includes(c.category)));
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Catálogo de Cursos</h2>
              <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Gestiona el contenido, precios y visibilidad educativa</p>
            </div>
            <button onClick={() => { setEditingCourseId(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-primary" style={{ padding: '15px 35px', borderRadius: '18px', boxShadow: '0 10px 20px rgba(229, 57, 53, 0.2)' }}>
              <Plus size={22} /> NUEVO CURSO
            </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '45px', padding: '40px', borderRadius: '35px', border: '3px solid var(--primary-red)', background: 'var(--card-bg)', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px' }}>
               <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Pencil size={24} color="var(--primary-red)" /> {editingCourseId ? 'EDITAR CURSO' : 'CREAR NUEVO CURSO'}
               </h3>
            </div>
            
            <form onSubmit={handleSaveCourse} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>TÍTULO DEL CURSO (ESPAÑOL)</label>
                <input type="text" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '700' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>COURSE TITLE (ENGLISH)</label>
                <input type="text" value={newCourse.title_en} onChange={e => setNewCourse({...newCourse, title_en: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontSize: '16px', fontWeight: '700' }} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>DESCRIPCIÓN COMPLETA (ESPAÑOL)</label>
                <textarea value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '120px', fontSize: '15px', lineHeight: '1.6' }} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)', letterSpacing: '1px' }}>FULL DESCRIPTION (ENGLISH)</label>
                <textarea value={newCourse.description_en} onChange={e => setNewCourse({...newCourse, description_en: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', minHeight: '120px', fontSize: '15px', lineHeight: '1.6' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', gridColumn: 'span 2' }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)' }}>CATEGORÍA PRINCIPAL</label>
                    <select 
                      value={newCourse.category_id} 
                      onChange={e => {
                        const cat = categories.find(c => c.id === parseInt(e.target.value));
                        setNewCourse({...newCourse, category_id: cat?.id || 1, category: cat?.name || 'General', category_en: cat?.name_en || 'General' });
                      }} 
                      style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800' }}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)' }}>ICONO REPRESENTATIVO</label>
                    <select value={newCourse.icon} onChange={e => setNewCourse({...newCourse, icon: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800' }}>
                       {Object.keys(icons).map(iconName => (
                         <option key={iconName} value={iconName}>{iconName}</option>
                       ))}
                    </select>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', gridColumn: 'span 2' }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)' }}>PRECIO (TRS)</label>
                    <input type="number" value={newCourse.points_price} onChange={e => setNewCourse({...newCourse, points_price: parseInt(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '900', textAlign: 'center' }} />
                 </div>
                 <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)' }}>RECOMPENSA (PUNTOS)</label>
                    <input type="number" value={newCourse.points_reward} onChange={e => setNewCourse({...newCourse, points_reward: parseInt(e.target.value)})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '900', textAlign: 'center' }} />
                 </div>
                 <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)' }}>DIFICULTAD</label>
                    <select value={newCourse.difficulty} onChange={e => setNewCourse({...newCourse, difficulty: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800' }}>
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                 </div>
                 <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)' }}>NIVEL DE ACCESO</label>
                    <select value={newCourse.access_level} onChange={e => setNewCourse({...newCourse, access_level: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800' }}>
                      <option value="free">Gratis (Todos)</option>
                      <option value="premium">Premium (VST)</option>
                    </select>
                 </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)' }}>ESTADO DE VISIBILIDAD</label>
                <select value={newCourse.visibility} onChange={e => setNewCourse({...newCourse, visibility: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '16px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '800' }}>
                  <option value="public">Público (Visible en App)</option>
                  <option value="private">Privado (Solo Admin)</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '900', fontSize: '12px', color: 'var(--secondary-text)' }}>IMAGEN DE PORTADA</label>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--gray-bg)', padding: '20px', borderRadius: '20px', border: '2px dashed var(--border-color)' }}>
                   <input type="file" onChange={e => setNewCourse({...newCourse, imageFile: e.target.files?.[0] || null})} style={{ flex: 1 }} />
                   {editingCourseId && !newCourse.imageFile && selectedCourse?.image_url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <span style={{ fontSize: '11px', fontWeight: '800' }}>IMG:</span>
                         <img src={`${API_BASE_URL}${selectedCourse.image_url}`} style={{ height: '50px', borderRadius: '10px', boxShadow: '0 5px 10px rgba(0,0,0,0.1)' }} />
                      </div>
                   )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px', gridColumn: 'span 2' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '18px', fontWeight: '900', fontSize: '16px', letterSpacing: '1px' }}>{editingCourseId ? 'ACTUALIZAR CURSO' : 'PUBLICAR CURSO'}</button>
                <button type="button" onClick={() => {
                   setShowForm(false);
                   setEditingCourseId(null);
                   setNewCourse({ title: '', title_en: '', description: '', description_en: '', points_reward: 100, points_price: 0, category_id: 1, category: 'General', category_en: 'General', difficulty: 'beginner', visibility: 'public', access_level: 'free', icon: 'Book', imageFile: null });
                }} className="btn-secondary" style={{ flex: 1, padding: '18px', fontWeight: '800' }}>CANCELAR</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', marginBottom: '35px', alignItems: 'center' }}>
           <div style={{ position: 'relative', flexGrow: 1 }}>
              <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} size={22} />
              <input 
                type="text" 
                placeholder="Buscar por título, categoría o descripción..." 
                value={adminCourseSearchQuery}
                onChange={e => setAdminCourseSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '18px 18px 18px 60px', borderRadius: '22px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontSize: '17px', fontWeight: '700', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
              />
           </div>
           <FilterDropdown 
              label="Filtrar Categoría" 
              icon={Filter}
              options={[{ value: 'all', label: 'Todas las Categorías' }, ...adminCategories.map(c => ({ value: c.name, label: c.name }))]}
              value={adminSelectedCategory}
              onChange={setAdminSelectedCategory}
              multi
           />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
           {filteredCourses.map(course => (
             <motion.div 
              key={course.id} 
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="card" 
              style={{ padding: '30px', borderRadius: '32px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', overflow: 'hidden', border: '2px solid var(--border-color)' }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ width: '65px', height: '60px', borderRadius: '18px', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)', border: '1px solid var(--border-color)' }}>
                      <CourseIcon name={course.icon} size={35} />
                   </div>
                   <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => {
                        setEditingCourseId(course.id);
                        setSelectedCourse(course);
                        setNewCourse({ ...course, imageFile: null });
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="btn-secondary" style={{ padding: '12px', borderRadius: '15px' }}><Pencil size={20} /></button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="btn-secondary" style={{ padding: '12px', borderRadius: '15px', color: 'var(--primary-red)' }}><Trash size={20} /></button>
                   </div>
                </div>

                <div>
                   <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', fontWeight: '950', background: 'rgba(229, 57, 53, 0.12)', color: 'var(--primary-red)', padding: '5px 12px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{course.difficulty}</span>
                      <span style={{ fontSize: '10px', fontWeight: '950', background: 'var(--gray-bg)', color: 'var(--secondary-text)', padding: '5px 12px', borderRadius: '10px', textTransform: 'uppercase' }}>{course.category}</span>
                      {course.access_level === 'premium' && <span style={{ fontSize: '10px', fontWeight: '950', background: 'linear-gradient(45deg, #FFD700, #FFA500)', color: 'var(--text-color)', padding: '5px 12px', borderRadius: '10px' }}>PREMIUM</span>}
                   </div>
                   <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', lineHeight: '1.2' }}>{course.title}</h3>
                </div>

                <p style={{ fontSize: '15px', color: 'var(--secondary-text)', lineHeight: '1.6', margin: 0, height: '48px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {course.description}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--gray-bg)', paddingTop: '20px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <Book size={16} color="var(--primary-red)" />
                         <span style={{ fontSize: '14px', fontWeight: '800' }}>{course.lesson_count || 0} lecciones</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: course.points_price > 0 ? '#FFC107' : 'var(--primary-green)' }}>
                         {course.points_price > 0 ? `${course.points_price} TRS` : 'GRATIS'}
                      </div>
                   </div>
                   <button onClick={() => handleSelectCourse(course)} className="btn-secondary" style={{ padding: '12px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '900', background: 'var(--card-bg)', border: '2px solid var(--border-color)' }}>GESTIONAR LECCIONES <ChevronRight size={16} /></button>
                </div>
             </motion.div>
           ))}
        </div>
      </motion.div>
    );
  };

  const renderUsers = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px', alignItems: 'center' }}>
          <div>
             <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Comunidad de Inversores</h2>
             <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Monitorea el desempeño y gestiona los privilegios de la plataforma</p>
          </div>
          <div className="card" style={{ padding: '12px 30px', borderRadius: '18px', background: 'var(--gray-bg)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Users size={20} color="var(--primary-red)" />
             <span>{users.length} MIEMBROS</span>
          </div>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' }}>
          {users.map(user => (
            <motion.div 
              key={user.id} 
              whileHover={{ y: -5 }}
              className="card" 
              style={{ padding: '30px', borderRadius: '32px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', transition: 'all 0.3s' }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <div style={{ width: '55px', height: '55px', borderRadius: '20px', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', color: 'var(--secondary-text)', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                        {user.avatar_url ? <img src={`${API_BASE_URL}${user.avatar_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={24} />}
                     </div>
                     <div>
                        <div style={{ fontWeight: '950', fontSize: '19px' }}>{user.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '700' }}>{user.email}</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                     <select 
                       value={user.role} 
                       onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                       style={{ padding: '6px 12px', borderRadius: '10px', border: '2px solid var(--border-color)', background: 'var(--gray-bg)', color: 'var(--text-color)', fontWeight: '950', fontSize: '11px', textTransform: 'uppercase' }}
                     >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                     </select>
                     {user.subscription_status === 'premium' && (
                        <span style={{ background: 'linear-gradient(45deg, #FFD700, #FFA500)', color: 'black', padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '950', boxShadow: '0 5px 10px rgba(255, 165, 0, 0.2)' }}>PREMIUM</span>
                     )}
                  </div>
               </div>

               <div style={{ background: 'var(--gray-bg)', padding: '20px', borderRadius: '22px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                     <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--secondary-text)', marginBottom: '5px' }}>TOROS</div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#FF9800', fontWeight: '950' }}>
                        <BullCoin size={16} /> {user.points}
                     </div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 15px' }} />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                     <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--secondary-text)', marginBottom: '5px' }}>VIDAS</div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: 'var(--primary-red)', fontWeight: '950' }}>
                        <Zap size={16} /> {user.lives}
                     </div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 15px' }} />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                     <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--secondary-text)', marginBottom: '5px' }}>NIVEL</div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: 'var(--primary-green)', fontWeight: '950' }}>
                        <Trophy size={16} /> {user.level || 1}
                     </div>
                  </div>
               </div>

               <button 
                  className="btn-secondary" 
                  style={{ width: '100%', padding: '15px', borderRadius: '18px', fontWeight: '950', fontSize: '13px', background: 'transparent', border: '2px solid var(--border-color)' }}
                  onClick={() => {
                     const pts = prompt('Ajustar Toros (TRS):', user.points);
                     const lives = prompt('Ajustar Vidas:', user.lives);
                     if (pts !== null || lives !== null) {
                        handleUpdateUserStats(user.id, { 
                           points: pts !== null ? parseInt(pts) : user.points,
                           lives: lives !== null ? parseInt(lives) : user.lives
                        });
                     }
                  }}
               >
                  GESTIONAR BALANCE MANUAL
               </button>
            </motion.div>
          ))}
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
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px', alignItems: 'center' }}>
          <div>
             <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Páginas del Sistema</h2>
             <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Diseña y publica contenido dinámico sin escribir código</p>
          </div>
          <button className="btn-primary" onClick={async () => {
             const title = prompt('Título de la nueva página:');
             const slug = prompt('Slug identificador (ej: ayuda-premium):');
             if (title && slug) {
                const res = await fetch(`${API_BASE_URL}/api/pages`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                   body: JSON.stringify({ title, slug, content: '[]', is_published: false })
                });
                if (res.ok) { fetchPages(); toast.success('Página inicializada'); }
             }
          }} style={{ padding: '15px 30px', borderRadius: '18px' }}><Plus size={20} /> NUEVA PÁGINA</button>
       </div>

       {editingCMSPage && (
          <div className="card" style={{ marginBottom: '45px', padding: '40px', borderRadius: '35px', border: '3px solid var(--primary-red)', background: 'var(--card-bg)', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid var(--border-color)', paddingBottom: '25px' }}>
                <div>
                   <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '950', color: 'var(--primary-red)' }}>BUILDER: {editingCMSPage.title.toUpperCase()}</h3>
                   <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <code style={{ background: 'var(--gray-bg)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>/{editingCMSPage.slug}</code>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                   <button onClick={handleSaveCMSContent} className="btn-primary" style={{ padding: '12px 30px', fontSize: '14px' }}>GUARDAR CAMBIOS</button>
                   <button onClick={() => setEditingCMSPage(null)} className="btn-secondary" style={{ padding: '12px 25px' }}>SALIR</button>
                </div>
             </div>

             <div style={{ background: 'var(--gray-bg)', padding: '40px', borderRadius: '25px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '35px', border: '1px solid var(--border-color)' }}>
                {cmsBlocks.map((block, idx) => (
                  <motion.div 
                    key={idx} 
                    layout 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card" 
                    style={{ padding: '25px', position: 'relative', border: '2px solid transparent', transition: 'all 0.3s', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
                  >
                     <div style={{ position: 'absolute', right: '15px', top: '15px', display: 'flex', gap: '8px', zIndex: 10 }}>
                        <button onClick={() => moveBlock(idx, 'up')} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} /></button>
                        <button onClick={() => moveBlock(idx, 'down')} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--gray-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronDown size={14} /></button>
                        <button onClick={() => removeBlock(idx)} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary-red)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash size={14} /></button>
                     </div>
                     
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ background: 'var(--primary-red)', color: '#FFFFFF', padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>
                           {block.type === 'heading' ? 'Encabezado' : block.type === 'text' ? 'Párrafo de Texto' : block.type === 'image' ? 'Contenido Visual' : 'Separador'}
                        </div>
                     </div>

                     {block.type === 'heading' && (
                        <div style={{ display: 'flex', gap: '15px' }}>
                           <select value={block.level} onChange={e => updateBlock(idx, { level: parseInt(e.target.value) })} style={{ width: '80px', padding: '12px', borderRadius: '12px', background: 'var(--gray-bg)', color: 'var(--text-color)', border: '2px solid var(--border-color)', fontWeight: '900' }}>
                              <option value={1}>H1</option>
                              <option value={2}>H2</option>
                              <option value={3}>H3</option>
                           </select>
                           <input type="text" placeholder="Escribe el título aquí..." value={block.text} onChange={e => updateBlock(idx, { text: e.target.value })} style={{ flex: 1, padding: '12px 20px', borderRadius: '12px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '2px solid var(--border-color)', fontSize: block.level === 1 ? '24px' : '18px', fontWeight: '800' }} />
                        </div>
                     )}

                     {block.type === 'text' && (
                        <textarea placeholder="Redacta el contenido del bloque..." value={block.content} onChange={e => updateBlock(idx, { content: e.target.value })} style={{ width: '100%', minHeight: '150px', padding: '20px', borderRadius: '15px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '2px solid var(--border-color)', lineHeight: '1.7', fontSize: '16px' }} />
                     )}

                     {block.type === 'image' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                           <div>
                              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)' }}>URL DE LA IMAGEN</label>
                              <input type="text" placeholder="https://..." value={block.url} onChange={e => updateBlock(idx, { url: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '2px solid var(--border-color)' }} />
                           </div>
                           <div>
                              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '900', fontSize: '11px', color: 'var(--secondary-text)' }}>TEXTO ALT (SEO)</label>
                              <input type="text" placeholder="Descripción de la imagen" value={block.alt} onChange={e => updateBlock(idx, { alt: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '2px solid var(--border-color)' }} />
                           </div>
                        </div>
                     )}

                     {block.type === 'divider' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', height: '40px' }}>
                           <div style={{ flex: 1, height: '2px', background: 'var(--border-color)' }} />
                           <Minus size={20} color="var(--border-color)" />
                           <div style={{ flex: 1, height: '2px', background: 'var(--border-color)' }} />
                        </div>
                     )}
                  </motion.div>
                ))}

                {cmsBlocks.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--secondary-text)', fontStyle: 'italic', border: '2px dashed var(--border-color)', borderRadius: '20px' }}>Lienzo vacío. Utiliza los botones de abajo para añadir componentes.</div>}
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '950', textAlign: 'center', color: 'var(--secondary-text)', letterSpacing: '2px' }}>AÑADIR NUEVO COMPONENTE</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '25px', border: '2px dashed var(--border-color)', borderRadius: '25px', background: 'var(--gray-bg)' }}>
                   <button onClick={() => addBlock('heading')} className="btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', width: '120px', borderRadius: '20px' }}><Type size={28} /> <span style={{ fontSize: '11px', fontWeight: '900' }}>ENCABEZADO</span></button>
                   <button onClick={() => addBlock('text')} className="btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', width: '120px', borderRadius: '20px' }}><FileText size={28} /> <span style={{ fontSize: '11px', fontWeight: '900' }}>TEXTO</span></button>
                   <button onClick={() => addBlock('image')} className="btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', width: '120px', borderRadius: '20px' }}><Image size={28} /> <span style={{ fontSize: '11px', fontWeight: '900' }}>IMAGEN</span></button>
                   <button onClick={() => addBlock('divider')} className="btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', width: '120px', borderRadius: '20px' }}><Minus size={28} /> <span style={{ fontSize: '11px', fontWeight: '900' }}>SEPARADOR</span></button>
                </div>
             </div>

             <div style={{ marginTop: '35px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(76, 175, 80, 0.05)', padding: '20px', borderRadius: '15px' }}>
                <input type="checkbox" checked={editingCMSPage.is_published} onChange={e => setEditingCMSPage({...editingCMSPage, is_published: e.target.checked})} style={{ width: '22px', height: '22px' }} />
                <label style={{ fontWeight: '900', color: 'var(--primary-green)', cursor: 'pointer' }}>VISIBILIDAD: PUBLICADA INMEDIATAMENTE</label>
             </div>
          </div>
       )}

       <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {pages.map(page => (
            <div key={page.id} className="card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '32px', border: '2px solid var(--border-color)', transition: 'all 0.3s' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '950', fontSize: '20px', lineHeight: '1.2' }}>{page.title}</div>
                  <div style={{ fontSize: '10px', fontWeight: '950', padding: '5px 12px', borderRadius: '10px', background: page.is_published ? 'var(--primary-green)' : 'var(--gray-bg)', color: page.is_published ? 'white' : 'var(--secondary-text)', letterSpacing: '0.5px' }}>
                     {page.is_published ? 'PUBLICADA' : 'BORRADOR'}
                  </div>
               </div>
               <div style={{ fontSize: '14px', color: 'var(--secondary-text)', fontWeight: '700' }}>Ruta: <code style={{ color: 'var(--primary-red)', background: 'var(--gray-bg)', padding: '3px 8px', borderRadius: '6px' }}>/{page.slug}</code></div>
               <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button className="btn-secondary" style={{ flex: 1, fontWeight: '900', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'var(--card-bg)' }} onClick={() => { 
                    setEditingCMSPage(page); 
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    try {
                      const parsed = JSON.parse(page.content);
                      setCmsBlocks(Array.isArray(parsed) ? parsed : []);
                    } catch(e) {
                      setCmsBlocks([{ type: 'text', content: page.content }]);
                    }
                  }}>DISEÑADOR VISUAL</button>
                  <button className="btn-secondary" style={{ padding: '12px', color: 'var(--primary-red)', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'var(--card-bg)' }} onClick={async () => {
                     if (window.confirm('¿Seguro que quieres eliminar esta página permanentemente?')) {
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

