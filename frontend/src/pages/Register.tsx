import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, CheckCircle, Award, Target } from 'lucide-react';

export default function Register({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        toast.success('¡Cuenta creada con éxito!');
        navigate('/');
      } else {
        toast.error(data.message || 'Error al registrarse');
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
      background: 'radial-gradient(circle at top left, rgba(229, 57, 53, 0.05), transparent), radial-gradient(circle at bottom right, rgba(229, 57, 53, 0.05), transparent)',
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          flexDirection: 'row-reverse' // Form on left for variety
        }}
      >
        {/* Side Side: Info */}
        <div style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #212121 0%, #000000 100%)',
          padding: '60px',
          display: 'none', 
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white',
          position: 'relative'
        }} className="desktop-only">
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
             <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '15px', display: 'inline-flex', marginBottom: '30px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src="/favicon.jpeg" alt="Logo" style={{ height: '40px', borderRadius: '8px' }} />
            </div>
            <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px', lineHeight: '1.1' }}>Comienza tu Viaje hoy</h2>
            <p style={{ fontSize: '18px', opacity: 0.7, marginBottom: '40px', lineHeight: '1.6' }}>
              En menos de 2 minutos tendrás acceso a la mejor plataforma de educación financiera en español.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <StepItem icon={<CheckCircle size={22} />} title="Registro Instantáneo" desc="Sin procesos complicados ni burocracia." />
              <StepItem icon={<Target size={22} />} title="Metas Claras" desc="Define tus objetivos y nosotros te guiamos." />
              <StepItem icon={<Award size={22} />} title="Certificados Reales" desc="Demuestra lo que vales al completar cursos." />
            </div>
          </motion.div>
        </div>

        {/* Form Side */}
        <div style={{ 
          flex: 1, 
          padding: '60px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          background: 'var(--card-bg)'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-color)', marginBottom: '10px' }}>Crea tu Cuenta</h1>
            <p style={{ color: 'var(--secondary-text)' }}>Únete a la revolución financiera.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} size={20} />
              <input 
                type="text" 
                placeholder="Nombre completo" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ 
                  width: '100%',
                  padding: '15px 15px 15px 50px',
                  borderRadius: '16px',
                  border: '2px solid var(--border-color)',
                  background: 'var(--gray-bg)',
                  color: 'var(--text-color)',
                  fontSize: '16px',
                  outline: 'none'
                }}
                disabled={isSubmitting}
                required
              />
            </div>

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
                  outline: 'none'
                }}
                disabled={isSubmitting}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} size={20} />
              <input 
                type="password" 
                placeholder="Contraseña (mín. 6 caracteres)" 
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
                  outline: 'none'
                }}
                disabled={isSubmitting}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input type="checkbox" required id="terms" style={{ width: '18px', height: '18px', accentColor: 'var(--primary-red)' }} />
              <label htmlFor="terms" style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
                Acepto los <Link to="/terms" style={{ color: 'var(--primary-red)', fontWeight: 'bold', textDecoration: 'none' }}>Términos</Link> y la <Link to="/privacy" style={{ color: 'var(--primary-red)', fontWeight: 'bold', textDecoration: 'none' }}>Privacidad</Link>
              </label>
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
                marginTop: '10px',
                boxShadow: '0 10px 20px -5px rgba(229, 57, 53, 0.4)'
              }}
            >
              {isSubmitting ? 'CREANDO CUENTA...' : 'REGISTRARME GRATIS'}
              {!isSubmitting && <ArrowRight size={20} />}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--secondary-text)' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary-red)', fontWeight: 'bold', textDecoration: 'none' }}>Inicia sesión</Link>
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

function StepItem({ icon, title, desc }: any) {
  return (
    <div style={{ display: 'flex', gap: '15px' }}>
      <div style={{ color: 'var(--primary-red)', marginTop: '2px' }}>{icon}</div>
      <div>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.6 }}>{desc}</p>
      </div>
    </div>
  );
}
