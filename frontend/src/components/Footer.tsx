import { Link } from 'react-router-dom';
import { Mail, ExternalLink, Globe, Link as LinkIcon, MessageCircle } from 'lucide-react';

export default function Footer({ user }: { user?: any }) {
  return (
    <footer style={{ 
      backgroundColor: 'var(--footer-bg)', 
      padding: '80px 20px 40px', 
      borderTop: '1px solid var(--border-color)',
      marginTop: '0',
      transition: 'background-color 0.3s, border-color 0.3s',
      color: 'var(--text-color)'
    }}>
      <div className="container wide" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '60px',
        marginBottom: '60px'
      }}>
        {/* Brand Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <img src="/favicon.jpeg" alt="Investia Logo" style={{ height: '40px', borderRadius: '10px' }} />
            <span style={{ fontWeight: 900, fontSize: '24px', color: 'var(--primary-red)', letterSpacing: '-1px' }}>
              INVESTIA
            </span>
          </Link>
          <p style={{ color: 'var(--secondary-text)', lineHeight: '1.6', fontSize: '15px' }}>
            Nuestra misión es democratizar la educación financiera a través de la tecnología y la gamificación. Aprende a invertir, paso a paso.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <SocialIcon icon={<Globe size={20} />} href="#" />
            <SocialIcon icon={<LinkIcon size={20} />} href="#" />
            <SocialIcon icon={<MessageCircle size={20} />} href="#" />
          </div>
        </div>

        {/* Product Column */}
        <div>
          <h4 style={{ marginBottom: '24px', fontWeight: '800', fontSize: '18px' }}>Plataforma</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FooterLink to="/dashboard">Cursos</FooterLink>
            <FooterLink to="/shop">Tienda y Planes</FooterLink>
            {!user && <FooterLink to="/register">Crear Cuenta</FooterLink>}
            {!user && <FooterLink to="/login">Iniciar Sesión</FooterLink>}
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h4 style={{ marginBottom: '24px', fontWeight: '800', fontSize: '18px' }}>Soporte</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FooterLink to="/contact">Contacto</FooterLink>
            <FooterLink to="/faq">Preguntas Frecuentes</FooterLink>
            <FooterLink to="/help">Centro de Ayuda</FooterLink>
            <FooterLink to="/community">Comunidad</FooterLink>
          </ul>
        </div>

        {/* Legal Column */}
        <div>
          <h4 style={{ marginBottom: '24px', fontWeight: '800', fontSize: '18px' }}>Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FooterLink to="/privacy">Privacidad</FooterLink>
            <FooterLink to="/terms">Términos de Uso</FooterLink>
            <FooterLink to="/cookies">Cookies</FooterLink>
            <FooterLink to="/risk">Advertencia de Riesgo</FooterLink>
          </ul>
        </div>
      </div>

      <div className="flex-responsive" style={{ 
        borderTop: '1px solid var(--border-color)', 
        paddingTop: '40px',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
          © {new Date().getFullYear()} Investia Inc. Hecho con ❤️ para inversores inteligentes.
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-text)', fontSize: '14px' }}>
            <Mail size={16} /> hola@investia.app
          </div>
          <button style={{ 
            background: 'none', 
            color: 'var(--secondary-text)', 
            fontSize: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontWeight: 'bold'
          }}>
            Español (ES) <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} style={{ 
        textDecoration: 'none', 
        color: 'var(--secondary-text)', 
        fontSize: '15px',
        transition: 'color 0.2s ease'
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary-red)')}
      onMouseOut={(e) => (e.currentTarget.style.color = 'var(--secondary-text)')}
      >
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ icon, href }: { icon: any, href: string }) {
  return (
    <a href={href} style={{ 
      color: 'var(--secondary-text)', 
      background: 'var(--gray-bg)', 
      width: '40px', 
      height: '40px', 
      borderRadius: '10px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.color = 'white';
      e.currentTarget.style.background = 'var(--primary-red)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.color = 'var(--secondary-text)';
      e.currentTarget.style.background = 'var(--gray-bg)';
    }}
    >
      {icon}
    </a>
  );
}

