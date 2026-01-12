'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useWallet } from '@/context/WalletContext';
import { useApplications, Application, ApplicationStatus } from '@/hooks/useApplications';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
  Wallet,
  Calendar,
  ExternalLink,
  Loader,
  AlertCircle,
  Shield,
} from 'lucide-react';

// Admin wallet address - should match the contract owner
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();

export default function AdminApplicationsPage() {
  const { address } = useWallet();
  const { applications, loading, fetchApplications, approveApplication, rejectApplication } = useApplications();

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  // Check if current user is admin
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS;

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === ApplicationStatus.Pending;
    if (filter === 'approved') return app.status === ApplicationStatus.Approved;
    if (filter === 'rejected') return app.status === ApplicationStatus.Rejected;
    return true;
  });

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ApplicationStatus.Approved:
        return 'text-green-600 bg-green-50 border-green-200';
      case ApplicationStatus.Rejected:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending:
        return <Clock className="w-5 h-5" />;
      case ApplicationStatus.Approved:
        return <CheckCircle className="w-5 h-5" />;
      case ApplicationStatus.Rejected:
        return <XCircle className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Pending:
        return 'Pending';
      case ApplicationStatus.Approved:
        return 'Approved';
      case ApplicationStatus.Rejected:
        return 'Rejected';
    }
  };

  const handleApprove = async () => {
    if (!selectedApp || !projectDescription.trim()) {
      setError('Project description is required');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const result = await approveApplication(selectedApp.id, projectDescription);

      if (!result.success) {
        throw new Error(result.error || 'Failed to approve application');
      }

      setSuccess(`Application approved! Project ID: ${result.projectId}`);
      setShowApproveModal(false);
      setSelectedApp(null);
      setProjectDescription('');

      // Refresh applications
      await fetchApplications();
    } catch (err: any) {
      console.error('Error approving application:', err);
      setError(err.message || 'Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const result = await rejectApplication(selectedApp.id, rejectionReason);

      if (!result.success) {
        throw new Error(result.error || 'Failed to reject application');
      }

      setSuccess('Application rejected successfully');
      setShowRejectModal(false);
      setSelectedApp(null);
      setRejectionReason('');

      // Refresh applications
      await fetchApplications();
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      setError(err.message || 'Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Connection Required</h2>
            <p className="text-gray-600">Please connect your wallet to access the admin panel</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You do not have permission to access this page</p>
            <p className="text-sm text-gray-500 mt-2">Only contract administrators can review applications</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Charity Applications</h1>
          <p className="text-lg text-gray-600">Review and manage charity applications</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex space-x-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({applications.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending ({applications.filter(a => a.status === ApplicationStatus.Pending).length})
          </Button>
          <Button
            variant={filter === 'approved' ? 'primary' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            Approved ({applications.filter(a => a.status === ApplicationStatus.Approved).length})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'primary' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({applications.filter(a => a.status === ApplicationStatus.Rejected).length})
          </Button>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No applications found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {app.logoHash && (
                          <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                            <FileText className="w-6 h-6 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{app.organizationName}</h3>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium mt-1 ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1">{getStatusText(app.status)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="text-sm">{app.contactEmail}</span>
                        </div>
                        {app.ein && (
                          <div className="flex items-center text-gray-600">
                            <FileText className="w-4 h-4 mr-2" />
                            <span className="text-sm">EIN: {app.ein}</span>
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <Wallet className="w-4 h-4 mr-2" />
                          <span className="text-sm font-mono">{app.wallet.slice(0, 10)}...{app.wallet.slice(-8)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {new Date(Number(app.submittedAt) * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-700 text-sm line-clamp-2">{app.missionStatement}</p>
                      </div>

                      {app.documentsHash && (
                        <div className="mt-4">
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <FileText className="w-4 h-4 mr-1" />
                            Documents: {app.documentsHash}
                          </span>
                        </div>
                      )}

                      {app.status === ApplicationStatus.Rejected && app.reviewNotes && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {app.reviewNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {app.status === ApplicationStatus.Pending && (
                      <div className="ml-4 flex flex-col space-y-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowApproveModal(true);
                            setProjectDescription(app.missionStatement);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowRejectModal(true);
                          }}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Approve Application</h2>
              <p className="text-gray-600 mb-4">
                You are about to approve <strong>{selectedApp.organizationName}</strong> and create a new charity project.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter a description for the project..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedApp(null);
                    setProjectDescription('');
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing || !projectDescription.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Approve & Create Project'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Application</h2>
              <p className="text-gray-600 mb-4">
                You are about to reject the application from <strong>{selectedApp.organizationName}</strong>.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedApp(null);
                    setRejectionReason('');
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {processing ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Reject Application'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
