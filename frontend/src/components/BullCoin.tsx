import React from 'react';

interface BullCoinProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const BullCoin: React.FC<BullCoinProps> = ({ size = 24, className, style }) => {
  return (
    <div 
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--star-yellow) 0%, var(--primary-yellow-hover) 100%)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #B8860B',
        ...style
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        width={size * 0.7} 
        height={size * 0.7} 
        fill="#5D4037"
        style={{ display: 'block' }}
      >
        {/* Stylized Bull Symbol */}
        <path d="M4 8c0-1.5 1.5-3 8-3s8 1.5 8 3c0 0-1-1.5-8-1.5S4 8 4 8z" />
        <path d="M7 9c0 0 0 0 0 0h10v5c0 3-2.5 5-5 5s-5-2-5-5V9z" />
        <circle cx="9.5" cy="12.5" r="0.8" fill="var(--star-yellow)" />
        <circle cx="14.5" cy="12.5" r="0.8" fill="var(--star-yellow)" />
      </svg>
    </div>
  );
};

export default BullCoin;
