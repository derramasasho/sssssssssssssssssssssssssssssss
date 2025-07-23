'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { APP_CONFIG } from '@/lib/constants';

// =============================================================================
// TYPES
// =============================================================================

export interface AppSettings {
  // UI Settings
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  compactMode: boolean;
  showBalances: boolean;
  showPnL: boolean;
  animationsEnabled: boolean;
  
  // Trading Settings
  defaultSlippage: number;
  autoSlippage: boolean;
  gasPrice: 'slow' | 'standard' | 'fast' | 'instant';
  expertMode: boolean;
  
  // Privacy Settings
  analytics: boolean;
  crashReporting: boolean;
  
  // Notification Settings
  priceAlerts: boolean;
  tradeNotifications: boolean;
  portfolioUpdates: boolean;
  emailNotifications: boolean;
  
  // AI Settings
  aiAssistant: boolean;
  smartSuggestions: boolean;
  riskWarnings: boolean;
  
  // Advanced Settings
  rpcEndpoint?: string;
  maxGasPrice?: number;
  refreshInterval: number;
}

export interface SettingsActions {
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => void;
}

export type SettingsStore = AppSettings & SettingsActions;

// =============================================================================
// DEFAULT SETTINGS
// =============================================================================

const defaultSettings: AppSettings = {
  // UI Settings
  theme: 'system',
  language: 'en',
  currency: 'USD',
  compactMode: false,
  showBalances: true,
  showPnL: true,
  animationsEnabled: true,
  
  // Trading Settings
  defaultSlippage: APP_CONFIG.TRADING.DEFAULT_SLIPPAGE,
  autoSlippage: true,
  gasPrice: 'standard',
  expertMode: false,
  
  // Privacy Settings
  analytics: true,
  crashReporting: true,
  
  // Notification Settings
  priceAlerts: true,
  tradeNotifications: true,
  portfolioUpdates: true,
  emailNotifications: false,
  
  // AI Settings
  aiAssistant: true,
  smartSuggestions: true,
  riskWarnings: true,
  
  // Advanced Settings
  refreshInterval: APP_CONFIG.UI.POLLING_INTERVAL,
};

