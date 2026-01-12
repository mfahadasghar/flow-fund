'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useWallet } from '@/context/WalletContext';
import { useApplications } from '@/hooks/useApplications';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ApplyPage() {
  const router = useRouter();
  const { address, connectWallet } = useWallet();
  const { submitApplication } = useApplications();

  const [formData, setFormData] = useState({
    organizationName: '',
    ein: '',
    contactEmail: '',
    missionStatement: '',
    wallet: address || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const validateForm = (): boolean => {
    if (!formData.organizationName.trim()) {
      setError('Organization name is required');
      return false;
    }

    if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
      setError('Valid contact email is required');
      return false;
    }

    if (!formData.missionStatement.trim() || formData.missionStatement.length < 50) {
      setError('Mission statement must be at least 50 characters');
      return false;
    }

    if (!formData.wallet || !formData.wallet.startsWith('0x')) {
      setError('Valid wallet address is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Submit application to blockchain with placeholder hashes
      console.log('Submitting application to blockchain...');
      const result = await submitApplication({
        organizationName: formData.organizationName,
        ein: formData.ein,
        contactEmail: formData.contactEmail,
        missionStatement: formData.missionStatement,
        wallet: formData.wallet as `0x${string}`,
        documentsHash: 'QmPlaceholderDocumentsHash',
        logoHash: 'QmPlaceholderLogoHash',
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit application');
      }

      setSuccess(true);
      setSubmitting(false);

      // Redirect to success page after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
      setSubmitting(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Connection Required</h2>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to submit a charity application
            </p>
            <Button onClick={connectWallet} size="lg">
              Connect Wallet
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12 text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your charity application has been successfully submitted and is now pending review.
                We'll notify you once it's been reviewed by our team.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to home page...
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Apply as a Charity</h1>
            <p className="text-lg text-gray-600">
              Join FlowFund and receive transparent, blockchain-verified donations from donors worldwide
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Organization Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Organization Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your Charity Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      EIN / Registration Number
                    </label>
                    <input
                      type="text"
                      name="ein"
                      value={formData.ein}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="contact@yourcharity.org"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Address *
                    </label>
                    <input
                      type="text"
                      name="wallet"
                      value={formData.wallet}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                      placeholder="0x..."
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This is the address where donations will be sent
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mission Statement * (minimum 50 characters)
                    </label>
                    <textarea
                      name="missionStatement"
                      value={formData.missionStatement}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Describe your organization's mission, goals, and the impact you make..."
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.missionStatement.length} characters
                    </p>
                  </div>
                </div>
              </div>


              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}


              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
