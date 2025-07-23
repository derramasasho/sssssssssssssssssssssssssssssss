'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

// =============================================================================
// FEATURES DATA
// =============================================================================

const features = [
  {
    icon: ChartBarIcon,
    title: 'Real-time Portfolio Tracking',
    description: 'Monitor your DeFi positions across multiple protocols with live price updates and performance analytics.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'DEX Aggregation',
    description: 'Get the best swap rates by comparing prices across all major decentralized exchanges.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Security First',
    description: 'Non-custodial design means your funds never leave your wallet. Trade with confidence.',
  },
  {
    icon: SparklesIcon,
    title: 'AI-Powered Insights',
    description: 'Get intelligent portfolio recommendations and market insights powered by advanced AI.',
  },
];

const stats = [
  { label: 'Total Volume', value: '$2.4B+' },
  { label: 'Active Users', value: '150K+' },
  { label: 'Protocols Integrated', value: '50+' },
  { label: 'Uptime', value: '99.9%' },
];

// =============================================================================
// HERO COMPONENT
// =============================================================================

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-purple-50 to-pink-50 dark:from-dark-950 dark:via-purple-950 dark:to-pink-950"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-brand-400/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        {/* Main Hero Content */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="gradient-text">DeFi Portfolio</span>
              <br />
              <span className="text-gray-900 dark:text-gray-100">
                Made Simple
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Track, trade, and optimize your DeFi investments with our 
            ultra-modern platform. Get real-time analytics, AI insights, 
            and seamless trading across all major protocols.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  onClick={openConnectModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
                >
                  <span>Connect Wallet</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              )}
            </ConnectButton.Custom>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <PlayIcon className="w-5 h-5" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card-hover text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-20"
        >
          <div className="glass dark:glass-dark rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Ready to optimize your DeFi journey?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join thousands of traders who trust our platform for their DeFi operations.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  onClick={openConnectModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  Get Started Now
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// =============================================================================
// FLOATING ACTION BUTTON (Mobile)
// =============================================================================

export function FloatingConnectButton() {
  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <motion.button
            onClick={openConnectModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 1 
            }}
            className="w-14 h-14 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full shadow-lg shadow-brand-500/25 flex items-center justify-center text-white"
          >
            <CurrencyDollarIcon className="w-6 h-6" />
          </motion.button>
        )}
      </ConnectButton.Custom>
    </div>
  );
}

// =============================================================================
// SOCIAL PROOF SECTION
// =============================================================================

export function SocialProof() {
  const logos = [
    { name: 'Uniswap', src: '/images/dex/uniswap.svg' },
    { name: 'Aave', src: '/images/protocols/aave.svg' },
    { name: 'Compound', src: '/images/protocols/compound.svg' },
    { name: 'Curve', src: '/images/dex/curve.svg' },
    { name: 'SushiSwap', src: '/images/dex/sushiswap.svg' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="py-12 border-t border-gray-200 dark:border-dark-700"
    >
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Integrated with leading DeFi protocols
        </p>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
        {logos.map((logo, index) => (
          <motion.div
            key={logo.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
            className="filter grayscale hover:grayscale-0 transition-all duration-300"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="h-8 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}