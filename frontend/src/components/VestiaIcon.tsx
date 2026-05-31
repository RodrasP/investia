import React from 'react';

interface VestiaIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VestiaIcon: React.FC<VestiaIconProps> = ({ size = 24, className, style }) => {
  return (
    <img 
      src="/favicon.jpeg"
      alt="Investia Logo"
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '8px',
        objectFit: 'cover',
        border: '1px solid var(--border-color)',
        ...style
      }}
    />
  );
};

export default VestiaIcon;
