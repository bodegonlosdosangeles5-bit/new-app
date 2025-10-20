import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-12',
  md: 'h-12 w-16',
  lg: 'h-16 w-20',
  xl: 'h-20 w-24'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl'
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo SVG con V estilizada */}
      <svg 
        className={sizeClasses[size]}
        viewBox="0 0 60 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradiente dorado principal */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="25%" stopColor="#FFA500" />
            <stop offset="50%" stopColor="#DAA520" />
            <stop offset="75%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#8B7355" />
          </linearGradient>
          
          {/* Gradiente de sombra */}
          <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
          </linearGradient>
          
          {/* Filtro de sombra */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Fondo circular con gradiente */}
        <circle 
          cx="30" cy="30" r="28" 
          fill="url(#goldGradient)"
          filter="url(#dropShadow)"
        />
        
        {/* Letra V estilizada más elegante */}
        <path 
          d="M18 18 L30 42 L42 18 L38 18 L30 35 L22 18 Z" 
          fill="#FFFFFF"
          stroke="#B8860B"
          strokeWidth="0.8"
        />
        
        {/* Detalle decorativo en la V */}
        <path 
          d="M25 25 L30 35 L35 25" 
          fill="none"
          stroke="#FFD700"
          strokeWidth="1"
          opacity="0.6"
        />
        
        {/* Efecto de brillo */}
        <ellipse 
          cx="30" cy="25" 
          rx="15" ry="8" 
          fill="url(#shadowGradient)" 
          opacity="0.2"
        />
      </svg>
      
      {showText && (
        <div className={`flex flex-col ${textSizeClasses[size]}`}>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 drop-shadow-sm leading-tight">
            PLANTA
          </span>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 drop-shadow-sm leading-tight -mt-1">
            VARELA
          </span>
        </div>
      )}
    </div>
  );
};
