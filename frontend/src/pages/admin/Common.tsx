import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash, Pencil, ChevronLeft, Users, Eye, Shield, User as UserIcon, 
  Check, X, BarChart2, Search, ChevronDown, UserMinus, Lock, Filter, 
  ArrowUpDown, Tag, MessageCircle, Settings, ShoppingBag, ArrowRightLeft,
  Book, TrendingUp, ShieldCheck, Zap, Award, DollarSign, PieChart, 
  Briefcase, Target, Wallet, Coins, Globe, Landmark, TrendingDown,
  Activity, BarChart, LineChart, Layers, Database, Cpu, Lightbulb, Gift,
  FileText, ChevronRight, LayoutDashboard, RefreshCw, LogOut, Cookie, Megaphone, Send, Type, Image, Minus, Trophy, Sparkles, Heart, Info, CheckCircle
} from 'lucide-react';

export const icons: any = {
  Book, TrendingUp, TrendingDown, ShieldCheck, Zap, Award, DollarSign, PieChart, 
  Briefcase, Target, Wallet, Coins, Globe, Landmark, Activity, BarChart, 
  LineChart, Layers, Database, Cpu, Lightbulb, Gift, ShoppingBag, Users, Shield, MessageCircle, Bell: Activity
};

export const CourseIcon = ({ name, size = 48 }: { name: string, size?: number }) => {
  const IconComponent = icons[name] || Book;
  return <IconComponent size={size} />;
};

export const IconPicker = ({ selected, onSelect }: { selected: string, onSelect: (name: string) => void }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '10px', maxHeight: '250px', overflowY: 'auto', padding: '15px', background: 'var(--gray-bg)', borderRadius: '20px', border: '2px solid var(--border-color)' }}>
    {Object.keys(icons).map(name => {
      const Icon = icons[name];
      const isSelected = selected === name;
      return (
        <motion.button
          key={name}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.preventDefault(); onSelect(name); }}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            border: isSelected ? '2px solid var(--primary-red)' : '2px solid transparent',
            background: isSelected ? 'rgba(229, 57, 53, 0.08)' : 'var(--card-bg)',
            color: isSelected ? 'var(--primary-red)' : 'var(--text-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title={name}
        >
          <Icon size={24} />
        </motion.button>
      );
    })}
  </div>
);

export const FilterDropdown = ({ value, options, onChange, icon: Icon, label, searchable, multi }: any) => {
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

export const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: any) => (
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

export const ConfirmModal = ({ title, message, onConfirm, onClose, isAlert }: any) => (
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

export const SafeRender = ({ renderFn, errorLabel, setView }: any) => {
  try {
    return renderFn();
  } catch (err) {
    console.error(`Render crash in ${errorLabel}:`, err);
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', border: '2px solid var(--primary-red)' }}>
        <h2 style={{ color: 'var(--primary-red)' }}>Error de visualización</h2>
        <p>Lo sentimos, ha ocurrido un error al cargar {errorLabel}.</p>
        <div style={{ marginTop: '20px', fontSize: '10px', color: 'var(--secondary-text)', textAlign: 'left', background: 'var(--gray-bg)', padding: '15px', borderRadius: '12px', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          <strong>Detalles del error:</strong><br />
          {String(err)}
        </div>
        <button onClick={() => setView('courses')} className="btn-primary" style={{ marginTop: '20px' }}>Volver al Inicio</button>
      </div>
    );
  }
};
