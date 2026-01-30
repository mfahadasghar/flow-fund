'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProjects } from '@/hooks/useProjects';
import { useWallet } from '@/context/WalletContext';
import { ethers } from 'ethers';
import { MNEE_ADDRESS, ETHERSCAN_URL, CHAIN_ID, CHAIN_NAME } from '@/lib/contracts/addresses';
import { MNEE_ABI } from '@/lib/contracts/abis';
import Link from 'next/link';
import { ArrowLeft, Users, TrendingUp, Wallet, Heart, AlertCircle, Check, ExternalLink } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id ? parseInt(params.id as string) : null;

  const { projects, loading: loadingProjects } = useProjects();
  const { address, isConnected, connect, mneeBalance, updateMneeBalance, signer, chainId, switchNetwork } = useWallet();

  const [donationAmount, setDonationAmount] = useState<string>('');
  const [isDonating, setIsDonating] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!loadingProjects && projects.length > 0 && !project && projectId !== null) {
      router.push('/projects');
    }
  }, [loadingProjects, projects.length, project, projectId, router]);

  const handleDonate = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (chainId !== CHAIN_ID) {
      setError(`Please switch to ${CHAIN_NAME} to donate`);
      await switchNetwork();
      return;
    }

    if (!signer) {
      setError('Wallet not connected properly. Please reconnect.');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!project) {
      setError('Project not found');
      return;
    }

    setError('');
    setSuccessMessage('');

    try {
      const amount = ethers.parseEther(donationAmount);

      if (mneeBalance < amount) {
        setError(`Insufficient MNEE balance. You have ${ethers.formatEther(mneeBalance)} MNEE`);
        return;
      }

      setIsDonating(true);

      // Direct MNEE transfer to project wallet
      const mneeContract = new ethers.Contract(MNEE_ADDRESS, MNEE_ABI, signer);
      const tx = await mneeContract.transfer(project.wallet, amount);
      const receipt = await tx.wait();

      setTxHash(receipt.hash);
      setSuccessMessage('Donation successful! Thank you for your contribution.');
      setDonationAmount('');
      await updateMneeBalance();
    } catch (err: any) {
      console.error('Donation error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsDonating(false);
    }
  };

  const isWrongNetwork = isConnected && chainId !== CHAIN_ID;

  if (loadingProjects) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        href="/projects"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Heart className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{project.name}</h1>
        <div className="flex items-center justify-center space-x-4 text-sm mb-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            Active
          </span>
          <span className="text-gray-600">Project #{project.id}</span>
        </div>
        <p className="text-lg text-gray-600">{project.description}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Raised</div>
              <div className="text-2xl font-bold text-primary-600">
                {ethers.formatEther(project.totalReceived)} MNEE
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-2xl font-bold text-gray-900">
                {project.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Project Wallet</div>
              <div className="text-sm font-mono text-gray-900">
                {project.wallet.slice(0, 10)}...{project.wallet.slice(-8)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Card className="mb-8 bg-red-50 border-red-300">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        </Card>
      )}

      {successMessage && (
        <Card className="mb-8 bg-green-50 border-green-300">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-600">{successMessage}</p>
              {txHash && (
                <a
                  href={`${ETHERSCAN_URL}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline text-sm inline-flex items-center"
                >
                  View Transaction on Etherscan
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Details */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-bold mb-6">About This Project</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Heart className="w-5 h-5 text-primary-600 mr-2" />
                  Mission
                </h3>
                <p className="text-gray-700">{project.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-lg mb-4">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Project ID</div>
                    <div className="font-semibold text-lg">#{project.id}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-semibold text-lg">
                      {project.active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-gray-600">Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Received</div>
                    <div className="font-semibold text-lg">{ethers.formatEther(project.totalReceived)} MNEE</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Wallet Address</div>
                    <div className="font-mono text-xs break-all font-medium">{project.wallet}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-lg mb-3">Blockchain Transparency</h3>
                <p className="text-gray-700">
                  All donations to this project are recorded on the Ethereum blockchain. MNEE is sent directly to the project&apos;s wallet. You can verify all transactions on Etherscan.
                </p>
                <a
                  href={`${ETHERSCAN_URL}/address/${project.wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Wallet on Etherscan
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Donation Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h2 className="text-xl font-bold mb-4">Make a Donation</h2>

            {!isConnected && (
              <Card className="mb-4 bg-yellow-50 border-yellow-300">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-yellow-800">Connect your wallet to donate</p>
                    <Button onClick={connect} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                      Connect Wallet
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {isWrongNetwork && (
              <Card className="mb-4 bg-orange-50 border-orange-300">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-orange-800">
                      Please switch to {CHAIN_NAME}
                    </p>
                    <Button onClick={switchNetwork} size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Switch Network
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Donation Amount (MNEE)
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-lg font-semibold"
                  step="0.0001"
                  min="0"
                />
              </div>
              {isConnected && (
                <p className="text-sm text-gray-500">
                  Available: {ethers.formatEther(mneeBalance)} MNEE
                </p>
              )}
            </div>

            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
              <h3 className="font-semibold mb-3 text-sm flex items-center">
                <Heart className="w-4 h-4 text-primary-600 mr-2" />
                Your donation will go to:
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{project.name}</span>
                <span className="font-bold text-primary-600 text-lg">100%</span>
              </div>
            </div>

            <Button
              onClick={handleDonate}
              disabled={isDonating || !donationAmount || parseFloat(donationAmount) <= 0}
              className="w-full mb-4 bg-primary-600 hover:bg-primary-700 text-white"
              size="lg"
            >
              {!isConnected
                ? 'Connect Wallet'
                : isWrongNetwork
                ? `Switch to ${CHAIN_NAME}`
                : isDonating
                ? 'Processing...'
                : 'Complete Donation'}
            </Button>

            <div className="text-center pt-4 border-t border-gray-200">
              <Link href="/donate" className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                Want to donate to multiple projects?
                <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
              </Link>
            </div>

            <p className="text-xs text-gray-500">
              MNEE is sent directly to the project wallet on Ethereum Mainnet
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
