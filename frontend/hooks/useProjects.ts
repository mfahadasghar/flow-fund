'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';
import { useContract } from './useContract';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const registryContract = useContract('CHARITY_REGISTRY');

  const fetchProjects = useCallback(async () => {
    if (!registryContract) {
      // Keep loading state true if contract isn't initialized yet
      // This prevents showing "no projects" before the contract is ready
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const activeProjects = await registryContract.getAllActiveProjects();

      const formattedProjects: Project[] = activeProjects.map((p: any) => ({
        id: Number(p.id),
        name: p.name,
        description: p.description,
        wallet: p.wallet,
        totalReceived: BigInt(p.totalReceived.toString()),
        active: p.active,
        createdAt: Number(p.createdAt),
      }));

      setProjects(formattedProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [registryContract]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}
