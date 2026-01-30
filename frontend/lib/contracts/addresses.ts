// Real MNEE Token on Ethereum Mainnet
export const MNEE_ADDRESS = '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF';

// Chain configuration for Ethereum Mainnet
export const CHAIN_ID = 1;
export const CHAIN_NAME = 'Ethereum Mainnet';
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com';
export const ETHERSCAN_URL = 'https://etherscan.io';

// Legacy export for compatibility
export const CONTRACT_ADDRESSES = {
  MNEE: MNEE_ADDRESS,
  CHARITY_REGISTRY: '', // Not used - projects are static
  DONATION_MANAGER: '', // Not used - direct transfers
} as const;
