import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        toast.success('¡Bienvenido de nuevo!');
        navigate('/');
      } else {
        toast.error(data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      toast.error('Error conectando con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, rgba(229, 57, 53, 0.05), transparent), radial-gradient(circle at bottom left, rgba(229, 57, 53, 0.05), transparent)',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          display: 'flex',
          maxWidth: '1000px',
          width: '100%',
          background: 'var(--card-bg)',
          borderRadius: '40px',
          border: '2px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Left Side: Branding/Marketing */}
        <div style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, var(--primary-red) 0%, var(--primary-red-dark) 100%)',
          padding: '60px',
          display: 'none', // Hidden on mobile
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white',
          position: 'relative'
        }} className="desktop-only">
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '15px', display: 'inline-flex', marginBottom: '30px', backdropFilter: 'blur(10px)' }}>
              <img src="/favicon.jpeg" alt="Logo" style={{ height: '40px', borderRadius: '8px' }} />
            </div>
            <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px', lineHeight: '1.1' }}>Tu Futuro Financiero Empieza Aquí</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px', lineHeight: '1.6' }}>
              Únete a miles de personas que están dominando el mercado con nuestras lecciones interactivas.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}><Sparkles size={20} /></div>
                <span style={{ fontWeight: 'bold' }}>Aprendizaje Gamificado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}><TrendingUp size={20} /></div>
                <span style={{ fontWeight: 'bold' }}>Simulador de Inversiones Realista</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}><ShieldCheck size={20} /></div>
                <span style={{ fontWeight: 'bold' }}>Seguridad y Confianza</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div style={{ 
          flex: 1, 
          padding: '60px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          background: 'var(--card-bg)'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-color)', marginBottom: '10px' }}>Inicia Sesión</h1>
            <p style={{ color: 'var(--secondary-text)' }}>Introduce tus credenciales para acceder a tu panel.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} size={20} />
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{ 
                  width: '100%',
                  padding: '15px 15px 15px 50px',
                  borderRadius: '16px',
                  border: '2px solid var(--border-color)',
                  background: 'var(--gray-bg)',
                  color: 'var(--text-color)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                disabled={isSubmitting}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} size={20} />
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ 
                  width: '100%',
                  padding: '15px 15px 15px 50px',
                  borderRadius: '16px',
                  border: '2px solid var(--border-color)',
                  background: 'var(--gray-bg)',
                  color: 'var(--text-color)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                disabled={isSubmitting}
                required
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ fontSize: '14px', color: 'var(--primary-red)', textDecoration: 'none', fontWeight: 'bold' }}>¿Olvidaste tu contraseña?</Link>
            </div>

            <motion.button 
              whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
              style={{ 
                padding: '18px', 
                fontSize: '16px', 
                fontWeight: '900', 
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 20px -5px rgba(229, 57, 53, 0.4)'
              }}
            >
              {isSubmitting ? 'CARGANDO...' : 'ENTRAR A MI CUENTA'}
              {!isSubmitting && <ArrowRight size={20} />}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--secondary-text)' }}>
            ¿Aún no tienes cuenta? <Link to="/register" style={{ color: 'var(--primary-red)', fontWeight: 'bold', textDecoration: 'none' }}>Crea una gratis</Link>
          </p>
        </div>
      </motion.div>
      
      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
