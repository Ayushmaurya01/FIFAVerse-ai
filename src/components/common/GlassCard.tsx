import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'teal' | 'pink' | 'gold' | 'none';
  onClick?: () => void;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'none',
  onClick,
  hoverEffect = true,
}) => {
  const getGlowClass = () => {
    switch (glowColor) {
      case 'teal':
        return 'glow-border-teal shadow-neon-teal/10 hover:shadow-neon-teal/20';
      case 'pink':
        return 'glow-border-pink shadow-neon-pink/10 hover:shadow-neon-pink/20';
      case 'gold':
        return 'shadow-neon-gold/10 hover:shadow-neon-gold/20 border-yellow-500/20';
      default:
        return '';
    }
  };

  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={`
        glass-panel 
        rounded-2xl 
        p-6 
        overflow-hidden 
        ${getGlowClass()}
        ${hoverEffect ? 'glass-panel-hover' : ''}
        ${isClickable ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : ''}
        transition-all 
        duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
