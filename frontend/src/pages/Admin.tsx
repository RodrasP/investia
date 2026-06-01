import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Tag, Megaphone, FileText, Settings, RefreshCw, LogOut, Shield, ShoppingBag, Globe
} from 'lucide-react';
import { SidebarItem, SafeRender } from './admin/Common';

// Modular Components
import Courses from './admin/Courses';
import CourseEditor from './admin/CourseEditor';
import CourseDetails from './admin/CourseDetails';
import LessonDetails from './admin/LessonDetails';
import UserManager from './admin/UserManager';
import ShopManager from './admin/ShopManager';
import TranslationManager from './admin/TranslationManager';
import CategoryManager from './admin/CategoryManager';
import Channels from './admin/Channels';
import PagesCMS from './admin/PagesCMS';

export default function Admin({ user, setUser }: { user: any, setUser: any }) {
  const [view, setView] = useState<'courses' | 'courseDetails' | 'lessonDetails' | 'courseEditor' | 'users' | 'channels' | 'settings' | 'categories' | 'pages' | 'translations' | 'shop'>('courses');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Navigation State
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const renderContent = () => {
    switch(view) {
      case 'courses': 
        return <Courses 
          onSelectCourse={(c: any) => { setSelectedCourse(c); setView('courseDetails'); }} 
          onEditCourse={(c: any) => { setEditingCourseId(c.id); setSelectedCourse(c); setView('courseEditor'); }}
          onCreateCourse={() => { setEditingCourseId(null); setSelectedCourse(null); setView('courseEditor'); }}
        />;
      
      case 'courseEditor':
        return <CourseEditor 
          editingCourseId={editingCourseId}
          selectedCourse={selectedCourse}
          onSave={() => setView('courses')}
          onCancel={() => setView('courses')}
        />;

      case 'courseDetails':
        return <CourseDetails 
          selectedCourse={selectedCourse}
          onBack={() => setView('courses')}
          onManageLesson={(l: any) => { setSelectedLesson(l); setView('lessonDetails'); }}
        />;

      case 'lessonDetails':
        return <LessonDetails 
          selectedLesson={selectedLesson}
          onBack={() => setView('courseDetails')}
          onUpdateLesson={() => {}}
        />;

      case 'users':
        return <UserManager />;

      case 'shop':
        return <ShopManager />;

      case 'translations':
        return <TranslationManager />;

      case 'categories':
        return <CategoryManager />;

      case 'channels':
        return <Channels />;

      case 'pages':
        return <PagesCMS />;

      case 'settings':
        return (
          <div className="card" style={{ padding: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0 }}>Ajustes Globales</h2>
            <p style={{ color: 'var(--secondary-text)', margin: '5px 0 30px 0', fontSize: '15px' }}>Configuración técnica de la plataforma</p>
            <div className="card" style={{ padding: '30px', background: 'var(--gray-bg)', border: '2px dashed var(--border-color)', textAlign: 'center' }}>
               <Settings size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
               <p style={{ fontWeight: '700' }}>Configuración avanzada de API y Seguridad próximamente.</p>
            </div>
          </div>
        );

      default:
        return <Courses onSelectCourse={(c: any) => { setSelectedCourse(c); setView('courseDetails'); }} onEditCourse={() => {}} onCreateCourse={() => {}} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-bg)', position: 'relative' }}>
      {/* Sidebar - Sticky */}
      <div style={{ 
        width: isSidebarCollapsed ? '100px' : '280px', 
        background: 'var(--card-bg)', 
        borderRight: '2px solid var(--border-color)', 
        padding: '30px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        position: 'sticky',
        top: '0',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', padding: '0 10px' }}>
           <div style={{ width: '45px', height: '45px', background: 'var(--primary-red)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Shield size={24} />
           </div>
           {!isSidebarCollapsed && <span style={{ fontWeight: '950', fontSize: '20px', letterSpacing: '1px' }}>ADMIN</span>}
        </div>

        <SidebarItem icon={LayoutDashboard} label="Cursos" active={view === 'courses' || view === 'courseDetails' || view === 'lessonDetails' || view === 'courseEditor'} onClick={() => setView('courses')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={Users} label="Usuarios" active={view === 'users'} onClick={() => setView('users')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={Tag} label="Categorías" active={view === 'categories'} onClick={() => setView('categories')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={ShoppingBag} label="Tienda" active={view === 'shop'} onClick={() => setView('shop')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={Globe} label="Traducciones" active={view === 'translations'} onClick={() => setView('translations')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={Megaphone} label="Canales" active={view === 'channels'} onClick={() => setView('channels')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={FileText} label="Páginas CMS" active={view === 'pages'} onClick={() => setView('pages')} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={Settings} label="Ajustes" active={view === 'settings'} onClick={() => setView('settings')} collapsed={isSidebarCollapsed} />
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SidebarItem icon={RefreshCw} label="Colapsar" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={LogOut} label="Salir" onClick={handleLogout} collapsed={isSidebarCollapsed} />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, padding: '40px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
