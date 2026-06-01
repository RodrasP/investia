import React from 'react';

interface VestiaBillProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VestiaBill: React.FC<VestiaBillProps> = ({ size = 24, className, style }) => {
  return (
    <div 
      className={className}
      style={{
        width: size * 1.7,
        height: size,
        minWidth: size * 1.7,
        minHeight: size,
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        borderRadius: size * 0.1,
        border: `1.5px solid #81c784`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Decorative inner border */}
      <div style={{
        position: 'absolute',
        top: '10%',
        bottom: '10%',
        left: '6%',
        right: '6%',
        border: '1px solid rgba(46, 125, 50, 0.2)',
        borderRadius: size * 0.05,
      }} />

      {/* Decorative corners - VST */}
      <div style={{ position: 'absolute', top: '5%', left: '8%', fontSize: size * 0.22, fontWeight: 'bold', color: '#2e7d32', opacity: 0.6 }}>VST</div>
      <div style={{ position: 'absolute', bottom: '5%', right: '8%', fontSize: size * 0.22, fontWeight: 'bold', color: '#2e7d32', opacity: 0.6 }}>VST</div>

      {/* Center Logo Circle */}
      <div style={{
        width: size * 0.65,
        height: size * 0.65,
        borderRadius: '50%',
        background: 'white',
        border: '1.5px solid #a5d6a7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
      }}>
        <img 
          src="/favicon.jpeg"
          alt="L"
          style={{
            width: '85%',
            height: '85%',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Side decorative patterns */}
      <div style={{ position: 'absolute', left: '15%', top: '50%', transform: 'translateY(-50%)', width: size * 0.2, height: size * 0.5, borderRadius: '50%', border: '1px solid rgba(46, 125, 50, 0.1)' }} />
      <div style={{ position: 'absolute', right: '15%', top: '50%', transform: 'translateY(-50%)', width: size * 0.2, height: size * 0.5, borderRadius: '50%', border: '1px solid rgba(46, 125, 50, 0.1)' }} />
    </div>
  );
};

export default VestiaBill;
