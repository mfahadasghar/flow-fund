'use client';

import { useMemo, useEffect, useState } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '@/context/WalletContext';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { MNEE_ABI, CHARITY_REGISTRY_ABI, DONATION_MANAGER_ABI } from '@/lib/contracts/abis';

export function useContract(contractName: 'MNEE' | 'CHARITY_REGISTRY' | 'DONATION_MANAGER') {
  const { provider, address } = useWallet();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    async function setupContract() {
      if (!provider) {
        setContract(null);
        return;
      }

      const abis = {
        MNEE: MNEE_ABI,
        CHARITY_REGISTRY: CHARITY_REGISTRY_ABI,
        DONATION_MANAGER: DONATION_MANAGER_ABI,
      };

      const addresses = {
        MNEE: CONTRACT_ADDRESSES.MNEE,
        CHARITY_REGISTRY: CONTRACT_ADDRESSES.CHARITY_REGISTRY,
        DONATION_MANAGER: CONTRACT_ADDRESSES.DONATION_MANAGER,
      };

      const contractAddress = addresses[contractName];
      const contractAbi = abis[contractName];

      if (!contractAddress) {
        console.warn(`${contractName} address not configured`);
        setContract(null);
        return;
      }

      try {
        // If wallet is connected, use signer for write transactions
        // Otherwise, use provider for read-only access
        if (address) {
          const signer = await provider.getSigner();
          const contractWithSigner = new Contract(contractAddress, contractAbi, signer);
          setContract(contractWithSigner);
        } else {
          const contractWithProvider = new Contract(contractAddress, contractAbi, provider);
          setContract(contractWithProvider);
        }
      } catch (error) {
        console.error(`Error creating ${contractName} contract:`, error);
        setContract(null);
      }
    }

    setupContract();
  }, [provider, address, contractName]);

  return contract;
}
