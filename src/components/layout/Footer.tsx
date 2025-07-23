'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TwitterIcon,
  GithubIcon,
  MessageSquareIcon,
  ExternalLinkIcon,
  CodeIcon,
  ZapIcon,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

// =============================================================================
// VERSION AND BUILD INFO
// =============================================================================

const VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
const BUILD_HASH = process.env.NEXT_PUBLIC_BUILD_HASH?.slice(0, 7) || 'dev';
const BUILD_TIME =
  process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

// =============================================================================
// FOOTER COMPONENT
// =============================================================================

export default function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Twitter',
      href: '#',
      icon: TwitterIcon,
      color: 'hover:text-blue-400',
    },
    {
      name: 'GitHub',
      href: '#',
      icon: GithubIcon,
      color: 'hover:text-gray-300',
    },
    {
      name: 'Discord',
      href: '#',
      icon: MessageSquareIcon,
      color: 'hover:text-blue-500',
    },
  ];

  const quickLinks = [
    { name: 'Portfolio', href: '/' },
    { name: 'Swap', href: '/#trading' },
    { name: 'Analytics', href: '/#analytics' },
    { name: 'AI Assistant', href: '/ai' },
    { name: 'Status', href: '/status' },
  ];

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <ZapIcon className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-lg font-bold text-transparent">
                DeFi Portfolio
              </span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Ultra-modern multi-chain DeFi portfolio and trading platform.
              Built for the future of decentralized finance.
            </p>

            {/* Version Badge */}
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center rounded-full border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-600/10 px-2.5 py-1 text-xs font-medium"
              >
                <CodeIcon className="mr-1 h-3 w-3 text-blue-500" />v{VERSION}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center rounded-full border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-600/10 px-2.5 py-1 text-xs font-medium"
                title={`Build: ${BUILD_HASH} - ${new Date(BUILD_TIME).toLocaleString()}`}
              >
                {BUILD_HASH}
              </motion.div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Connect</h3>
            <div className="flex space-x-3">
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all duration-200 hover:bg-muted/80',
                      social.color
                    )}
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span>All systems operational</span>
              <Link
                href="/status"
                className="text-blue-500 transition-colors hover:text-blue-400"
              >
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col items-center justify-between space-y-4 border-t border-border pt-6 md:flex-row md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} DeFi Portfolio. Built with 💙 for DeFi traders.
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Powered by</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-orange-500">Jupiter</span>
              <span>•</span>
              <span className="font-medium text-blue-500">1inch</span>
              <span>•</span>
              <span className="font-medium text-green-500">OpenAI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
