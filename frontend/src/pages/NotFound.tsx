import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound({ language }: { language: string }) {
  const isEn = language === 'en';
  
  return (
    <div className="container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        style={{
          background: 'var(--gray-bg)',
          padding: '40px',
          borderRadius: '30px',
          border: '2px solid var(--border-color)',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ 
            background: 'var(--accent-light)', 
            color: 'var(--primary-red)', 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <AlertCircle size={40} />
          </div>
        </div>
        
        <h1 style={{ fontSize: '64px', fontWeight: '900', color: 'var(--text-color)', margin: '0 0 10px 0', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-color)', margin: '0 0 20px 0' }}>
          {isEn ? 'Page Not Found' : 'Página no encontrada'}
        </h2>
        
        <p style={{ color: 'var(--secondary-text)', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
          {isEn 
            ? "Oops! It seems the page you're looking for has moved, been deleted, or never existed in the first place." 
            : "¡Ups! Parece que la página que buscas se ha movido, ha sido eliminada o nunca existió."}
        </p>
        
        <Link to="/" className="btn-primary" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '10px', 
          textDecoration: 'none', 
          padding: '15px 30px' 
        }}>
          <ArrowLeft size={20} />
          {isEn ? 'Back to Home' : 'Volver al Inicio'}
        </Link>
      </motion.div>
    </div>
  );
}
