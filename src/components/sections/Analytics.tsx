'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3Icon, TrendingUpIcon, PieChartIcon } from 'lucide-react';

export default function Analytics(): JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3Icon className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
          </div>
          <p className="text-muted-foreground">
            Detailed performance analytics coming soon.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUpIcon className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Market Trends</h3>
          </div>
          <p className="text-muted-foreground">
            Market trend analysis coming soon.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <PieChartIcon className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Asset Allocation</h3>
          </div>
          <p className="text-muted-foreground">
            Asset allocation insights coming soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
}