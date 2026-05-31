import { API_BASE_URL } from '../config';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Book, Play, CheckCircle, Lock, Search, Filter, ArrowUpDown, Tag, ChevronDown, Star,
  TrendingUp, TrendingDown, ShieldCheck, Zap, Award, DollarSign, PieChart, 
  Briefcase, Target, Wallet, Coins, Globe, Landmark, Activity, BarChart, 
  LineChart, Layers, Database, Cpu, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BullCoin from '../components/BullCoin';
import VestiaIcon from '../components/VestiaIcon';
import Tutorial from '../components/Tutorial';


const PremiumModal = ({ onPricing, onClose, onRedeem, pointsPrice, userPoints }: { onPricing: () => void, onClose: () => void, onRedeem: () => void, pointsPrice: number, userPoints: number }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      style={{
        backgroundColor: 'var(--card-bg)',
        padding: '40px',
        borderRadius: '24px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        border: '4px solid var(--border-color)',
        color: 'var(--text-color)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <BullCoin size={80} />
      </div>
      <h2 style={{ margin: 0, color: '#1976D2' }}>Contenido Premium</h2>
      <p style={{ color: 'var(--secondary-text)', lineHeight: '1.5' }}>
        Este curso es exclusivo para miembros Premium de Investia. 
        Suscríbete para desbloquear todo el contenido o canjea tus toros.
      </p>
      
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary" 
        onClick={onPricing}
        style={{ width: '100%', padding: '15px' }}
      >
        VER PLANES PREMIUM
      </motion.button>

      {pointsPrice > 0 && (
        <motion.button 
          whileHover={userPoints >= pointsPrice ? { scale: 1.02 } : {}}
          whileTap={userPoints >= pointsPrice ? { scale: 0.98 } : {}}
          className="btn-secondary" 
          onClick={onRedeem}
          disabled={userPoints < pointsPrice}
          style={{ 
            width: '100%', 
            padding: '15px', 
            background: 'rgba(255, 176, 46, 0.1)', 
            borderColor: 'var(--primary-yellow)', 
            color: 'var(--primary-yellow-hover)',
            opacity: userPoints < pointsPrice ? 0.6 : 1,
            cursor: userPoints < pointsPrice ? 'not-allowed' : 'pointer'
          }}
        >
          Canjear por {pointsPrice} toros (TRS)
          {userPoints < pointsPrice && <div style={{ fontSize: '11px', marginTop: '2px' }}>Necesitas {pointsPrice - userPoints} toros más</div>}
        </motion.button>
      )}

      <button 
        className="btn-secondary" 
        onClick={onClose}
        style={{ width: '100%', border: 'none', color: 'var(--secondary-text)', background: 'none', boxShadow: 'none' }}
      >
        Quizás más tarde
      </button>
    </motion.div>
  </motion.div>
);

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
          <div key="dropdown-wrapper">
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
                      fontSize: '13px'
                    }}
                  />
                </div>
              )}
              <div className="no-scrollbar" style={{ overflowY: 'auto', flexGrow: 1 }}>
                {(filteredOptions || []).map((opt: any) => {
                  if (!opt) return null;
                  const isSelected = multi 
                    ? (Array.isArray(value) && value.includes(opt.value))
                    : value === opt.value;
                  
                  return (
                    <motion.div
                      key={opt.value}
                      whileHover={{ background: 'var(--gray-bg)', x: 5 }}
                      onClick={() => handleSelect(opt.value)}
                      style={{
                        padding: '10px 15px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: isSelected ? '800' : '600',
                        color: isSelected ? 'var(--primary-red)' : 'var(--text-color)',
                        background: isSelected ? 'var(--accent-light)' : 'transparent',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <span style={{ fontWeight: 'bold', color: 'var(--primary-red)' }}>✓</span>}
                    </motion.div>
                  );
                })}
                {filteredOptions.length === 0 && (
                  <div style={{ padding: '15px', textAlign: 'center', color: 'var(--secondary-text)', fontSize: '13px' }}>
                    No se encontraron resultados
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CourseCard = ({ course, user, t, language, getT, onAction, isEnrolled }: { course: any, user: any, t: any, language: string, getT: any, onAction: (course: any) => void, isEnrolled: boolean }) => {
  const isLocked = course.access_level === 'premium' && user?.subscription_status !== 'premium' && !isEnrolled;
  
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced': return t[language].advanced;
      case 'intermediate': return t[language].intermediate;
      default: return t[language].beginner;
    }
  };

  const getDifficultyImage = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced': return '/logorojo.jpeg';
      case 'intermediate': return '/logoamarillo.png';
      default: return '/logoverde.png';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      style={{ 
        background: 'var(--card-bg)', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        border: '2px solid var(--border-color)',
        position: 'relative',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        opacity: isLocked ? 0.9 : 1
      }}
    >
      {/* Card Header/Image Area */}
      <div style={{ 
        height: '140px', 
        background: course.image_url 
          ? `url(${API_BASE_URL}${course.image_url}) center/cover no-repeat`
          : isLocked ? `linear-gradient(135deg, #424242 0%, #212121 100%)` : 'none',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: course.difficulty === 'advanced' || isLocked ? 'white' : 'black',
        overflow: 'hidden'
      }}>
        {!course.image_url && !isLocked && (
          <img 
            src={getDifficultyImage(course.difficulty)} 
            alt={course.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        )}
        {!course.image_url && isLocked && <Lock size={48} />}
        
        <div style={{ 
          position: 'absolute', 
          top: '15px', 
          right: '15px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px' 
        }}>
          {course.access_level === 'premium' && (
            <span style={{ 
              background: 'var(--star-yellow)', 
              color: '#000', 
              fontSize: '11px', 
              fontWeight: '900', 
              padding: '4px 10px', 
              borderRadius: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <BullCoin size={12} /> PREMIUM
            </span>
          )}
          <span style={{ 
            background: 'rgba(255,255,255,0.2)', 
            backdropFilter: 'blur(5px)',
            color: 'white', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            padding: '4px 10px', 
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Tag size={10} /> {getT(course, "category")}
          </span>
          <span style={{ 
            background: 'rgba(0,0,0,0.3)', 
            backdropFilter: 'blur(5px)',
            color: 'white', 
            fontSize: '10px', 
            fontWeight: '900', 
            padding: '4px 10px', 
            borderRadius: '20px',
            textTransform: 'uppercase'
          }}>
            {getDifficultyLabel(course.difficulty)}
          </span>
        </div>
      </div>

      <div style={{ padding: '25px 20px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '20px', lineHeight: '1.2' }}>{getT(course, "title")}</h3>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(3)].map((_, i) => (
                <Star key={i} size={14} fill={i < (course.stars || 0) ? 'var(--star-yellow)' : 'rgba(0,0,0,0.1)'} color={i < (course.stars || 0) ? 'var(--star-yellow)' : '#ccc'} />
                ))}
                </div>
                </div>
                {course.stars === 3 && (
                <div style={{ 
                background: 'linear-gradient(45deg, var(--star-yellow), var(--primary-yellow-hover))', 
                color: 'white', 
                fontSize: '10px', 
                fontWeight: '900', 
                padding: '4px 10px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 10px rgba(255, 215, 0, 0.3)'
                }}>
                <Award size={12} /> EXPERTO
                </div>
                )}
                {course.stars > 0 && course.stars < 3 && (
                <div style={{ 
                background: 'var(--primary-green)', 
                color: 'white', 
                fontSize: '10px', 
                fontWeight: '900', 
                padding: '4px 10px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 10px rgba(88, 204, 2, 0.2)'
                }}>
                <CheckCircle size={12} /> NIVEL {course.stars}
                </div>
                )}

          {!isEnrolled && course.stars === 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              color: 'var(--primary-red)', 
              fontWeight: '800', 
              fontSize: '14px' 
            }}>
              <BullCoin size={16} /> {course.points_reward}
            </div>
          )}
        </div>
        
        <p style={{ 
          color: 'var(--secondary-text)', 
          fontSize: '14px', 
          margin: '0 0 20px 0', 
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '63px'
        }}>
          {getT(course, "description")}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction(course)} 
            className={isEnrolled ? "btn-primary" : "btn-secondary"} 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              padding: '14px',
              background: isEnrolled ? '' : 'transparent',
              borderColor: isEnrolled ? '' : (isLocked ? 'var(--border-color)' : 'var(--primary-red)'),
              color: isEnrolled ? '' : (isLocked ? 'var(--secondary-text)' : 'var(--primary-red)'),
              boxShadow: isEnrolled ? '' : 'none',
              borderRadius: '16px'
            }}
          >
            {isEnrolled ? (
              <>
                {t[language].acceder_curso}
                <Play size={18} fill="currentColor" />
              </>
            ) : isLocked ? (
              <>
                <Lock size={18} />
                {course.points_price > 0 ? `Desbloquear (${course.points_price} trs)` : 'Solo Premium'}
              </>
            ) : (
              t[language].inscribirse
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Dashboard({ user, setUser, language, getT, t }: { user: any, setUser: any, language: string, getT: any, t: any }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPremiumCourse, setSelectedPremiumCourse] = useState<any>(null);
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>(['all']);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'points_desc', 'points_asc'

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses${user ? `?userId=${user.id}` : ''}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching courses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const categories = useMemo(() => {
    const counts: { [key: string]: number } = { all: courses.length };
    courses.forEach(c => {
      const cat = getT(c, "category");
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    
    // Sort categories by count (descending), but keep 'all' at the beginning
    const sortedCats = Object.entries(counts)
      .filter(([name]) => name !== 'all')
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return [{ name: 'all', count: counts.all }, ...sortedCats];
  }, [courses, getT, language]);

  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        getT(c, "title").toLowerCase().includes(query) || 
        getT(c, "description").toLowerCase().includes(query)
      );
    }

    // Category filter
    if (!selectedCategory.includes('all')) {
      filtered = filtered.filter(c => selectedCategory.includes(getT(c, "category")));
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty === selectedDifficulty);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'points_desc') return b.points_reward - a.points_reward;
      if (sortBy === 'points_asc') return a.points_reward - b.points_reward;
      return b.id - a.id; // newest first
    });

    return filtered.map(c => ({
      ...c,
      isEnrolled: c.isEnrolled,
      isCompleted: !!c.isCompleted
    }));
  }, [courses, searchQuery, selectedCategory, selectedDifficulty, sortBy, getT, language]);

  const enrolledCourses = filteredCourses.filter(c => c.isEnrolled && !c.isCompleted);
  const availableCourses = filteredCourses.filter(c => !c.isEnrolled && !c.isCompleted);
  const completedCourses = filteredCourses.filter(c => c.isCompleted);

  const handleEnroll = async (courseId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (res.ok) {
      if (data.userPoints !== undefined) {
        const updatedUser = { ...user, points: data.userPoints };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      fetchCourses();
      setSelectedPremiumCourse(null);
    } else {
      toast.error(data.message || 'Error al inscribirse');
    }
  };

  const handleCourseClick = (course: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const isEnrolled = course.isEnrolled;
    if (course.access_level === 'premium' && user?.subscription_status !== 'premium' && !isEnrolled) {
      setSelectedPremiumCourse(course);
      return;
    }
    navigate(`/path/${course.id}`);
  };

  if (loading || !t || !t[language]) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-red)', borderRadius: '50%', margin: '0 auto 20px' }}
        />
        <div style={{ color: 'var(--secondary-text)' }}>{t?.[language]?.cargando || 'Cargando...'}</div>
      </div>
    );
  }

  return (
    <div className="container wide" style={{ padding: '40px 20px' }}>
      <Tutorial 
        pageId="dashboard"
        language={language}
        user={user}
        setUser={setUser}
        steps={[
          { text: language === 'en' ? 'Welcome to your Dashboard! Here you can find all our investment courses.' : '¡Bienvenido a tu Dashboard! Aquí encontrarás todos nuestros cursos de inversión.' },
          { text: language === 'en' ? 'Use the search bar and filters to find courses that match your interests and level.' : 'Usa el buscador y los filtros para encontrar los cursos que más te interesen.' },
          { text: language === 'en' ? 'Track your progress, points (Toros), and lives at the top of the page.' : 'Sigue tu progreso, tus Toros y tus vidas en la parte superior.' }
        ]}
      />
      <AnimatePresence>
        {selectedPremiumCourse && (
          <PremiumModal 
            onPricing={() => navigate('/shop')} 
            onClose={() => setSelectedPremiumCourse(null)}
            onRedeem={() => handleEnroll(selectedPremiumCourse.id)}
            pointsPrice={selectedPremiumCourse.points_price}
            userPoints={user?.points || 0}
          />
        )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ color: 'var(--text-color)', fontSize: '32px' }}>
              {user ? `${t[language].hola}, ${user.name} 👋` : '¡Bienvenido a Investia! 👋'}
            </h1>
            <p style={{ color: 'var(--secondary-text)', fontSize: '18px' }}>{t[language].descubre_cursos}</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <motion.div 
               whileHover={{ scale: 1.05 }}
               style={{ 
                 textAlign: 'center', 
                 background: 'var(--accent-light)', 
                 padding: '12px 20px', 
                 borderRadius: '20px', 
                 border: '2px solid #4A90E2',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 minWidth: '90px'
               }}
             >
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#4A90E2', lineHeight: '1' }}>{courses.filter(c => c.isEnrolled && !c.isCompleted).length}</div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#4A90E2', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{language === 'en' ? 'In Progress' : 'En curso'}</div>
             </motion.div>
             <motion.div 
               whileHover={{ scale: 1.05 }}
               style={{ 
                 textAlign: 'center', 
                 background: 'var(--accent-light)', 
                 padding: '12px 20px', 
                 borderRadius: '20px', 
                 border: '2px solid var(--primary-green-dark)',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 minWidth: '90px'
               }}
             >
                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary-green-dark)', lineHeight: '1' }}>{courses.filter(c => c.isCompleted).length}</div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary-green-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{language === 'en' ? 'Completed' : 'Completados'}</div>
             </motion.div>
             <motion.div 
               whileHover={{ scale: 1.05 }}
               style={{ 
                 textAlign: 'center', 
                 background: 'var(--accent-light)', 
                 padding: '12px 20px', 
                 borderRadius: '20px', 
                 border: '2px solid var(--primary-red)',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 minWidth: '90px'
               }}
             >
                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary-red)', lineHeight: '1' }}>{user?.points || 0}</div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary-red)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{t[language].puntos}</div>
             </motion.div>
             <motion.div 
               whileHover={{ scale: 1.05 }}
               style={{ 
                 textAlign: 'center', 
                 background: 'var(--accent-light)', 
                 padding: '12px 20px', 
                 borderRadius: '20px', 
                 border: '2px solid #FF4B4B',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 minWidth: '90px'
               }}
             >
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#FF4B4B', lineHeight: '1' }}>❤️ {user?.lives ?? 5}</div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#FF4B4B', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{t[language].vidas}</div>
             </motion.div>
          </div>
        </header>
      </motion.div>

      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'var(--card-bg)', 
          padding: '20px', 
          borderRadius: '24px', 
          marginBottom: '50px',
          border: '2px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flexGrow: 1, minWidth: '250px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} size={20} />
            <input 
              type="text" 
              placeholder={language === 'en' ? "Search courses..." : "Buscar cursos..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 15px 12px 45px', 
                borderRadius: '14px', 
                border: '2px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-color)',
                fontSize: '15px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <FilterDropdown 
              value={selectedCategory}
              onChange={setSelectedCategory}
              icon={Tag}
              label={language === 'en' ? 'All Categories' : 'Todas las categorías'}
              searchable={true}
              multi={true}
              options={categories.map(cat => ({ 
                value: cat.name, 
                label: cat.name === 'all' ? (language === 'en' ? 'All Categories' : 'Todas las categorías') : `${cat.name} (${cat.count})` 
              }))}
            />

            <FilterDropdown 
              value={selectedDifficulty}
              onChange={setSelectedDifficulty}
              icon={Filter}
              label={language === 'en' ? 'All Difficulties' : 'Todas las dificultades'}
              options={[
                { value: 'all', label: language === 'en' ? 'All Difficulties' : 'Todas las dificultades' },
                { value: 'beginner', label: t[language].beginner },
                { value: 'intermediate', label: t[language].intermediate },
                { value: 'advanced', label: t[language].advanced }
              ]}
            />

            <FilterDropdown 
              value={sortBy}
              onChange={setSortBy}
              icon={ArrowUpDown}
              label={language === 'en' ? 'Newest' : 'Más recientes'}
              options={[
                { value: 'newest', label: language === 'en' ? 'Newest' : 'Más recientes' },
                { value: 'points_desc', label: language === 'en' ? 'More toros' : 'Más toros' },
                { value: 'points_asc', label: language === 'en' ? 'Less toros' : 'Menos toros' }
              ]}
            />
          </div>
        </div>
      </motion.div>

      {enrolledCourses.length > 0 && (
        <section style={{ marginBottom: '70px' }}>
          <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-color)', fontSize: '24px' }}>
            <div style={{ background: 'var(--primary-red)', padding: '8px', borderRadius: '12px', display: 'flex' }}>
              <Play size={20} color="white" fill="white" />
            </div>
            {t[language].tus_cursos}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {enrolledCourses.map((course) => (
              <CourseCard 
                key={course.id}
                course={course}
                user={user}
                t={t}
                language={language}
                getT={getT}
                isEnrolled={true}
                onAction={(c) => handleCourseClick(c)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-color)', fontSize: '24px' }}>
          <div style={{ background: 'var(--primary-yellow)', padding: '8px', borderRadius: '12px', display: 'flex' }}>
            <Book size={20} color="white" />
          </div>
          {t[language].available}
        </h2>
        {availableCourses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {availableCourses.map((course) => (
              <CourseCard 
                key={course.id}
                course={course}
                user={user}
                t={t}
                language={language}
                getT={getT}
                isEnrolled={false}
                onAction={(c) => {
                  if (c.access_level === 'premium' && user?.subscription_status !== 'premium') {
                    setSelectedPremiumCourse(c);
                  } else {
                    handleEnroll(c.id);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            background: 'var(--gray-bg)', 
            borderRadius: '32px', 
            border: '3px dashed var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{ background: 'var(--border-color)', padding: '20px', borderRadius: '50%' }}>
              <CheckCircle size={48} color="var(--secondary-text)" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0' }}>{searchQuery || !selectedCategory.includes('all') || selectedDifficulty !== 'all' ? (language === 'en' ? 'No results' : 'Sin resultados') : '¡Todo al día!'}</h3>
              <p style={{ color: 'var(--secondary-text)', margin: 0 }}>
                {searchQuery || !selectedCategory.includes('all') || selectedDifficulty !== 'all' 
                  ? (language === 'en' ? 'Try changing your filters' : 'Prueba a cambiar tus filtros')
                  : t[language].no_courses}
              </p>
            </div>
          </div>
        )}
      </section>

      {completedCourses.length > 0 && (
        <section style={{ marginTop: '70px' }}>
          <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-color)', fontSize: '24px' }}>
            <div style={{ background: 'var(--primary-green)', padding: '8px', borderRadius: '12px', display: 'flex' }}>
              <CheckCircle size={20} color="white" />
            </div>
            {language === 'en' ? 'Completed Courses' : 'Cursos Completados'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', opacity: 0.8 }}>
            {completedCourses.map((course) => (
              <CourseCard 
                key={course.id}
                course={course}
                user={user}
                t={t}
                language={language}
                getT={getT}
                isEnrolled={true}
                onAction={(c) => handleCourseClick(c)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
