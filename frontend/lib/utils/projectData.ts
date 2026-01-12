import { Droplets, GraduationCap, UtensilsCrossed, Heart, TreePine } from 'lucide-react';

export const projectVisuals: Record<number, {
  gradient: string;
  icon: any;
  color: string;
  category: string;
}> = {
  0: {
    gradient: 'from-blue-500 to-cyan-500',
    icon: Droplets,
    color: 'text-blue-500',
    category: 'Water & Sanitation',
  },
  1: {
    gradient: 'from-purple-500 to-pink-500',
    icon: GraduationCap,
    color: 'text-purple-500',
    category: 'Education',
  },
  2: {
    gradient: 'from-orange-500 to-red-500',
    icon: UtensilsCrossed,
    color: 'text-orange-500',
    category: 'Food Security',
  },
  3: {
    gradient: 'from-red-500 to-pink-600',
    icon: Heart,
    color: 'text-red-500',
    category: 'Healthcare',
  },
  4: {
    gradient: 'from-green-500 to-emerald-500',
    icon: TreePine,
    color: 'text-green-500',
    category: 'Environment',
  },
};

export const getProjectVisual = (projectId: number) => {
  return projectVisuals[projectId] || {
    gradient: 'from-gray-500 to-gray-700',
    icon: Heart,
    color: 'text-gray-500',
    category: 'General',
  };
};

export const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
};
