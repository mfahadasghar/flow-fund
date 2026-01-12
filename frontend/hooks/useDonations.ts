'use client';

import { useState, useEffect, useCallback } from 'react';
import { Donation } from '@/types';
import { useContract } from './useContract';
import { useWallet } from '@/context/WalletContext';

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDonated, setTotalDonated] = useState<bigint>(BigInt(0));
  const donationManagerContract = useContract('DONATION_MANAGER');
  const { address } = useWallet();

  const fetchDonations = useCallback(async () => {
    if (!donationManagerContract || !address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get donation IDs for this donor
      const donationIds = await donationManagerContract.getDonationsByDonor(address);

      // Fetch details for each donation
      const donationPromises = donationIds.map(async (id: bigint) => {
        const donation = await donationManagerContract.getDonation(id);
        return {
          id: Number(donation.id),
          donor: donation.donor,
          totalAmount: BigInt(donation.totalAmount.toString()),
          projectIds: donation.projectIds.map((pid: bigint) => Number(pid)),
          allocations: donation.allocations.map((a: bigint) => BigInt(a.toString())),
          timestamp: Number(donation.timestamp),
        };
      });

      const donationsData = await Promise.all(donationPromises);
      setDonations(donationsData);

      // Get total donated by this donor
      const total = await donationManagerContract.getDonorTotal(address);
      setTotalDonated(BigInt(total.toString()));
    } catch (err: any) {
      console.error('Error fetching donations:', err);
      setError(err.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, [donationManagerContract, address]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  return { donations, totalDonated, loading, error, refetch: fetchDonations };
}
