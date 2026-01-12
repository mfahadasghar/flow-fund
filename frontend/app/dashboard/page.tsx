'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/context/WalletContext';
import { useDonations } from '@/hooks/useDonations';
import { useProjects } from '@/hooks/useProjects';
import { ethers } from 'ethers';
import { ETHERSCAN_URL } from '@/lib/contracts/addresses';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import { Heart, TrendingUp, Users, Wallet, AlertCircle, ExternalLink, Loader2, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

function useChartColors() {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    const getColors = () => {
      const style = getComputedStyle(document.documentElement);
      return [
        `hsl(${style.getPropertyValue('--chart-1')})`,
        `hsl(${style.getPropertyValue('--chart-2')})`,
        `hsl(${style.getPropertyValue('--chart-3')})`,
        `hsl(${style.getPropertyValue('--chart-4')})`,
        `hsl(${style.getPropertyValue('--chart-5')})`,
      ];
    };

    setColors(getColors());

    // Update colors when theme changes
    const observer = new MutationObserver(() => {
      setColors(getColors());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}

export default function DashboardPage() {
  const { address, isConnected, connect } = useWallet();
  const { donations, totalDonated, loading, error } = useDonations();
  const { projects } = useProjects();
  const chartColors = useChartColors();

  // Fallback colors if chart colors aren't loaded yet
  const COLORS = chartColors.length > 0 ? chartColors : [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'
  ];

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 mx-auto">
            <Wallet className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your wallet to view your donation history and track your impact
          </p>
          <Button onClick={connect} size="lg" className="bg-primary-600 hover:bg-primary-700 text-white">
            Connect Wallet
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-primary-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-red-50 border-red-300">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-600">Error loading dashboard: {error}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate allocation breakdown by project
  const projectAllocations = new Map<number, bigint>();
  donations.forEach((donation) => {
    donation.projectIds.forEach((projectId, index) => {
      const current = projectAllocations.get(projectId) || BigInt(0);
      projectAllocations.set(projectId, current + donation.allocations[index]);
    });
  });

  const chartData = Array.from(projectAllocations.entries()).map(([projectId, amount]) => {
    const project = projects.find((p) => p.id === projectId);
    return {
      name: project?.name || `Project #${projectId}`,
      value: parseFloat(ethers.formatEther(amount)),
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Heart className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Your Dashboard</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track your donations and see your impact on the blockchain
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Donated</div>
              <div className="text-2xl font-bold text-primary-600">
                {ethers.formatEther(totalDonated)} MNEE
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Number of Donations</div>
              <div className="text-2xl font-bold text-green-600">{donations.length}</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Projects Supported</div>
              <div className="text-2xl font-bold text-blue-600">
                {projectAllocations.size}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {donations.length === 0 ? (
        <Card className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 mx-auto">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">No Donations Yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start making a difference by donating to charity projects
          </p>
          <Link href="/donate">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white">
              Make Your First Donation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Allocation Chart */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-primary-600 mr-2" />
              Allocation Breakdown
            </h2>
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)} MNEE`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Recent Donations */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Calendar className="w-6 h-6 text-primary-600 mr-2" />
              Recent Donations
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {donations
                .slice()
                .reverse()
                .slice(0, 5)
                .map((donation) => (
                  <div key={donation.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(donation.timestamp * 1000).toLocaleDateString()}
                      </div>
                      <div className="font-bold text-primary-600">
                        {ethers.formatEther(donation.totalAmount)} MNEE
                      </div>
                    </div>
                    <div className="text-sm flex items-center">
                      <Heart className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-gray-600">To {donation.projectIds.length} project{donation.projectIds.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* Donation History Table */}
      {donations.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Heart className="w-6 h-6 text-primary-600 mr-2" />
            Complete Donation History
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donation ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations
                  .slice()
                  .reverse()
                  .map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(donation.timestamp * 1000).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                        {ethers.formatEther(donation.totalAmount)} MNEE
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="space-y-1">
                          {donation.projectIds.map((projectId, index) => {
                            const project = projects.find((p) => p.id === projectId);
                            const allocation = donation.allocations[index];
                            return (
                              <div key={projectId} className="flex items-center">
                                <Heart className="w-3 h-3 text-primary-400 mr-1" />
                                <span>
                                  {project?.name || `Project #${projectId}`}:{' '}
                                  {ethers.formatEther(allocation)} MNEE
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{donation.id}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Wallet Info */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="bg-primary-100 p-3 rounded-lg">
            <Wallet className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Wallet Information</h3>
            <p className="text-sm text-gray-600 mb-3 font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <a
              href={`${ETHERSCAN_URL}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
            >
              View on Etherscan
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
