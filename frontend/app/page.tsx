'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProjects } from '@/hooks/useProjects';
import { ethers } from 'ethers';
import { getProjectVisual, formatCurrency } from '@/lib/utils/projectData';
import { ArrowRight, Shield, Zap, Coins, TrendingUp, Sparkles } from 'lucide-react';
import { BlockchainVisualization } from '@/components/BlockchainVisualization';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
    },
  },
};

export default function HomePage() {
  const { projects } = useProjects();

  // Calculate total donated from all projects
  const totalDonated = useMemo(() => {
    return projects.reduce((sum, p) => sum + p.totalReceived, BigInt(0));
  }, [projects]);

  const stats = [
    {
      label: 'MNEE Donated',
      value: formatCurrency(ethers.formatEther(totalDonated)),
      icon: Coins,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Active Projects',
      value: projects.length.toString(),
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Network',
      value: 'Ethereum',
      icon: Shield,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Blockchain Transparency',
      description: 'Every donation is recorded on the Ethereum blockchain, ensuring complete transparency and traceability.',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Zap,
      title: 'Direct Transfers',
      description: 'MNEE is sent directly to project wallets with no intermediaries. Track every transaction on Etherscan.',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Coins,
      title: 'MNEE Stablecoin',
      description: 'Donate using MNEE stablecoin on Ethereum mainnet for predictable value and real impact.',
      gradient: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-accent-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow"></div>
          <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by MNEE on Ethereum</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Smart Charity
              <span className="block bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
                Donations
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-3xl mx-auto">
              Transparent, direct giving powered by MNEE stablecoin. Support causes you care about with complete blockchain transparency.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link href="/donate">
                <Button
                  size="lg"
                  variant="ghost"
                  className="group bg-white text-primary-600 hover:bg-primary-600 hover:text-white shadow-2xl hover:shadow-glow-lg px-8 py-4 text-lg font-semibold"
                >
                  Start Donating
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                >
                  Explore Projects
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-gray-600">{stat.label}</div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Why Choose FlowFund?
            </h2>
            <p className="text-xl text-gray-600">
              Experience transparent charitable giving with real MNEE on Ethereum
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-200">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Blockchain Visualization */}
      <BlockchainVisualization />

      {/* Featured Projects */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600">
              Support these amazing causes making a real difference
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {projects.slice(0, 3).map((project) => {
              const visual = getProjectVisual(project.id);
              const Icon = visual.icon;

              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300">
                    {/* Project Image/Gradient */}
                    <div className={`relative h-48 bg-gradient-to-br ${visual.gradient} flex items-center justify-center`}>
                      <Icon className="w-20 h-20 text-white/90" />
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {visual.category}
                        </span>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">
                        {project.name}
                      </h3>
                      <p className="text-gray-600">{project.description}</p>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-500">Total Raised</div>
                          <div className="text-2xl font-bold text-primary-600">
                            {formatCurrency(ethers.formatEther(project.totalReceived))} MNEE
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/projects/${project.id}`} className="flex-1">
                          <Button className="w-full group-hover:shadow-lg" variant="outline">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/projects/${project.id}`} className="flex-1">
                          <Button className="w-full group-hover:shadow-lg bg-primary-600 hover:bg-primary-700 text-white">
                            Donate
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {projects.length > 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link href="/projects">
                <Button variant="outline" size="lg" className="group">
                  View All Projects
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQgMi42ODYtNiA2LTZzNi0yLjY4NiA2LTZ2NmMwIDMuMzE0IDIuNjg2IDYgNiA2aC02Yy0zLjMxNCAwLTYgMi42ODYtNiA2di02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-2xl mx-auto">
              Start donating today and track your impact on Etherscan with complete transparency
            </p>
            <Link href="/donate">
              <Button size="lg" variant="ghost" className="bg-white text-primary-600 hover:bg-primary-600 hover:text-white shadow-2xl hover:shadow-glow-lg px-10 py-5 text-lg font-semibold group">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
