'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProjects } from '@/hooks/useProjects';
import { useWallet } from '@/context/WalletContext';
import { ethers } from 'ethers';
import { MNEE_ADDRESS, ETHERSCAN_URL, CHAIN_ID, CHAIN_NAME } from '@/lib/contracts/addresses';
import { MNEE_ABI } from '@/lib/contracts/abis';
import { Check, Heart, TrendingUp, Wallet, AlertCircle } from 'lucide-react';

export default function DonatePage() {
  const { projects, loading: loadingProjects } = useProjects();
  const { address, isConnected, connect, mneeBalance, updateMneeBalance, signer, chainId, switchNetwork } = useWallet();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
  const [allocations, setAllocations] = useState<Map<number, number>>(new Map());
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [isDonating, setIsDonating] = useState(false);
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [currentTransfer, setCurrentTransfer] = useState<string>('');

  // Auto-distribute percentages equally when projects are selected
  useEffect(() => {
    if (selectedProjects.size > 0) {
      const percentage = 100 / selectedProjects.size;
      const newAllocations = new Map<number, number>();
      selectedProjects.forEach((id) => {
        newAllocations.set(id, Number(percentage.toFixed(2)));
      });
      setAllocations(newAllocations);
    }
  }, [selectedProjects]);

  const toggleProject = (projectId: number) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
      const newAllocations = new Map(allocations);
      newAllocations.delete(projectId);
      setAllocations(newAllocations);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const updateAllocation = (projectId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newAllocations = new Map(allocations);
    newAllocations.set(projectId, numValue);
    setAllocations(newAllocations);
  };

  const getTotalPercentage = () => {
    let total = 0;
    allocations.forEach((value) => {
      total += value;
    });
    return total;
  };

  const equalSplit = () => {
    if (selectedProjects.size === 0) return;
    const percentage = 100 / selectedProjects.size;
    const newAllocations = new Map<number, number>();
    selectedProjects.forEach((id) => {
      newAllocations.set(id, Number(percentage.toFixed(2)));
    });
    setAllocations(newAllocations);
  };

  const normalizePercentages = () => {
    const total = getTotalPercentage();
    if (total === 0) return;

    const newAllocations = new Map<number, number>();
    allocations.forEach((value, key) => {
      newAllocations.set(key, Number(((value / total) * 100).toFixed(2)));
    });
    setAllocations(newAllocations);
  };

  const handleDonate = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    // Check network
    if (chainId !== CHAIN_ID) {
      setError(`Please switch to ${CHAIN_NAME} to donate`);
      await switchNetwork();
      return;
    }

    if (!signer) {
      setError('Wallet not connected properly. Please reconnect.');
      return;
    }

    if (selectedProjects.size === 0) {
      setError('Please select at least one project');
      return;
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const totalPercentage = getTotalPercentage();
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError(`Percentages must sum to 100% (currently ${totalPercentage.toFixed(2)}%)`);
      return;
    }

    const totalWei = ethers.parseEther(totalAmount);
    if (mneeBalance < totalWei) {
      setError(`Insufficient MNEE balance. You have ${ethers.formatEther(mneeBalance)} MNEE`);
      return;
    }

    setError('');
    setSuccessMessage('');
    setTxHashes([]);
    setIsDonating(true);

    try {
      const mneeContract = new ethers.Contract(MNEE_ADDRESS, MNEE_ABI, signer);
      const hashes: string[] = [];

      // Send MNEE directly to each project wallet
      for (const projectId of selectedProjects) {
        const project = projects.find(p => p.id === projectId);
        if (!project) continue;

        const percentage = allocations.get(projectId) || 0;
        const amount = (BigInt(totalWei) * BigInt(Math.round(percentage * 100))) / BigInt(10000);

        if (amount <= 0) continue;

        setCurrentTransfer(`Sending ${ethers.formatEther(amount)} MNEE to ${project.name}...`);

        const tx = await mneeContract.transfer(project.wallet, amount);
        const receipt = await tx.wait();
        hashes.push(receipt.hash);
      }

      setTxHashes(hashes);
      setSuccessMessage(`Donation successful! ${hashes.length} transfer(s) completed.`);
      setCurrentTransfer('');

      // Reset form
      setSelectedProjects(new Set());
      setAllocations(new Map());
      setTotalAmount('');
      setStep(1);

      // Update balance
      await updateMneeBalance();
    } catch (err: any) {
      console.error('Donation error:', err);
      setError(err.message || 'Transaction failed');
      setCurrentTransfer('');
    } finally {
      setIsDonating(false);
    }
  };

  const selectedProjectsList = Array.from(selectedProjects)
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean);

  const canProceedToStep2 = selectedProjects.size > 0;
  const canProceedToStep3 = canProceedToStep2 && Math.abs(getTotalPercentage() - 100) < 0.01;
  const isWrongNetwork = isConnected && chainId !== CHAIN_ID;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Make a Donation</h1>
        <p className="text-gray-600">
          Support charity projects with direct MNEE transfers on Ethereum
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-start justify-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                step >= 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > 1 ? <Check className="w-5 h-5" /> : 1}
            </div>
            <span className={`text-sm font-medium mt-2 text-center ${step >= 1 ? 'text-primary-600' : 'text-gray-500'}`}>
              Select Projects
            </span>
          </div>

          {/* Connector 1 */}
          <div
            className={`w-24 h-1 mt-5 mx-2 transition-all ${
              step > 1 ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          />

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                step >= 2
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > 2 ? <Check className="w-5 h-5" /> : 2}
            </div>
            <span className={`text-sm font-medium mt-2 text-center ${step >= 2 ? 'text-primary-600' : 'text-gray-500'}`}>
              Allocate Funds
            </span>
          </div>

          {/* Connector 2 */}
          <div
            className={`w-24 h-1 mt-5 mx-2 transition-all ${
              step > 2 ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          />

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                step >= 3
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > 3 ? <Check className="w-5 h-5" /> : 3}
            </div>
            <span className={`text-sm font-medium mt-2 text-center ${step >= 3 ? 'text-primary-600' : 'text-gray-500'}`}>
              Review & Donate
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {!isConnected && (
        <Card className="mb-8 bg-yellow-50 border-yellow-300">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800">Connect your wallet to continue</p>
              <Button onClick={connect} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                Connect Wallet
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isWrongNetwork && (
        <Card className="mb-8 bg-orange-50 border-orange-300">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-orange-800">
                Please switch to {CHAIN_NAME} to donate
              </p>
              <Button onClick={switchNetwork} size="sm" className="bg-orange-600 hover:bg-orange-700">
                Switch Network
              </Button>
            </div>
          </div>
        </Card>
      )}

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
              {txHashes.map((hash, i) => (
                <a
                  key={hash}
                  href={`${ETHERSCAN_URL}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary-600 hover:underline text-sm"
                >
                  View Transaction {i + 1} on Etherscan
                </a>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Step 1: Select Projects */}
      {step === 1 && (
        <div>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Choose Projects to Support</h2>
              <span className="text-sm text-gray-600">
                {selectedProjects.size} selected
              </span>
            </div>

            {loadingProjects ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading projects...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {projects.map((project) => {
                    const isSelected = selectedProjects.has(project.id);
                    return (
                      <div
                        key={project.id}
                        onClick={() => toggleProject(project.id)}
                        className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 bg-primary-600 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="bg-primary-100 p-2 rounded-lg">
                            <Heart className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600">
                              {project.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>Raised: {ethers.formatEther(project.totalReceived)} MNEE</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                    size="lg"
                  >
                    Continue to Allocation
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Step 2: Allocate Funds */}
      {step === 2 && (
        <div>
          <Card>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Allocate Your Donation</h2>
              <p className="text-gray-600">Set the percentage for each project (must total 100%)</p>
            </div>

            <div className="mb-6 flex gap-2">
              <Button onClick={equalSplit} variant="outline" size="sm">
                Equal Split
              </Button>
              {Math.abs(getTotalPercentage() - 100) > 0.01 && getTotalPercentage() > 0 && (
                <Button onClick={normalizePercentages} variant="outline" size="sm">
                  Auto-Adjust to 100%
                </Button>
              )}
            </div>

            <div className="space-y-4 mb-6">
              {selectedProjectsList.map((project) => {
                const percentage = allocations.get(project!.id) || 0;
                return (
                  <div key={project!.id} className="border rounded-lg p-4 bg-gray-50 border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <Heart className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{project!.name}</h3>
                          <p className="text-xs text-gray-500">
                            {project!.wallet.slice(0, 6)}...{project!.wallet.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleProject(project!.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="relative">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 transition-all"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={percentage}
                          onChange={(e) => updateAllocation(project!.id, e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="text-gray-700">%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Allocation:</span>
                <span
                  className={`text-2xl font-bold ${
                    Math.abs(getTotalPercentage() - 100) < 0.01
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {getTotalPercentage().toFixed(2)}%
                </span>
              </div>
              {Math.abs(getTotalPercentage() - 100) > 0.01 && (
                <p className="text-sm text-red-600 mt-2">
                  Total must equal 100%. Current: {getTotalPercentage().toFixed(2)}%
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <Button onClick={() => setStep(1)} variant="outline" size="lg">
                Back to Selection
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                className="bg-primary-600 hover:bg-primary-700 text-white"
                size="lg"
              >
                Continue to Review
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Review & Donate */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold mb-6">Review Your Donation</h2>

              <div className="space-y-4 mb-6">
                {selectedProjectsList.map((project) => {
                  const percentage = allocations.get(project!.id) || 0;
                  const amount = totalAmount ? (parseFloat(totalAmount) * percentage) / 100 : 0;
                  return (
                    <div key={project!.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-100">
                          <Heart className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{project!.name}</h3>
                          <p className="text-sm text-gray-600">{percentage.toFixed(1)}% allocation</p>
                          <p className="text-xs text-gray-400">
                            {project!.wallet}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-600">{amount.toFixed(4)} MNEE</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-start">
                <Button onClick={() => setStep(2)} variant="outline" size="lg">
                  Back to Allocation
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <h2 className="text-xl font-bold mb-4">Payment</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Total Donation Amount (MNEE)
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
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

              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-medium">{selectedProjects.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">{totalAmount || '0'} MNEE</span>
                  </div>
                  <div className="border-t border-primary-200">
                    <div className="flex justify-between font-bold text-base">
                      <span className="dark:text-white">You will donate:</span>
                      <span className="text-primary-600">{totalAmount || '0'} MNEE</span>
                    </div>
                  </div>
                </div>
              </div>

              {currentTransfer && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">{currentTransfer}</p>
                </div>
              )}

              <Button
                onClick={handleDonate}
                disabled={isDonating || !totalAmount || parseFloat(totalAmount) <= 0}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
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

              <p className="text-xs text-gray-500">
                MNEE will be sent directly to each project&apos;s wallet on Ethereum Mainnet
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
