import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Play, CheckCircle, BookOpen, Sparkles, Star, Clock,
  Book, TrendingUp, TrendingDown, ShieldCheck, Zap, Award, DollarSign, PieChart, 
  Briefcase, Target, Wallet, Coins, Globe, Landmark, Activity, BarChart, 
  LineChart, Layers, Database, Cpu, Lightbulb
} from 'lucide-react';
import BullCoin from '../components/BullCoin';
import VestiaBill from '../components/VestiaBill';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

const icons: any = {
  Book, TrendingUp, TrendingDown, ShieldCheck, Zap, Award, DollarSign, PieChart, 
  Briefcase, Target, Wallet, Coins, Globe, Landmark, Activity, BarChart, 
  LineChart, Layers, Database, Cpu, Lightbulb
};

const CourseIcon = ({ name, size = 48 }: { name: string, size?: number }) => {
  const IconComponent = icons[name] || Book;
  return <IconComponent size={size} />;
};

const CooldownTimer = ({ lastCompletedAt, language }: { lastCompletedAt: string, language: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const last = new Date(lastCompletedAt);
      const diffMs = now.getTime() - last.getTime();
      const remainingMs = (5 * 60 * 60 * 1000) - diffMs;

      if (remainingMs <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [lastCompletedAt]);

  return (
    <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '2px', fontFamily: 'monospace', background: 'var(--primary-red)', color: 'white', padding: '5px 15px', borderRadius: '12px', display: 'inline-block', marginTop: '10px' }}>
      {timeLeft}
    </div>
  );
};

