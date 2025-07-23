'use client';

import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/sections/Hero';
import { Portfolio } from '@/components/sections/Portfolio';
import { TradingPanel } from '@/components/sections/TradingPanel';
import { Analytics } from '@/components/sections/Analytics';
import { AIAssistant } from '@/components/sections/AIAssistant';
import { useWallet } from '@/hooks/useWallet';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="relative">
        {!isConnected ? (
          // Landing page for non-connected users
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Hero />
          </motion.div>
        ) : (
          // Dashboard for connected users
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8 space-y-8"
          >
            {/* Portfolio Overview */}
            <section>
              <Portfolio />
            </section>

            {/* Trading and Analytics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Trading Panel */}
              <div className="xl:col-span-2">
                <TradingPanel />
              </div>
              
              {/* AI Assistant */}
              <div className="xl:col-span-1">
                <AIAssistant />
              </div>
            </div>

            {/* Analytics Section */}
            <section>
              <Analytics />
            </section>
          </motion.div>
        )}
      </main>
    </div>
  );
}