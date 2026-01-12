// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
  MNEE: process.env.NEXT_PUBLIC_MNEE_ADDRESS || '',
  CHARITY_REGISTRY: process.env.NEXT_PUBLIC_CHARITY_REGISTRY_ADDRESS || '',
  DONATION_MANAGER: process.env.NEXT_PUBLIC_DONATION_MANAGER_ADDRESS || '',
} as const;

export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'); // Sepolia
export const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || 'Sepolia';
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || '';
export const ETHERSCAN_URL = process.env.NEXT_PUBLIC_ETHERSCAN_URL || 'https://sepolia.etherscan.io';
