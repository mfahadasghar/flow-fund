'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Wallet, ArrowRight, Heart, Shield, Zap } from 'lucide-react';

interface DonationFlow {
  id: number;
  active: boolean;
}

export function BlockchainVisualization() {
  const [flowingDonation, setFlowingDonation] = useState<DonationFlow[]>([]);
  const [blockchainBlocks, setBlockchainBlocks] = useState<number[]>([1, 2, 3]);

  // Simulate donation flows
  useEffect(() => {
    const interval = setInterval(() => {
      const newId = Date.now();
      setFlowingDonation([{ id: newId, active: true }]);

      // Add new block to blockchain
      setTimeout(() => {
        setBlockchainBlocks((prev) => [...prev.slice(-2), prev[prev.length - 1] + 1]);
      }, 2000);

      // Remove after animation
      setTimeout(() => {
        setFlowingDonation([]);
      }, 3000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const projects = [
    { id: 1, name: 'Clean Water', color: 'from-blue-400 to-blue-600', percentage: '40%' },
    { id: 2, name: 'Education', color: 'from-purple-400 to-purple-600', percentage: '35%' },
    { id: 3, name: 'Healthcare', color: 'from-green-400 to-green-600', percentage: '25%' },
  ];

  return (
    <div className="relative w-full py-16 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 opacity-50" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            How Blockchain Donations Work
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Watch your donation flow securely through smart contracts to charity projects
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative">
          {/* Donor Wallet */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-primary-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Wallet</h3>
                <p className="text-sm text-gray-600 mb-4">Connect & donate with MNEE tokens</p>
                <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
                  <div className="text-xs text-gray-600 mb-1">Wallet Balance</div>
                  <div className="text-lg font-bold text-primary-600">1,000 MNEE</div>
                </div>
              </div>
            </div>

            {/* Animated Donation Flow - Right */}
            <AnimatePresence>
              {flowingDonation.map((flow) => (
                <motion.div
                  key={flow.id}
                  initial={{ x: 0, opacity: 0, scale: 0.5 }}
                  animate={{ x: 180, opacity: [0, 1, 1, 0], scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                  className="absolute top-1/2 right-0 transform -translate-y-1/2"
                >
                  <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-full p-3 shadow-lg">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Smart Contract */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-purple-500 to-primary-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"
              />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-xl mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Contract</h3>
                <p className="text-sm text-white/90 mb-4">Automated & transparent distribution</p>

                {/* Blockchain Blocks */}
                <div className="space-y-2">
                  {blockchainBlocks.slice(-3).map((block, index) => (
                    <motion.div
                      key={block}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/20 backdrop-blur rounded-lg p-2 border border-white/30"
                    >
                      <div className="flex items-center justify-between text-xs text-white">
                        <span className="font-mono">Block #{block}</span>
                        <Zap className="w-3 h-3" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Animated Donation Flow - To Projects */}
            <AnimatePresence>
              {flowingDonation.map((flow) => (
                <div key={`flow-${flow.id}`}>
                  {projects.map((project, idx) => (
                    <motion.div
                      key={`${flow.id}-${project.id}`}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                      animate={{
                        x: 180,
                        y: (idx - 1) * 80,
                        opacity: [0, 1, 1, 0],
                        scale: 1,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        delay: 1.5,
                        ease: 'easeInOut',
                      }}
                      className="absolute top-1/2 right-0 transform -translate-y-1/2"
                    >
                      <div className={`bg-gradient-to-r ${project.color} rounded-full p-2 shadow-lg`}>
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Charity Projects */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100 hover:border-primary-300 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className={`bg-gradient-to-br ${project.color} rounded-lg p-3`}>
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: project.percentage }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                          className={`bg-gradient-to-r ${project.color} h-full rounded-full`}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{project.percentage}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">100% Transparent</h4>
            <p className="text-sm text-gray-600">Every transaction is recorded on-chain</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Instant Distribution</h4>
            <p className="text-sm text-gray-600">Smart contracts allocate funds automatically</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Direct Impact</h4>
            <p className="text-sm text-gray-600">Funds go directly to charity projects</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Missing Coins component - adding it here
function Coins({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
