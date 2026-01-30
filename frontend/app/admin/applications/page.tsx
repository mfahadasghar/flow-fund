'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Settings, ArrowLeft } from 'lucide-react';

export default function AdminApplicationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 mb-6">
              <Settings className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Admin Panel
            </h1>

            <p className="text-lg text-gray-600">
              The admin panel for reviewing charity applications is not available in this version.
              Projects are currently managed manually to ensure quality and legitimacy.
            </p>

            <div className="bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Current Setup
              </h2>
              <ul className="text-left text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">-</span>
                  Projects are stored in static configuration
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">-</span>
                  Donations go directly to project wallets
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">-</span>
                  All transactions tracked on Ethereum blockchain
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">-</span>
                  No smart contract deployment required
                </li>
              </ul>
            </div>

            <Link href="/">
              <Button variant="outline" size="lg" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
