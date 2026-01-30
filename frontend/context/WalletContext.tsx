'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcProvider, ethers } from 'ethers';
import { WalletState } from '@/types';
import { MNEE_ADDRESS, CHAIN_ID, CHAIN_NAME, RPC_URL } from '@/lib/contracts/addresses';
import { MNEE_ABI } from '@/lib/contracts/abis';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  updateMneeBalance: () => Promise<void>;
  provider: BrowserProvider | JsonRpcProvider | null;
  signer: ethers.Signer | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    isConnected: false,
    mneeBalance: BigInt(0),
  });
  const [provider, setProvider] = useState<BrowserProvider | JsonRpcProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const updateMneeBalance = useCallback(async () => {
    if (!walletState.address || !provider) return;

    try {
      const mneeContract = new ethers.Contract(MNEE_ADDRESS, MNEE_ABI, provider);
      const balance = await mneeContract.balanceOf(walletState.address);
      setWalletState((prev) => ({ ...prev, mneeBalance: balance }));
    } catch (error) {
      console.error('Error fetching MNEE balance:', error);
    }
  }, [walletState.address, provider]);

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this application');
      return;
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true }));

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();
      const walletSigner = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(walletSigner);
      setWalletState({
        address: accounts[0],
        chainId: Number(network.chainId),
        isConnecting: false,
        isConnected: true,
        mneeBalance: BigInt(0),
      });

      // Check if on correct network (Ethereum Mainnet)
      if (Number(network.chainId) !== CHAIN_ID) {
        console.warn(`Please switch to ${CHAIN_NAME}`);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setWalletState((prev) => ({ ...prev, isConnecting: false }));
      alert(error.message || 'Failed to connect wallet');
    }
  };

  const disconnect = () => {
    setWalletState({
      address: null,
      chainId: null,
      isConnecting: false,
      isConnected: false,
      mneeBalance: BigInt(0),
    });
    setSigner(null);
  };

  const switchNetwork = async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added - for mainnet this shouldn't happen
        alert(`Please add ${CHAIN_NAME} to MetaMask`);
      } else {
        console.error('Error switching network:', error);
      }
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWalletState((prev) => ({
          ...prev,
          address: accounts[0],
          mneeBalance: BigInt(0),
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWalletState((prev) => ({
        ...prev,
        chainId: parseInt(chainId, 16),
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // Update MNEE balance when address changes
  useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      updateMneeBalance();
    }
  }, [walletState.isConnected, walletState.address, updateMneeBalance]);

  // Set up provider on mount
  useEffect(() => {
    const setupProvider = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const browserProvider = new BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send('eth_accounts', []);

        if (accounts.length > 0) {
          const network = await browserProvider.getNetwork();
          const walletSigner = await browserProvider.getSigner();
          setProvider(browserProvider);
          setSigner(walletSigner);
          setWalletState({
            address: accounts[0],
            chainId: Number(network.chainId),
            isConnecting: false,
            isConnected: true,
            mneeBalance: BigInt(0),
          });
        } else {
          // Set read-only provider
          const rpcProvider = new JsonRpcProvider(RPC_URL);
          setProvider(rpcProvider);
        }
      } else {
        // No MetaMask - use read-only provider
        const rpcProvider = new JsonRpcProvider(RPC_URL);
        setProvider(rpcProvider);
      }
    };

    setupProvider();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        connect,
        disconnect,
        switchNetwork,
        updateMneeBalance,
        provider,
        signer,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
