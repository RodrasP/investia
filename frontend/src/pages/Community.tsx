import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, TrendingUp, Zap, HelpCircle, Award, 
  MessageSquare, User as UserIcon, Calendar, Eye, 
  ArrowRight, Plus, Send, ChevronRight, Hash, Trash2,
  Rss, Megaphone, Info as InfoIcon, Settings, Search, Bell
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  icon: string;
}

interface Thread {
  id: number;
  title: string;
  content: string;
  user_name: string;
  user_avatar: string;
  user_level: number;
  category_name?: string;
  category_name_en?: string;
  reply_count: number;
  views: number;
  created_at: string;
}

const CategoryIcon = ({ name, size = 24 }: { name: string, size?: number }) => {
  const icons: any = { MessageCircle, TrendingUp, Zap, HelpCircle, Award };
  const Icon = icons[name] || MessageSquare;
  return <Icon size={size} />;
};

export default function Community({ user, language }: { user: any, language: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryThreads, setCategoryThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [view, setView] = useState<'home' | 'category' | 'thread' | 'channels' | 'my-channel' | 'view-channel'>('home');
  const [loading, setLoading] = useState(true);
  const [newThreadModal, setNewThreadModal] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', categoryId: 0 });
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, type: 'thread' | 'reply', id: number | null }>({ show: false, type: 'thread', id: null });

  // Channels state
  const [discoverChannels, setDiscoverChannels] = useState<any[]>([]);
  const [myChannel, setMyChannel] = useState<any>(null);
  const [myApplication, setMyApplication] = useState<any>(null);
  const [appMessages, setAppMessages] = useState<any[]>([]);
  const [channelUpdates, setChannelUpdates] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [newUpdate, setNewUpdate] = useState('');
  const [appMessageInput, setAppMessageInput] = useState('');
  const [applyReason, setReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();
  const isEn = language === 'en';
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (view === 'my-channel' && appMessages.length > 0) {
      scrollToBottom();
    }
  }, [appMessages, view]);

  useEffect(() => {
    fetchData();
    const tab = searchParams.get('tab');
    if (tab === 'my-channel') {
      handleMyChannel();
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, recentRes, channelsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/community/categories`),
        fetch(`${API_BASE_URL}/api/community/threads/recent`),
        fetch(`${API_BASE_URL}/api/community/channels/discover`)
      ]);
      const cats = await catsRes.json();
      const recent = await recentRes.json();
      const channels = await channelsRes.json();
      setCategories(Array.isArray(cats) ? cats : []);
      setRecentThreads(Array.isArray(recent) ? recent : []);
      setDiscoverChannels(Array.isArray(channels) ? channels : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setCategories([]);
      setRecentThreads([]);
      setLoading(false);
    }
  };

  const handleMyChannel = async () => {
    setLoading(true);
    setView('my-channel');
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/my-channel-status`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMyChannel(data.channel);
      setMyApplication(data.application);
      
      if (data.channel?.status === 'approved') {
        const updatesRes = await fetch(`${API_BASE_URL}/api/community/channels/${data.channel.id}/updates`);
        const updates = await updatesRes.json();
        setChannelUpdates(updates);
      } else if (data.application) {
        const msgRes = await fetch(`${API_BASE_URL}/api/community/application/${data.application.id}/messages`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const messages = await msgRes.json();
        setAppMessages(messages);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyReason.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/apply-channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: applyReason })
      });
      if (res.ok) {
        toast.success(isEn ? 'Application sent!' : 'Solicitud enviada');
        handleMyChannel();
      }
    } catch (err) {} finally { setSubmitting(false); }
  };

  const sendAppMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appMessageInput.trim() || !myApplication) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/application/${myApplication.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: appMessageInput })
      });
      if (res.ok) {
        setAppMessageInput('');
        const msgRes = await fetch(`${API_BASE_URL}/api/community/application/${myApplication.id}/messages`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setAppMessages(await msgRes.json());
      }
    } catch (err) {} finally { setSubmitting(false); }
  };

  const handleViewChannel = async (channel: any) => {
    setLoading(true);
    setSelectedChannel(channel);
    setView('view-channel');
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/channels/${channel.id}/updates`);
      const updates = await res.json();
      setChannelUpdates(updates);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const postChannelUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/my-channel/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newUpdate })
      });
      if (res.ok) {
        setNewUpdate('');
        handleMyChannel();
        toast.success(isEn ? 'Update posted!' : '¡Actualización publicada!');
      }
    } catch (err) {
      toast.error('Error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(@[a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} style={{ color: 'var(--primary-red)', fontWeight: '900', background: 'rgba(229, 57, 53, 0.1)', padding: '2px 6px', borderRadius: '6px' }}>{part}</span>;
      }
      return part;
    });
  };

  const insertMention = (name: string) => {
    const formattedName = name.replace(/\s+/g, '_');
    setReplyContent(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + `@${formattedName} `);
    document.querySelector('textarea')?.focus();
  };

  const handleCategoryClick = async (cat: Category) => {
    setLoading(true);
    setSelectedCategory(cat);
    setView('category');
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/threads/${cat.id}`);
      const data = await res.json();
      setCategoryThreads(data);
      setLoading(false);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleThreadClick = async (threadId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/thread/${threadId}`);
      const data = await res.json();
      setSelectedThread(data);
      setView('thread');
      setLoading(false);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(isEn ? 'Please login to post' : 'Inicia sesión para publicar');
      return;
    }
    if (!newThread.title || !newThread.content || !newThread.categoryId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newThread)
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(isEn ? 'Thread created!' : '¡Tema creado!');
        setNewThreadModal(false);
        setNewThread({ title: '', content: '', categoryId: 0 });
        handleThreadClick(data.id);
      }
    } catch (err) {
      toast.error('Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(isEn ? 'Please login to reply' : 'Inicia sesión para responder');
      return;
    }
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ threadId: selectedThread.id, content: replyContent })
      });
      if (res.ok) {
        setReplyContent('');
        handleThreadClick(selectedThread.id); // Refresh
        toast.success(isEn ? 'Reply posted!' : '¡Respuesta enviada!');
      }
    } catch (err) {
      toast.error('Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteThread = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/threads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success(isEn ? 'Deleted' : 'Borrado');
        setView('home');
        fetchData();
        setConfirmModal({ show: false, type: 'thread', id: null });
      }
    } catch (err) {
      toast.error('Error');
    }
  };

  const handleDeleteReply = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/replies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success(isEn ? 'Deleted' : 'Borrado');
        handleThreadClick(selectedThread.id);
        setConfirmModal({ show: false, type: 'reply', id: null });
      }
    } catch (err) {
      toast.error('Error');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isEn ? 'en-US' : 'es-ES', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading && (view === 'home' || view === 'channels')) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}>Cargando...</div>;

  return (
    <div className="container wide" style={{ marginTop: '40px', paddingBottom: '100px' }}>
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
        <button 
          onClick={() => { setView('home'); setSelectedCategory(null); }}
          style={{ background: 'none', border: 'none', color: view === 'home' || view === 'category' || view === 'thread' ? 'var(--primary-red)' : 'var(--secondary-text)', fontWeight: '900', fontSize: '18px', cursor: 'pointer', position: 'relative' }}
        >
          {isEn ? 'FORUM' : 'FORO'}
          {(view === 'home' || view === 'category' || view === 'thread') && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: '-22px', left: 0, right: 0, height: '4px', background: 'var(--primary-red)', borderRadius: '2px' }} />}
        </button>
        <button 
          onClick={() => { setView('channels'); }}
          style={{ background: 'none', border: 'none', color: view === 'channels' || view === 'my-channel' || view === 'view-channel' ? 'var(--primary-red)' : 'var(--secondary-text)', fontWeight: '900', fontSize: '18px', cursor: 'pointer', position: 'relative' }}
        >
          {isEn ? 'CHANNELS' : 'CANALES'}
          {(view === 'channels' || view === 'my-channel' || view === 'view-channel') && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: '-22px', left: 0, right: 0, height: '4px', background: 'var(--primary-red)', borderRadius: '2px' }} />}
        </button>
      </div>

      <div className="flex-responsive" style={{ gap: '40px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          {view === 'home' || view === 'category' || view === 'thread' ? (
            <>
              <div style={{ background: 'var(--card-bg)', borderRadius: '24px', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', fontWeight: '900', textTransform: 'uppercase', fontSize: '14px', color: 'var(--secondary-text)' }}>
                  {isEn ? 'Categories' : 'Categorías'}
                </div>
                {categories.map(cat => (
                  <div 
                    key={cat.id} 
                    onClick={() => handleCategoryClick(cat)}
                    style={{ 
                      padding: '15px 20px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px',
                      background: selectedCategory?.id === cat.id ? 'var(--gray-bg)' : 'transparent',
                      color: selectedCategory?.id === cat.id ? 'var(--primary-red)' : 'var(--text-color)',
                      transition: 'all 0.2s',
                      borderLeft: selectedCategory?.id === cat.id ? '4px solid var(--primary-red)' : '4px solid transparent'
                    }}
                  >
                    <div style={{ color: selectedCategory?.id === cat.id ? 'var(--primary-red)' : 'var(--secondary-text)' }}>
                      <CategoryIcon name={cat.icon} size={20} />
                    </div>
                    <div style={{ fontWeight: '800' }}>{isEn ? cat.name_en : cat.name}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ background: 'var(--card-bg)', borderRadius: '24px', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', fontWeight: '900', textTransform: 'uppercase', fontSize: '14px', color: 'var(--secondary-text)' }}>
                {isEn ? 'Broadcast' : 'Difusión'}
              </div>
              <div 
                onClick={() => setView('channels')}
                style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', background: view === 'channels' ? 'var(--gray-bg)' : 'transparent', color: view === 'channels' ? 'var(--primary-red)' : 'var(--text-color)', borderLeft: view === 'channels' ? '4px solid var(--primary-red)' : '4px solid transparent' }}
              >
                <Search size={20} /> <div style={{ fontWeight: '800' }}>{isEn ? 'Discover' : 'Descubrir'}</div>
              </div>
              {user && (
                <div 
                  onClick={handleMyChannel}
                  style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', background: view === 'my-channel' ? 'var(--gray-bg)' : 'transparent', color: view === 'my-channel' ? 'var(--primary-red)' : 'var(--text-color)', borderLeft: view === 'my-channel' ? '4px solid var(--primary-red)' : '4px solid transparent' }}
                >
                  <Megaphone size={20} /> <div style={{ fontWeight: '800' }}>{isEn ? 'My Channel' : 'Mi Canal'}</div>
                </div>
              )}
            </div>
          )}
          
          <div style={{ marginTop: '30px', background: 'var(--accent-light)', borderRadius: '24px', padding: '25px', border: '1px solid var(--primary-red)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-red)' }}>{isEn ? 'Info' : 'Información'}</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-color)', lineHeight: '1.6', margin: 0 }}>
              {view === 'channels' || view === 'my-channel' || view === 'view-channel' 
                ? (isEn ? 'Channels are one-way broadcast spaces for investors to share updates.' : 'Los canales son espacios de difusión para que los inversores compartan novedades.')
                : (isEn ? 'Participate in the forum to earn XP and help others.' : 'Participa en el foro para ganar XP y ayudar a otros.')}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>{isEn ? 'Recent Discussions' : 'Discusiones Recientes'}</h3>
                  {user && (
                    <button onClick={() => setNewThreadModal(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                      <Plus size={16} /> {isEn ? 'New Thread' : 'Nuevo Hilo'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {recentThreads.length > 0 ? recentThreads.map(thread => (
                    <ThreadCard key={thread.id} thread={thread} onClick={() => handleThreadClick(thread.id)} isEn={isEn} formatDate={formatDate} />
                  )) : <div style={{ textAlign: 'center', padding: '60px', color: 'var(--secondary-text)' }}>{isEn ? 'No discussions yet.' : 'No hay discusiones aún.'}</div>}
                </div>
              </motion.div>
            )}

            {view === 'category' && (
              <motion.div key="category" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: 'bold', cursor: 'pointer' }}>{isEn ? 'Community' : 'Comunidad'}</button>
                  <ChevronRight size={16} color="var(--secondary-text)" />
                  <span style={{ color: 'var(--secondary-text)', fontWeight: 'bold' }}>{isEn ? selectedCategory?.name_en : selectedCategory?.name}</span>
                </div>
                <h3 style={{ marginBottom: '25px' }}>{isEn ? selectedCategory?.description_en : selectedCategory?.description}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {categoryThreads.map(thread => (
                    <ThreadCard key={thread.id} thread={thread} onClick={() => handleThreadClick(thread.id)} isEn={isEn} formatDate={formatDate} />
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'thread' && selectedThread && (
              <motion.div key="thread" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                  <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: 'bold', cursor: 'pointer' }}>{isEn ? 'Community' : 'Comunidad'}</button>
                  <ChevronRight size={16} color="var(--secondary-text)" />
                  <span style={{ color: 'var(--secondary-text)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedThread.title}</span>
                </div>

                <div style={{ background: 'var(--card-bg)', borderRadius: '24px', border: '2px solid var(--border-color)', marginBottom: '30px', padding: '30px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--gray-bg)', overflow: 'hidden' }}>
                          {selectedThread.user_avatar ? <img src={`${API_BASE_URL}${selectedThread.user_avatar}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={20} /></div>}
                        </div>
                        <div>
                          <div style={{ fontWeight: '900', cursor: 'pointer' }} onClick={() => insertMention(selectedThread.user_name)}>{selectedThread.user_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Lvl {selectedThread.user_level} • {formatDate(selectedThread.created_at)}</div>
                        </div>
                      </div>
                      {user?.role === 'admin' && <button onClick={() => setConfirmModal({ show: true, type: 'thread', id: selectedThread.id })} style={{ background: 'none', border: 'none', color: '#FF4B4B', cursor: 'pointer' }}><Trash2 size={20} /></button>}
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>{selectedThread.title}</h1>
                    <div style={{ lineHeight: '1.8', fontSize: '16px', color: 'var(--text-color)', whiteSpace: 'pre-wrap' }}>{renderContent(selectedThread.content)}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                  {selectedThread.replies?.map((reply: any) => (
                    <div key={reply.id} style={{ background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--gray-bg)', overflow: 'hidden' }}>
                            {reply.user_avatar ? <img src={`${API_BASE_URL}${reply.user_avatar}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={16} />}
                          </div>
                          <div>
                            <span style={{ fontWeight: '900', cursor: 'pointer' }} onClick={() => insertMention(reply.user_name)}>{reply.user_name}</span>
                            <span style={{ color: 'var(--secondary-text)', fontSize: '12px', marginLeft: '10px' }}>{formatDate(reply.created_at)}</span>
                          </div>
                        </div>
                        {user?.role === 'admin' && <button onClick={() => setConfirmModal({ show: true, type: 'reply', id: reply.id })} style={{ background: 'none', border: 'none', color: '#FF4B4B', cursor: 'pointer' }}><Trash2 size={16} /></button>}
                      </div>
                      <div style={{ lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{renderContent(reply.content)}</div>
                    </div>
                  ))}
                </div>

                {user ? (
                  <form onSubmit={handlePostReply} style={{ background: 'var(--gray-bg)', borderRadius: '24px', padding: '30px', border: '2px solid var(--border-color)' }}>
                    <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={isEn ? 'Reply...' : 'Responder...'} style={{ width: '100%', minHeight: '100px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px', marginBottom: '15px', color: 'var(--text-color)' }} required />
                    <button type="submit" disabled={submitting} className="btn-primary"><Send size={18} /> {isEn ? 'Send' : 'Enviar'}</button>
                  </form>
                ) : <div style={{ textAlign: 'center', padding: '20px' }}>{isEn ? 'Login to reply' : 'Inicia sesión para responder'}</div>}
              </motion.div>
            )}

            {view === 'channels' && (
              <motion.div key="channels" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h3 style={{ marginBottom: '25px' }}>{isEn ? 'Discover Channels' : 'Descubrir Canales'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                  {discoverChannels.map(channel => (
                    <motion.div key={channel.id} whileHover={{ y: -5 }} onClick={() => handleViewChannel(channel)} style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '24px', border: '2px solid var(--border-color)', cursor: 'pointer', textAlign: 'center' }}>
                       <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gray-bg)', margin: '0 auto 15px', overflow: 'hidden' }}>
                          {channel.user_avatar ? <img src={`${API_BASE_URL}${channel.user_avatar}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={30} style={{ margin: '15px' }} />}
                       </div>
                       <h4 style={{ marginBottom: '5px' }}>{channel.name}</h4>
                       <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginBottom: '15px' }}>{channel.description}</p>
                       <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary-red)', background: 'var(--accent-light)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block' }}>
                         {channel.follower_count} {isEn ? 'Followers' : 'Seguidores'}
                       </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'my-channel' && (
              <motion.div key="my-channel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {myChannel?.status === 'approved' ? (
                  <>
                    <div style={{ background: 'var(--primary-red)', borderRadius: '30px', padding: '40px', color: 'white', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>{myChannel.name}</h2>
                        <p style={{ opacity: 0.9, fontSize: '16px' }}>{myChannel.description}</p>
                      </div>
                      <Megaphone size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} />
                    </div>

                    <form onSubmit={postChannelUpdate} style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '25px', border: '2px solid var(--border-color)', marginBottom: '40px' }}>
                      <h4 style={{ marginBottom: '15px' }}>{isEn ? 'Post an Update' : 'Publicar Novedad'}</h4>
                      <textarea value={newUpdate} onChange={(e) => setNewUpdate(e.target.value)} placeholder={isEn ? 'Share something with your followers...' : 'Comparte algo con tus seguidores...'} style={{ width: '100%', minHeight: '100px', background: 'var(--gray-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px', marginBottom: '15px', color: 'var(--text-color)' }} required />
                      <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '12px 30px' }}><Send size={18} /> {isEn ? 'Broadcast' : 'Difundir'}</button>
                    </form>

                    <h3 style={{ marginBottom: '20px' }}>{isEn ? 'My Updates' : 'Mis Publicaciones'}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {channelUpdates.map(update => (
                        <div key={update.id} style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '10px' }}>{formatDate(update.created_at)}</div>
                            <div style={{ fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{update.content}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : myApplication ? (
                  <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div style={{ background: 'var(--gray-bg)', borderRadius: '30px', padding: '40px', border: '2px solid var(--border-color)', marginBottom: '30px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                          <div style={{ background: 'var(--primary-yellow)', color: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Megaphone size={20} />
                          </div>
                          <div>
                            <h2 style={{ fontSize: '22px', fontWeight: '900' }}>{isEn ? 'Application Under Review' : 'Solicitud en Revisión'}</h2>
                            <p style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>{isEn ? 'An admin is reviewing your channel request.' : 'Un administrador está revisando tu solicitud.'}</p>
                          </div>
                       </div>

                       <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                          {appMessages.map(m => (
                            <div key={m.id} style={{ alignSelf: m.sender_id === user.id ? 'flex-end' : 'flex-start', maxWidth: '80%', background: m.sender_id === user.id ? 'var(--primary-red)' : 'var(--card-bg)', color: m.sender_id === user.id ? 'white' : 'var(--text-color)', padding: '15px 20px', borderRadius: '20px', border: m.sender_id === user.id ? 'none' : '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                               <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '5px' }}>{m.sender_name} • {formatDate(m.created_at)}</div>
                               <div style={{ fontSize: '15px' }}>{m.message}</div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                       </div>

                       <form onSubmit={sendAppMessage} style={{ display: 'flex', gap: '10px' }}>
                          <input type="text" value={appMessageInput} onChange={(e) => setAppMessageInput(e.target.value)} placeholder={isEn ? 'Write a message...' : 'Escribe un mensaje...'} style={{ flexGrow: 1, padding: '12px 20px', background: 'var(--card-bg)', border: '2px solid var(--border-color)', borderRadius: '15px', color: 'var(--text-color)' }} />
                          <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '0 20px' }}><Send size={20} /></button>
                       </form>
                    </div>
                  </div>
                ) : (
                  <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
                     <div style={{ background: 'var(--accent-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', color: 'var(--primary-red)' }}>
                        <Megaphone size={40} />
                     </div>
                     <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '20px' }}>{isEn ? 'Create Your Own Channel' : 'Crea tu Propio Canal'}</h2>
                     <p style={{ color: 'var(--secondary-text)', fontSize: '18px', lineHeight: '1.6', marginBottom: '40px' }}>
                       {isEn ? 'Share your investment strategies and market updates with the community. You need admin approval to start broadcasting.' : 'Comparte tus estrategias y novedades del mercado con la comunidad. Necesitas aprobación para empezar a difundir.'}
                     </p>
                     <form onSubmit={handleApply} style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '30px', border: '2px solid var(--border-color)' }}>
                        <h4 style={{ marginBottom: '20px', textAlign: 'left' }}>{isEn ? 'Why do you want a channel?' : '¿Por qué quieres un canal?'}</h4>
                        <textarea value={applyReason} onChange={(e) => setReason(e.target.value)} placeholder={isEn ? 'Describe what you plan to share...' : 'Describe qué piensas compartir...'} style={{ width: '100%', minHeight: '120px', padding: '15px', background: 'var(--gray-bg)', border: '1px solid var(--border-color)', borderRadius: '15px', marginBottom: '20px', color: 'var(--text-color)' }} required />
                        <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', padding: '15px' }}>{isEn ? 'Send Application' : 'Enviar Solicitud'}</button>
                     </form>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'view-channel' && selectedChannel && (
              <motion.div key="view-channel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => setView('channels')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}><ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> {isEn ? 'Back to Discovery' : 'Volver a Descubrir'}</button>
                
                <div style={{ background: 'var(--gray-bg)', borderRadius: '30px', padding: '40px', border: '2px solid var(--border-color)', marginBottom: '30px', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--card-bg)', margin: '0 auto 20px', overflow: 'hidden' }}>
                      {selectedChannel.user_avatar ? <img src={`${API_BASE_URL}${selectedChannel.user_avatar}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={40} style={{ margin: '20px' }} />}
                    </div>
                    <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>{selectedChannel.name}</h2>
                    <p style={{ color: 'var(--secondary-text)', fontSize: '16px', maxWidth: '600px', margin: '0 auto 20px' }}>{selectedChannel.description}</p>
                    <button className="btn-primary" style={{ padding: '10px 30px' }}><Bell size={18} /> {isEn ? 'Follow' : 'Seguir'}</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   {channelUpdates.length > 0 ? channelUpdates.map(update => (
                     <div key={update.id} style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '10px' }}>{formatDate(update.created_at)}</div>
                        <div style={{ fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{update.content}</div>
                     </div>
                   )) : <div style={{ textAlign: 'center', padding: '60px', color: 'var(--secondary-text)' }}>{isEn ? 'No updates yet.' : 'No hay novedades aún.'}</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Thread Modal */}
      <AnimatePresence>
        {newThreadModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setNewThreadModal(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '30px', border: '4px solid var(--border-color)', width: '100%', maxWidth: '700px', position: 'relative', zIndex: 10001 }}
            >
              <h2 style={{ marginBottom: '30px' }}>{isEn ? 'Start a New Discussion' : 'Iniciar Nueva Discusión'}</h2>
              <form onSubmit={handleCreateThread} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: 'var(--secondary-text)' }}>{isEn ? 'Category' : 'Categoría'}</label>
                  <select 
                    value={newThread.categoryId}
                    onChange={(e) => setNewThread({...newThread, categoryId: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '12px', background: 'var(--gray-bg)', border: '2px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-color)' }}
                  >
                    <option value={0}>{isEn ? 'Select category' : 'Selecciona categoría'}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{isEn ? c.name_en : c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: 'var(--secondary-text)' }}>{isEn ? 'Title' : 'Título'}</label>
                  <input type="text" value={newThread.title} onChange={(e) => setNewThread({...newThread, title: e.target.value})} placeholder={isEn ? 'What is on your mind?' : '¿Qué tienes en mente?'} style={{ width: '100%', padding: '15px', background: 'var(--gray-bg)', border: '2px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-color)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: 'var(--secondary-text)' }}>{isEn ? 'Message' : 'Mensaje'}</label>
                  <textarea value={newThread.content} onChange={(e) => setNewThread({...newThread, content: e.target.value})} placeholder={isEn ? 'Share your thoughts...' : 'Comparte tus pensamientos...'} style={{ width: '100%', minHeight: '200px', padding: '15px', background: 'var(--gray-bg)', border: '2px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-color)' }} required />
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button type="submit" disabled={submitting} className="btn-primary" style={{ flexGrow: 1 }}>{isEn ? 'Post Discussion' : 'Publicar Discusión'}</button>
                  <button type="button" onClick={() => setNewThreadModal(false)} className="btn-secondary" style={{ flexGrow: 1 }}>{isEn ? 'Cancel' : 'Cancelar'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }} onClick={() => setConfirmModal({ ...confirmModal, show: false })} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '32px', border: '4px solid var(--border-color)', width: '100%', maxWidth: '450px', position: 'relative', zIndex: 11001, textAlign: 'center' }}>
              <div style={{ background: 'rgba(255, 75, 75, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#FF4B4B' }}><Trash2 size={32} /></div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>{isEn ? 'Are you sure?' : '¿Estás seguro?'}</h2>
              <p style={{ color: 'var(--secondary-text)', lineHeight: '1.6', marginBottom: '30px' }}>{isEn ? 'This will be permanently deleted.' : 'Esto se borrará permanentemente.'}</p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => confirmModal.id && (confirmModal.type === 'thread' ? handleDeleteThread(confirmModal.id) : handleDeleteReply(confirmModal.id))} className="btn-primary" style={{ flexGrow: 1, background: '#FF4B4B', borderColor: '#FF4B4B' }}>{isEn ? 'Delete' : 'Borrar'}</button>
                <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="btn-secondary" style={{ flexGrow: 1 }}>{isEn ? 'Cancel' : 'Cancelar'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThreadCard({ thread, onClick, isEn, formatDate }: { thread: Thread, onClick: () => void, isEn: boolean, formatDate: any }) {
  return (
    <motion.div whileHover={{ y: -5, borderColor: 'var(--primary-red)' }} onClick={onClick} style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '24px', border: '2px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '20px' }}>
      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          {thread.category_name && <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary-red)', background: 'var(--accent-light)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>{isEn ? thread.category_name_en : thread.category_name}</span>}
          <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{formatDate(thread.created_at)}</span>
        </div>
        <h4 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-color)', marginBottom: '12px' }}>{thread.title}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gray-bg)', overflow: 'hidden' }}>{thread.user_avatar ? <img src={`${API_BASE_URL}${thread.user_avatar}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={12} color="var(--secondary-text)" />}</div>
             <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary-text)' }}>{thread.user_name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--secondary-text)', fontSize: '13px' }}><MessageSquare size={14} /> <span>{thread.reply_count}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--secondary-text)', fontSize: '13px' }}><Eye size={14} /> <span>{thread.views}</span></div>
        </div>
      </div>
      <div style={{ alignSelf: 'center', color: 'var(--border-color)' }}><ArrowRight size={24} /></div>
    </motion.div>
  );
}
