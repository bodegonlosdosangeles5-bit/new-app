import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12'
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src="/logo.svg" 
        alt="Logo Control de Producción" 
        className={sizeClasses[size]}
      />
      {showText && (
        <span className="text-xl font-bold text-foreground">
          Control de Producción
        </span>
      )}
    </div>
  );
};
