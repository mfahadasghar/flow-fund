'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 mb-6">
              <Mail className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Want to List Your Charity?
            </h1>

            <p className="text-lg text-gray-600">
              We&apos;re currently onboarding charity projects manually to ensure quality and legitimacy.
              If you&apos;d like to have your organization listed on FlowFund, please reach out to us.
            </p>

            <div className="bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                What We Need From You
              </h2>
              <ul className="text-left text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">1.</span>
                  Organization name and description
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">2.</span>
                  Ethereum wallet address for receiving donations
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">3.</span>
                  Proof of charitable status (optional but recommended)
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">4.</span>
                  Contact information
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <Button variant="outline" size="lg" className="group">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Button>
              </Link>
              <a href="mailto:contact@flowfund.org?subject=Charity%20Application">
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </a>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
