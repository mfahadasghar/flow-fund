'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProjects } from '@/hooks/useProjects';
import { ethers } from 'ethers';
import Link from 'next/link';
import { Heart, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export default function ProjectsPage() {
  const { projects, loading, error } = useProjects();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-primary-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-red-50 border-red-300">
          <p className="text-red-600">Error loading projects: {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Heart className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Charity Projects</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse all active charity projects and make a difference today
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
          <p className="text-gray-600">
            Check back soon for new charity projects to support!
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Heart className="w-5 h-5 text-primary-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Total Raised</div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-primary-600" />
                        <div className="text-lg font-bold text-primary-600">
                          {ethers.formatEther(project.totalReceived)} MNEE
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Project ID</div>
                      <div className="text-lg font-bold text-gray-900">#{project.id}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button className="w-full" variant="outline">View Details</Button>
                    </Link>
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                        Donate
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200 text-center py-12">
            <Heart className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to donate?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Support one or multiple projects with automated fund allocation and complete blockchain transparency
            </p>
            <Link href="/donate">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white">
                Go to Donation Page
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </>
      )}
    </div>
  );
}
