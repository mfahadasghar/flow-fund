'use client';

import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/Button';
import { ethers } from 'ethers';
import { CHAIN_ID, CHAIN_NAME } from '@/lib/contracts/addresses';

export function Navbar() {
  const { address, chainId, isConnected, isConnecting, connect, disconnect, switchNetwork, mneeBalance } =
    useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isWrongNetwork = isConnected && chainId !== CHAIN_ID;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-black">
              FlowFund
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/projects"
                className="text-black hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Projects
              </Link>
              <Link
                href="/donate"
                className="text-black hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Donate
              </Link>
              <Link
                href="/dashboard"
                className="text-black hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected && address && (
              <div className="hidden md:flex flex-col items-end text-sm">
                <div className="text-black">
                  {ethers.formatEther(mneeBalance)} MNEE
                </div>
                {isWrongNetwork && (
                  <div className="text-red-600 text-xs">Wrong Network</div>
                )}
              </div>
            )}

            {isConnected && address ? (
              <>
                {isWrongNetwork ? (
                  <Button onClick={switchNetwork} variant="secondary" size="sm">
                    Switch to {CHAIN_NAME}
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="hidden sm:block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {formatAddress(address)}
                    </div>
                    <Button onClick={disconnect} variant="outline" size="sm">
                      Disconnect
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Button onClick={connect} disabled={isConnecting} size="sm">
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
