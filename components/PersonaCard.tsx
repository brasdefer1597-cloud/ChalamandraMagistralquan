
import React from 'react';
import { Spinner } from './Spinner';

interface PersonaCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: 'teal' | 'red' | 'pink';
  isLoading: boolean;
  children: React.ReactNode;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionLabel?: string;
}

const colorClasses = {
  teal: {
    border: 'border-teal-500/30',
    shadow: 'shadow-teal-500/20',
    text: 'text-teal-300',
    bg: 'bg-teal-500/10'
  },
  red: {
    border: 'border-red-500/30',
    shadow: 'shadow-red-500/20',
    text: 'text-red-300',
    bg: 'bg-red-500/10'
  },
  pink: {
    border: 'border-pink-500/30',
    shadow: 'shadow-pink-500/20',
    text: 'text-pink-300',
    bg: 'bg-pink-500/10'
  },
};

export const PersonaCard: React.FC<PersonaCardProps> = ({
  icon,
  title,
  subtitle,
  color,
  isLoading,
  children,
  onAction,
  actionIcon,
  actionLabel
}) => {
  const classes = colorClasses[color];

  return (
    <div className={`
      bg-gray-900/50 backdrop-blur-sm border ${classes.border} rounded-xl shadow-lg ${classes.shadow}
      flex flex-col h-full transition-all duration-300
    `}>
      <div className={`flex items-center justify-between p-4 border-b ${classes.border}`}>
        <div className="flex items-center">
            <div className={`w-10 h-10 mr-4 ${classes.text}`}>{icon}</div>
            <div>
            <h2 className={`text-xl font-bold ${classes.text}`}>{title}</h2>
            <p className="text-sm text-gray-400">{subtitle}</p>
            </div>
        </div>
        {onAction && (
            <button 
                onClick={onAction}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide
                    ${classes.bg} ${classes.text} border ${classes.border} hover:bg-opacity-20 transition-all`}
            >
                {actionIcon && <span>{actionIcon}</span>}
                {actionLabel && <span>{actionLabel}</span>}
            </button>
        )}
      </div>
      <div className="p-5 flex-grow relative">
        {isLoading ? (
          <div className="absolute inset-0 flex justify-center items-center bg-gray-900/50 rounded-b-xl z-10">
            <Spinner />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
