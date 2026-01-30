import { Project } from '@/types';

// Static project data - each project has a wallet that receives MNEE directly
// totalReceived will be calculated from blockchain Transfer events
export const STATIC_PROJECTS: Omit<Project, 'totalReceived'>[] = [
  {
    id: 1,
    name: 'Clean Water Initiative',
    description: 'Providing clean drinking water to communities in need through sustainable well construction and water purification systems.',
    wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Replace with real wallet
    active: true,
    createdAt: Math.floor(Date.now() / 1000),
  },
  {
    id: 2,
    name: 'Education for All',
    description: 'Supporting underprivileged children with school supplies, scholarships, and educational resources.',
    wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Replace with real wallet
    active: true,
    createdAt: Math.floor(Date.now() / 1000),
  },
  {
    id: 3,
    name: 'Food Security Program',
    description: 'Fighting hunger by providing meals and supporting local food banks in underserved areas.',
    wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Replace with real wallet
    active: true,
    createdAt: Math.floor(Date.now() / 1000),
  },
  {
    id: 4,
    name: 'Medical Aid Foundation',
    description: 'Delivering essential medical supplies and healthcare services to remote communities.',
    wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Replace with real wallet
    active: true,
    createdAt: Math.floor(Date.now() / 1000),
  },
];

// Helper to get project by ID
export function getProjectById(id: number): Omit<Project, 'totalReceived'> | undefined {
  return STATIC_PROJECTS.find(p => p.id === id);
}

// Helper to get project by wallet address
export function getProjectByWallet(wallet: string): Omit<Project, 'totalReceived'> | undefined {
  return STATIC_PROJECTS.find(p => p.wallet.toLowerCase() === wallet.toLowerCase());
}

// Get all project wallet addresses (for filtering Transfer events)
export function getAllProjectWallets(): string[] {
  return STATIC_PROJECTS.map(p => p.wallet);
}
