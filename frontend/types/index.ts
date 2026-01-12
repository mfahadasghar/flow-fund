export interface Project {
  id: number;
  name: string;
  description: string;
  wallet: string;
  totalReceived: bigint;
  active: boolean;
  createdAt: number;
}

export interface Donation {
  id: number;
  donor: string;
  totalAmount: bigint;
  projectIds: number[];
  allocations: bigint[];
  timestamp: number;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  mneeBalance: bigint;
}

export interface AllocationInput {
  projectId: number;
  percentage: number;
}