export default function LearningPath({ user: currentUser, setUser, language, getT, t }: { user: any, setUser: any, language: string, getT: any, t: any }) {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const navigate = useNavigate();

  const fetchCourse = () => {
    fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setCourse(data))
      .catch(() => setError(true));
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleSkipCooldown = async (method: 'points' | 'vestias') => {
    if (skipping) return;
    setSkipping(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/skip-cooldown`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ method })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchCourse();
        
        // Update global user state
        const updatedUser = { ...currentUser };
        if (method === 'points') updatedUser.points -= 10;
        else updatedUser.vestias -= 1;
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Error al saltar cooldown');
    } finally {
      setSkipping(false);
    }
  };

  if (!t || !t[language]) return null;
  if (error) return <div className="container" style={{ color: 'var(--text-color)', marginTop: '50px', textAlign: 'center' }}>Error al cargar el curso. <Link to="/" style={{ color: 'var(--primary-red)' }}>{t[language].vuelve}</Link></div>;
  if (!course) return <div className="container" style={{ color: 'var(--text-color)', marginTop: '50px', textAlign: 'center' }}>{t[language].cargando || 'Cargando...'}</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background-color)', paddingBottom: '100px' }}>
      <div style={{ 
        position: 'relative', 
        padding: '60px 20px', 
        background: course.image_url 
          ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${API_BASE_URL}${course.image_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, #111 0%, #222 100%)', 
        color: 'white',
        overflow: 'hidden',
        borderBottom: '1px solid #333'
      }}>
        {/* Glow effect */}
        {!course.image_url && <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '200%', background: 'radial-gradient(ellipse at center, rgba(229, 57, 53, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />}
        
        <div className="container wide" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '30px', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}>
                <ChevronLeft size={18} /> {t[language].volver_al_dashboard || 'Volver'}
              </button>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '0 0 15px 0', fontWeight: '900', letterSpacing: '-1px' }}>
                  {getT(course, "title")}
                </h1>
                <p style={{ fontSize: '18px', color: '#aaa', maxWidth: '600px', margin: '0 0 30px 0', lineHeight: '1.6' }}>
                  {getT(course, "description") || 'Domina este tema paso a paso a través de nuestro sistema de aprendizaje guiado.'}
                </p>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 215, 0, 0.1)', color: 'var(--star-yellow)', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                    <BullCoin size={16} /> {course.points_reward || 100} trs
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px' }}>
                    <Sparkles size={16} /> {course.difficulty?.toUpperCase() || 'BEGINNER'}
                  </span>

                  <div style={{ display: 'flex', gap: '4px', marginLeft: '10px' }}>
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} size={22} fill={i < (course.stars || 0) ? 'var(--star-yellow)' : 'rgba(255,255,255,0.1)'} color={i < (course.stars || 0) ? 'var(--star-yellow)' : 'rgba(255,255,255,0.3)'} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            {!course.image_url && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.2, scale: 1 }}
                style={{ alignSelf: 'center' }}
              >
                <CourseIcon name={course.icon} size={150} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="container wide" style={{ marginTop: '40px' }}>
        {course.cooldownActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              background: 'linear-gradient(135deg, var(--primary-red) 0%, #FF7043 100%)', 
              padding: '25px 35px', 
              borderRadius: '28px', 
              color: 'white', 
              fontWeight: 'bold', 
              marginBottom: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '20px', 
              boxShadow: '0 15px 35px rgba(229, 57, 53, 0.25)',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', color: 'white', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900' }}>{language === 'en' ? 'Level Locked (Cooldown)' : 'Nivel Bloqueado (Cooldown)'}</div>
                <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: 'normal' }}>
                  {language === 'en' ? 'You must wait 5 hours since your last star to unlock the next difficulty level.' : 'Debes esperar 5 horas desde tu última estrella para desbloquear el siguiente nivel de dificultad.'}
                </div>
                {course.last_completed_at && <CooldownTimer lastCompletedAt={course.last_completed_at} language={language} />}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.05, background: 'white', color: 'var(--primary-red)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSkipCooldown('points')}
                disabled={skipping}
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  color: 'white', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  padding: '12px 20px', 
                  borderRadius: '16px', 
                  fontWeight: '900', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s'
                }}
              >
                <Zap size={16} fill="white" /> Saltar con 10 <BullCoin size={16} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, background: 'var(--star-yellow)', color: '#1B5E20' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSkipCooldown('vestias')}
                disabled={skipping}
                style={{ 
                  background: '#2E7D32', 
                  color: 'white', 
                  border: '2px solid rgba(255,255,255,0.2)', 
                  padding: '12px 20px', 
                  borderRadius: '16px', 
                  fontWeight: '900', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                <Zap size={16} fill="white" /> Saltar con 1 <VestiaBill size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          {course.topics?.map((topic: any, tIdx: number) => (
            <motion.div 
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
                <div style={{ 
                  background: topic.isCompleted ? 'var(--primary-green)' : 'var(--primary-red)', 
                  color: 'white', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: '900', 
                  fontSize: '20px',
                  boxShadow: topic.isCompleted ? '0 5px 15px rgba(88, 204, 2, 0.3)' : '0 5px 15px rgba(229, 57, 53, 0.3)',
                  transition: 'all 0.3s'
                }}>
                  {topic.isCompleted ? <CheckCircle size={24} /> : (tIdx + 1)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-color)', fontWeight: '800' }}>{getT(topic, "title")}</h2>
                    {topic.isCompleted && (
                      <span style={{ background: 'rgba(88, 204, 2, 0.1)', color: 'var(--primary-green)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>
                        ¡Completado!
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '5px 0 0 0', color: 'var(--secondary-text)', fontSize: '15px' }}>{getT(topic, "description")}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', paddingLeft: '60px' }}>
                {topic.lessons?.map((lesson: any, lIdx: number) => {
                  const isCompleted = lesson.isCompleted; 
                  const isClickable = !course.cooldownActive || isCompleted;

                  return (
                    <Link 
                      to={isClickable ? `/lesson/${lesson.id}` : '#'} 
                      key={lesson.id}
                      style={{ textDecoration: 'none', pointerEvents: isClickable ? 'auto' : 'none', opacity: isClickable ? 1 : 0.6 }}
                    >
                      <motion.div
                        whileHover={isClickable ? { y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' } : {}}
                        whileTap={isClickable ? { scale: 0.98 } : {}}
                        style={{
                          background: 'var(--card-bg)',
                          borderRadius: '20px',
                          padding: '25px',
                          border: '2px solid var(--border-color)',
                          borderColor: isCompleted ? 'var(--primary-green)' : 'var(--border-color)',
                          position: 'relative',
                          overflow: 'hidden',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'border-color 0.2s'
                        }}
                      >
                        {isCompleted && (
                           <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--primary-green)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: '10px' }}>
                             <CheckCircle size={16} color="white" />
                           </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Lección {lIdx + 1}
                          </span>
                          <div style={{ background: isCompleted ? 'rgba(88, 204, 2, 0.1)' : 'var(--gray-bg)', padding: '10px', borderRadius: '50%', color: isCompleted ? 'var(--primary-green)' : 'var(--text-color)' }}>
                            <Play size={18} fill="currentColor" />
                          </div>
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: 'var(--text-color)', lineHeight: '1.4' }}>
                          {getT(lesson, "title")}
                        </h3>
                        {(lesson.questionCount > 0 || (lesson.questions && lesson.questions.length > 0)) && (
                          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '600' }}>
                            <BookOpen size={14} /> {lesson.questionCount || lesson.questions?.length} ejercicios
                          </div>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {course.untrackedLessons?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: '#4A90E2', color: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-color)', fontWeight: '800' }}>{t[language].otras_lecciones || 'Lecciones Extra'}</h2>
                  <p style={{ margin: '5px 0 0 0', color: 'var(--secondary-text)', fontSize: '15px' }}>Contenido adicional no clasificado.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', paddingLeft: '60px' }}>
                {course.untrackedLessons.map((lesson: any) => {
                  const isClickable = !course.cooldownActive || lesson.isCompleted;
                  return (
                    <Link 
                      to={isClickable ? `/lesson/${lesson.id}` : '#'} 
                      key={lesson.id} 
                      style={{ textDecoration: 'none', pointerEvents: isClickable ? 'auto' : 'none', opacity: isClickable ? 1 : 0.6 }}
                    >
                      <motion.div 
                        whileHover={isClickable ? { y: -5 } : {}} 
                        className="btn-secondary" 
                        style={{ 
                          padding: '20px', 
                          borderRadius: '16px', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: 'var(--card-bg)', 
                          border: '2px solid var(--border-color)', 
                          borderColor: lesson.isCompleted ? 'var(--primary-green)' : 'var(--border-color)',
                          color: 'var(--text-color)', 
                          textTransform: 'none', 
                          textAlign: 'left',
                          position: 'relative'
                        }}
                      >
                        <span style={{ fontWeight: 'bold' }}>{getT(lesson, "title")}</span>
                        {lesson.isCompleted ? <CheckCircle size={18} color="var(--primary-green)" /> : <Play size={18} color="var(--primary-red)" />}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
