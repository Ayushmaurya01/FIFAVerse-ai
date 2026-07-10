import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative h-12 w-12 mb-4">
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-fifa-pink/20 border-t-fifa-pink animate-spin" />
        {/* Animated inner ring */}
        <div className="absolute inset-2 rounded-full border-4 border-fifa-teal/20 border-t-fifa-teal animate-spin [animation-duration:1s]" />
      </div>
      <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase animate-pulse">
        Loading Operations Intelligence...
      </p>
    </div>
  );
};

export default LoadingSpinner;