// =============================================================================
// STORE CREATION
// =============================================================================

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      updateSettings: (newSettings) => {
        set((state) => ({
          ...state,
          ...newSettings,
        }));
      },
      
      resetSettings: () => {
        set(defaultSettings);
      },
      
      exportSettings: () => {
        const settings = get();
        const { updateSettings, resetSettings, exportSettings, importSettings, ...exportableSettings } = settings;
        return JSON.stringify(exportableSettings, null, 2);
      },
      
      importSettings: (settingsJson) => {
        try {
          const importedSettings = JSON.parse(settingsJson);
          set((state) => ({
            ...state,
            ...importedSettings,
          }));
        } catch (error) {
          console.error('Failed to import settings:', error);
          throw new Error('Invalid settings format');
        }
      },
    }),
    {
      name: 'defi-portfolio-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { updateSettings, resetSettings, exportSettings, importSettings, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);

// =============================================================================
// CONTEXT PROVIDER
// =============================================================================

const SettingsContext = createContext<SettingsStore | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  return (
    <SettingsContext.Provider value={useSettingsStore.getState()}>
      {children}
    </SettingsContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useSettings(): SettingsStore {
  return useSettingsStore();
}

export function useUISettings() {
  const { 
    theme, 
    language, 
    currency, 
    compactMode, 
    showBalances, 
    showPnL, 
    animationsEnabled,
    updateSettings 
  } = useSettings();
  
  return {
    theme,
    language,
    currency,
    compactMode,
    showBalances,
    showPnL,
    animationsEnabled,
    updateUISettings: (settings: Partial<Pick<AppSettings, 'theme' | 'language' | 'currency' | 'compactMode' | 'showBalances' | 'showPnL' | 'animationsEnabled'>>) => {
      updateSettings(settings);
    },
  };
}

export function useTradingSettings() {
  const { 
    defaultSlippage, 
    autoSlippage, 
    gasPrice, 
    expertMode,
    updateSettings 
  } = useSettings();
  
  return {
    defaultSlippage,
    autoSlippage,
    gasPrice,
    expertMode,
    updateTradingSettings: (settings: Partial<Pick<AppSettings, 'defaultSlippage' | 'autoSlippage' | 'gasPrice' | 'expertMode'>>) => {
      updateSettings(settings);
    },
  };
}

export function useNotificationSettings() {
  const { 
    priceAlerts, 
    tradeNotifications, 
    portfolioUpdates, 
    emailNotifications,
    updateSettings 
  } = useSettings();
  
  return {
    priceAlerts,
    tradeNotifications,
    portfolioUpdates,
    emailNotifications,
    updateNotificationSettings: (settings: Partial<Pick<AppSettings, 'priceAlerts' | 'tradeNotifications' | 'portfolioUpdates' | 'emailNotifications'>>) => {
      updateSettings(settings);
    },
  };
}

export function useAISettings() {
  const { 
    aiAssistant, 
    smartSuggestions, 
    riskWarnings,
    updateSettings 
  } = useSettings();
  
  return {
    aiAssistant,
    smartSuggestions,
    riskWarnings,
    updateAISettings: (settings: Partial<Pick<AppSettings, 'aiAssistant' | 'smartSuggestions' | 'riskWarnings'>>) => {
      updateSettings(settings);
    },
  };
}

export function usePrivacySettings() {
  const { 
    analytics, 
    crashReporting,
    updateSettings 
  } = useSettings();
  
  return {
    analytics,
    crashReporting,
    updatePrivacySettings: (settings: Partial<Pick<AppSettings, 'analytics' | 'crashReporting'>>) => {
      updateSettings(settings);
    },
  };
}

// =============================================================================
// SETTINGS VALIDATION
// =============================================================================

export function validateSettings(settings: Partial<AppSettings>): string[] {
  const errors: string[] = [];
  
  if (settings.defaultSlippage !== undefined) {
    if (settings.defaultSlippage < APP_CONFIG.TRADING.MIN_SLIPPAGE || 
        settings.defaultSlippage > APP_CONFIG.TRADING.MAX_SLIPPAGE) {
      errors.push(`Slippage must be between ${APP_CONFIG.TRADING.MIN_SLIPPAGE}% and ${APP_CONFIG.TRADING.MAX_SLIPPAGE}%`);
    }
  }
  
  if (settings.refreshInterval !== undefined) {
    if (settings.refreshInterval < 10000 || settings.refreshInterval > 300000) {
      errors.push('Refresh interval must be between 10 seconds and 5 minutes');
    }
  }
  
  if (settings.maxGasPrice !== undefined) {
    if (settings.maxGasPrice < 1 || settings.maxGasPrice > 1000) {
      errors.push('Max gas price must be between 1 and 1000 Gwei');
    }
  }
  
  return errors;
}

// =============================================================================
// SETTINGS PRESETS
// =============================================================================

export const SETTINGS_PRESETS = {
  CONSERVATIVE: {
    defaultSlippage: 0.1,
    autoSlippage: false,
    gasPrice: 'slow' as const,
    expertMode: false,
    riskWarnings: true,
  },
  BALANCED: {
    defaultSlippage: 0.5,
    autoSlippage: true,
    gasPrice: 'standard' as const,
    expertMode: false,
    riskWarnings: true,
  },
  AGGRESSIVE: {
    defaultSlippage: 1.0,
    autoSlippage: true,
    gasPrice: 'fast' as const,
    expertMode: true,
    riskWarnings: false,
  },
} as const;

export function applySettingsPreset(preset: keyof typeof SETTINGS_PRESETS) {
  const { updateSettings } = useSettingsStore.getState();
  updateSettings(SETTINGS_PRESETS[preset]);
}