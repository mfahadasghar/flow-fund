'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Donation } from '@/types';
import { useWallet } from '@/context/WalletContext';
import { MNEE_ADDRESS, RPC_URL } from '@/lib/contracts/addresses';
import { MNEE_ABI } from '@/lib/contracts/abis';
import { getProjectByWallet } from '@/lib/data/projects';

// Alternative RPCs to try if the primary fails
const BACKUP_RPCS = [
  'https://ethereum.publicnode.com',
  'https://rpc.ankr.com/eth',
  'https://1rpc.io/eth',
];

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDonated, setTotalDonated] = useState<bigint>(BigInt(0));
  const { address } = useWallet();

  const fetchDonations = useCallback(async () => {
    if (!address) {
      setLoading(false);
      setDonations([]);
      setTotalDonated(BigInt(0));
      return;
    }

    setLoading(true);
    setError(null);

    const rpcsToTry = [RPC_URL, ...BACKUP_RPCS];

    for (const rpcUrl of rpcsToTry) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        // Test the provider first
        await provider.getBlockNumber();

        const mneeContract = new ethers.Contract(MNEE_ADDRESS, MNEE_ABI, provider);

        // Query Transfer events FROM the user's address
        const checksummedAddress = ethers.getAddress(address.toLowerCase());
        const filter = mneeContract.filters.Transfer(checksummedAddress, null);

        // Use a very small block range to avoid RPC limits
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 5000); // ~18 hours of blocks

        const events = await mneeContract.queryFilter(filter, fromBlock, 'latest');

        // Filter to only transfers to project wallets and format as donations
        const donationsData: Donation[] = [];
        let total = BigInt(0);
        let donationId = 1;

        for (const event of events) {
          const log = event as ethers.EventLog;
          if (!log.args) continue;

          const toAddress = log.args.to.toLowerCase();
          const project = getProjectByWallet(toAddress);

          // Only count transfers to project wallets as donations
          if (project) {
            const amount = BigInt(log.args.value.toString());
            total += amount;

            // Get block timestamp (with fallback to avoid additional RPC calls)
            let timestamp = Math.floor(Date.now() / 1000);
            try {
              const block = await provider.getBlock(log.blockNumber);
              timestamp = block?.timestamp ? Number(block.timestamp) : timestamp;
            } catch {
              // Use current time if block fetch fails
            }

            donationsData.push({
              id: donationId++,
              donor: address,
              totalAmount: amount,
              projectIds: [project.id],
              allocations: [amount],
              timestamp,
            });
          }
        }

        // Sort by timestamp descending (newest first)
        donationsData.sort((a, b) => b.timestamp - a.timestamp);

        setDonations(donationsData);
        setTotalDonated(total);
        setLoading(false);
        return; // Success, exit the loop
      } catch (err: any) {
        console.warn(`RPC ${rpcUrl} failed for donations:`, err);
        // Continue to next RPC
      }
    }

    // All RPCs failed
    console.warn('All RPCs failed for donations, showing empty list');
    setDonations([]);
    setTotalDonated(BigInt(0));
    setLoading(false);
  }, [address]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  return { donations, totalDonated, loading, error, refetch: fetchDonations };
}
