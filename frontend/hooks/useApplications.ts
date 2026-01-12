import { useState, useEffect } from 'react';
import { useContract } from './useContract';
import { ethers } from 'ethers';

export enum ApplicationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface Application {
  id: bigint;
  applicant: string;
  organizationName: string;
  ein: string;
  contactEmail: string;
  missionStatement: string;
  wallet: string;
  documentsHash: string;
  logoHash: string;
  status: ApplicationStatus;
  submittedAt: bigint;
  reviewedAt: bigint;
  reviewNotes: string;
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const registryContract = useContract('CHARITY_REGISTRY');

  useEffect(() => {
    fetchApplications();
  }, [registryContract]);

  async function fetchApplications() {
    if (!registryContract) return;

    try {
      setLoading(true);
      setError(null);
      const apps = await registryContract.getAllApplications();
      setApplications(apps);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }

  async function getPendingApplications(): Promise<Application[]> {
    if (!registryContract) return [];

    try {
      return await registryContract.getPendingApplications();
    } catch (err: any) {
      console.error('Error fetching pending applications:', err);
      return [];
    }
  }

  async function submitApplication(data: {
    organizationName: string;
    ein: string;
    contactEmail: string;
    missionStatement: string;
    wallet: string;
    documentsHash: string;
    logoHash: string;
  }): Promise<{ success: boolean; applicationId?: bigint; error?: string }> {
    if (!registryContract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const tx = await registryContract.submitApplication(
        data.organizationName,
        data.ein,
        data.contactEmail,
        data.missionStatement,
        data.wallet,
        data.documentsHash,
        data.logoHash
      );

      const receipt = await tx.wait();

      // Get application ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = registryContract.interface.parseLog(log);
          return parsed?.name === 'ApplicationSubmitted';
        } catch {
          return false;
        }
      });

      let applicationId: bigint | undefined;
      if (event) {
        const parsed = registryContract.interface.parseLog(event);
        applicationId = parsed?.args.applicationId;
      }

      await fetchApplications();

      return { success: true, applicationId };
    } catch (err: any) {
      console.error('Error submitting application:', err);
      return { success: false, error: err.message || 'Failed to submit application' };
    }
  }

  async function approveApplication(
    applicationId: bigint,
    projectDescription: string
  ): Promise<{ success: boolean; projectId?: bigint; error?: string }> {
    if (!registryContract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const tx = await registryContract.approveApplication(
        applicationId,
        projectDescription
      );

      const receipt = await tx.wait();

      // Get project ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = registryContract.interface.parseLog(log);
          return parsed?.name === 'ApplicationApproved';
        } catch {
          return false;
        }
      });

      let projectId: bigint | undefined;
      if (event) {
        const parsed = registryContract.interface.parseLog(event);
        projectId = parsed?.args.projectId;
      }

      await fetchApplications();

      return { success: true, projectId };
    } catch (err: any) {
      console.error('Error approving application:', err);
      return { success: false, error: err.message || 'Failed to approve application' };
    }
  }

  async function rejectApplication(
    applicationId: bigint,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!registryContract) {
      return { success: false, error: 'Contract not loaded' };
    }

    try {
      const tx = await registryContract.rejectApplication(applicationId, reason);
      await tx.wait();

      await fetchApplications();

      return { success: true };
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      return { success: false, error: err.message || 'Failed to reject application' };
    }
  }

  async function getApplication(applicationId: bigint): Promise<Application | null> {
    if (!registryContract) return null;

    try {
      return await registryContract.getApplication(applicationId);
    } catch (err: any) {
      console.error('Error fetching application:', err);
      return null;
    }
  }

  return {
    applications,
    loading,
    error,
    fetchApplications,
    getPendingApplications,
    submitApplication,
    approveApplication,
    rejectApplication,
    getApplication,
  };
}
