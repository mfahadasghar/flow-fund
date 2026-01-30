'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Project } from '@/types';
import { STATIC_PROJECTS } from '@/lib/data/projects';
import { MNEE_ADDRESS, RPC_URL } from '@/lib/contracts/addresses';
import { MNEE_ABI } from '@/lib/contracts/abis';

// Alternative RPCs to try if the primary fails
const BACKUP_RPCS = [
  'https://ethereum.publicnode.com',
  'https://rpc.ankr.com/eth',
  'https://1rpc.io/eth',
];

async function tryFetchWithProvider(
  provider: ethers.JsonRpcProvider,
  project: { id: number; name: string; description: string; wallet: string; active: boolean },
  mneeAddress: string,
  mneeAbi: readonly string[]
): Promise<bigint> {
  const mneeContract = new ethers.Contract(mneeAddress, mneeAbi, provider);
  const checksummedWallet = ethers.getAddress(project.wallet.toLowerCase());
  const filter = mneeContract.filters.Transfer(null, checksummedWallet);

  // Use a very small block range to avoid RPC limits
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 5000); // ~18 hours of blocks

  const events = await mneeContract.queryFilter(filter, fromBlock, 'latest');

  let totalReceived = BigInt(0);
  for (const event of events) {
    const log = event as ethers.EventLog;
    if (log.args) {
      totalReceived += BigInt(log.args.value.toString());
    }
  }
  return totalReceived;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Start with static projects with zero totals (fast initial load)
      const initialProjects = STATIC_PROJECTS.filter(p => p.active).map(p => ({
        ...p,
        totalReceived: BigInt(0),
      }));
      setProjects(initialProjects);

      // Try to fetch actual totals from blockchain (non-blocking)
      const rpcsToTry = [RPC_URL, ...BACKUP_RPCS];
      let fetchedSuccessfully = false;

      for (const rpcUrl of rpcsToTry) {
        if (fetchedSuccessfully) break;

        try {
          const provider = new ethers.JsonRpcProvider(rpcUrl);

          // Test the provider first with a simple call
          await provider.getBlockNumber();

          const projectsWithTotals: Project[] = await Promise.all(
            STATIC_PROJECTS.map(async (project) => {
              try {
                const totalReceived = await tryFetchWithProvider(
                  provider,
                  project,
                  MNEE_ADDRESS,
                  MNEE_ABI
                );
                return { ...project, totalReceived };
              } catch (err) {
                console.warn(`Failed to fetch for project ${project.id}:`, err);
                return { ...project, totalReceived: BigInt(0) };
              }
            })
          );

          setProjects(projectsWithTotals.filter(p => p.active));
          fetchedSuccessfully = true;
        } catch (rpcErr) {
          console.warn(`RPC ${rpcUrl} failed, trying next...`, rpcErr);
        }
      }

      if (!fetchedSuccessfully) {
        console.warn('All RPCs failed, showing projects with zero totals');
        // Projects already set with zeros above
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');

      // Fallback to static data without totals
      setProjects(STATIC_PROJECTS.filter(p => p.active).map(p => ({
        ...p,
        totalReceived: BigInt(0),
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}
