import { clsx, type ClassValue } from 'clsx';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Utility para combinar classes CSS de forma eficiente
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ==========================================
// ANIMATION PRESETS (Motion v2)
// ==========================================

/**
 * Presets de animação para Motion v2
 */
export const animations = {
  // Entrada suave
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  // Entrada de baixo para cima
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },

  // Hover para cards
  cardHover: {
    whileHover: { 
      scale: 1.02, 
      y: -4,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    whileTap: { scale: 0.98 }
  },

  // Modal
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  },

  // Stagger para listas
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }
};

// ==========================================
// DESIGN TOKENS
// ==========================================

export const designTokens = {
  colors: {
    background: {
      primary: 'var(--color-alpha-bg)', // #0e1015
      surface: 'var(--color-alpha-surface)', // #13151b
      hover: 'var(--color-alpha-surface-hover)' // #1a1c23
    },
    border: {
      default: 'var(--color-alpha-border)', // #2a3441
      accent: 'var(--color-alpha-border-accent)' // #3d4b5c
    },
    text: {
      primary: 'var(--color-alpha-text-primary)', // #ffffff
      secondary: 'var(--color-alpha-text-secondary)', // #c4d1e1
      muted: 'var(--color-alpha-text-muted)' // #8a9bb8
    },
    accent: {
      blue: 'var(--color-alpha-accent-blue)',
      gold: 'var(--color-alpha-accent-gold)', 
      green: 'var(--color-alpha-accent-green)',
      red: 'var(--color-alpha-accent-red)'
    }
  }
};

// ==========================================
// COMPONENT BASE CLASSES
// ==========================================

export const componentClasses = {
  // Base para todos os cards
  card: cn(
    'rounded-xl border transition-all duration-300 p-5',
    'bg-slate-800/60 border-slate-700/50 hover:shadow-2xl cursor-pointer',
    'hover:bg-slate-800/80 hover:border-slate-600/50'
  ),

  // Base para botões
  button: cn(
    'inline-flex items-center justify-center rounded-lg font-medium',
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  ),

  // Input base
  input: cn(
    'bg-slate-700/50 border border-slate-600/30 rounded-md text-white',
    'placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50',
    'focus:border-blue-500/50 transition-all duration-200'
  )
};

// ==========================================
// COLOR UTILITIES
// ==========================================

export type ColorVariant = 'blue' | 'yellow' | 'green' | 'purple' | 'red';

export function getColorClasses(color: ColorVariant) {
  const colorMap = {
    blue: {
      text: 'text-blue-400',
      textSubtle: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      hover: 'hover:bg-blue-500/20'
    },
    yellow: {
      text: 'text-yellow-400', 
      textSubtle: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      hover: 'hover:bg-yellow-500/20'
    },
    green: {
      text: 'text-green-400',
      textSubtle: 'text-green-500', 
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      hover: 'hover:bg-green-500/20'
    },
    purple: {
      text: 'text-purple-400',
      textSubtle: 'text-purple-500',
      bg: 'bg-purple-500/10', 
      border: 'border-purple-500/20',
      hover: 'hover:bg-purple-500/20'
    },
    red: {
      text: 'text-red-400',
      textSubtle: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20', 
      hover: 'hover:bg-red-500/20'
    }
  };
  
  return colorMap[color] || colorMap.blue; // Fallback para blue se a cor não existir
}
