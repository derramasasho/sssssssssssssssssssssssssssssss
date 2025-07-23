'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Notification, PriceAlert } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface NotificationState {
  notifications: Notification[];
  priceAlerts: PriceAlert[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationActions {
  // Notification management
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Price alert management
  addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  updatePriceAlert: (alertId: string, updates: Partial<PriceAlert>) => void;
  removePriceAlert: (alertId: string) => void;
  togglePriceAlert: (alertId: string) => void;
  
  // Actions
  checkPriceAlerts: (prices: Record<string, number>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export type NotificationStore = NotificationState & NotificationActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: NotificationState = {
  notifications: [],
  priceAlerts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// =============================================================================
// STORE CREATION
// =============================================================================

const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Notification management
      addNotification: (notificationData) => {
        const notification: Notification = {
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          isRead: false,
          ...notificationData,
        };
        
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      
      markAsRead: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          if (!notification || notification.isRead) return state;
          
          return {
            notifications: state.notifications.map(n =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },
      
      removeNotification: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          const unreadDecrement = notification && !notification.isRead ? 1 : 0;
          
          return {
            notifications: state.notifications.filter(n => n.id !== notificationId),
            unreadCount: Math.max(0, state.unreadCount - unreadDecrement),
          };
        });
      },
      
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      
      // Price alert management
      addPriceAlert: (alertData) => {
        const alert: PriceAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          isActive: true,
          ...alertData,
        };
        
        set((state) => ({
          priceAlerts: [...state.priceAlerts, alert],
        }));
        
        // Add confirmation notification
        get().addNotification({
          userId: alertData.userId,
          type: 'system',
          title: 'Price Alert Created',
          message: `Alert set for ${alertData.token.symbol} at $${alertData.value}`,
          priority: 'low',
        });
      },
      
      updatePriceAlert: (alertId, updates) => {
        set((state) => ({
          priceAlerts: state.priceAlerts.map(alert =>
            alert.id === alertId ? { ...alert, ...updates } : alert
          ),
        }));
      },
      
      removePriceAlert: (alertId) => {
        set((state) => ({
          priceAlerts: state.priceAlerts.filter(alert => alert.id !== alertId),
        }));
      },
      
      togglePriceAlert: (alertId) => {
        set((state) => ({
          priceAlerts: state.priceAlerts.map(alert =>
            alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
          ),
        }));
      },
      
      // Actions
      checkPriceAlerts: (prices) => {
        const state = get();
        const activeAlerts = state.priceAlerts.filter(alert => alert.isActive && !alert.triggeredAt);
        
        activeAlerts.forEach(alert => {
          const currentPrice = prices[alert.tokenId];
          if (!currentPrice) return;
          
          let triggered = false;
          let message = '';
          
          switch (alert.condition) {
            case 'above':
              if (currentPrice >= alert.value) {
                triggered = true;
                message = `${alert.token.symbol} has reached $${currentPrice} (target: $${alert.value})`;
              }
              break;
            case 'below':
              if (currentPrice <= alert.value) {
                triggered = true;
                message = `${alert.token.symbol} has dropped to $${currentPrice} (target: $${alert.value})`;
              }
              break;
            case 'change_percentage':
              // This would require historical data to calculate percentage change
              // For now, we'll skip this implementation
              break;
          }
          
          if (triggered) {
            // Mark alert as triggered
            get().updatePriceAlert(alert.id, { 
              triggeredAt: new Date(),
              isActive: false,
            });
            
            // Send notification
            get().addNotification({
              userId: alert.userId,
              type: 'price_alert',
              title: 'Price Alert Triggered',
              message,
              priority: 'high',
              metadata: {
                alertId: alert.id,
                tokenId: alert.tokenId,
                price: currentPrice,
                targetPrice: alert.value,
              },
            });
          }
        });
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'defi-notifications-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 100), // Keep last 100 notifications
        priceAlerts: state.priceAlerts,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// =============================================================================
// CONTEXT PROVIDER
// =============================================================================

const NotificationContext = createContext<NotificationStore | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  return (
    <NotificationContext.Provider value={useNotificationStore.getState()}>
      {children}
    </NotificationContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useNotifications(): NotificationStore {
  return useNotificationStore();
}

export function useNotificationList() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearNotifications } = useNotifications();
  
  const recentNotifications = React.useMemo(() => 
    notifications.slice(0, 20), [notifications]
  );
  
  const unreadNotifications = React.useMemo(() => 
    notifications.filter(n => !n.isRead), [notifications]
  );
  
  const highPriorityNotifications = React.useMemo(() => 
    notifications.filter(n => n.priority === 'high' && !n.isRead), [notifications]
  );
  
  return {
    notifications: recentNotifications,
    unreadNotifications,
    highPriorityNotifications,
    unreadCount,
    hasUnread: unreadCount > 0,
    hasHighPriority: highPriorityNotifications.length > 0,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  };
}

export function usePriceAlerts() {
  const { 
    priceAlerts, 
    addPriceAlert, 
    updatePriceAlert, 
    removePriceAlert, 
    togglePriceAlert,
    checkPriceAlerts 
  } = useNotifications();
  
  const activeAlerts = React.useMemo(() => 
    priceAlerts.filter(alert => alert.isActive), [priceAlerts]
  );
  
  const triggeredAlerts = React.useMemo(() => 
    priceAlerts.filter(alert => alert.triggeredAt), [priceAlerts]
  );
  
  return {
    alerts: priceAlerts,
    activeAlerts,
    triggeredAlerts,
    addAlert: addPriceAlert,
    updateAlert: updatePriceAlert,
    removeAlert: removePriceAlert,
    toggleAlert: togglePriceAlert,
    checkAlerts: checkPriceAlerts,
    hasActiveAlerts: activeAlerts.length > 0,
    activeAlertsCount: activeAlerts.length,
  };
}

// =============================================================================
// NOTIFICATION UTILITIES
// =============================================================================

export function useNotificationUtils() {
  const { addNotification } = useNotifications();
  
  const notifyTradeSubmitted = React.useCallback((txHash: string, fromToken: string, toToken: string) => {
    addNotification({
      userId: 'current_user', // This would come from auth
      type: 'trade_update',
      title: 'Trade Submitted',
      message: `Swapping ${fromToken} for ${toToken}`,
      priority: 'medium',
      metadata: { txHash, fromToken, toToken },
    });
  }, [addNotification]);
  
  const notifyTradeConfirmed = React.useCallback((txHash: string, fromToken: string, toToken: string) => {
    addNotification({
      userId: 'current_user',
      type: 'trade_update',
      title: 'Trade Confirmed',
      message: `Successfully swapped ${fromToken} for ${toToken}`,
      priority: 'medium',
      metadata: { txHash, fromToken, toToken },
    });
  }, [addNotification]);
  
  const notifyTradeFailed = React.useCallback((txHash: string, reason: string) => {
    addNotification({
      userId: 'current_user',
      type: 'trade_update',
      title: 'Trade Failed',
      message: reason || 'Transaction failed',
      priority: 'high',
      metadata: { txHash, reason },
    });
  }, [addNotification]);
  
  const notifyPortfolioUpdate = React.useCallback((change: number, changePercentage: number) => {
    const isPositive = change > 0;
    addNotification({
      userId: 'current_user',
      type: 'portfolio_change',
      title: 'Portfolio Update',
      message: `Portfolio ${isPositive ? 'gained' : 'lost'} $${Math.abs(change).toFixed(2)} (${Math.abs(changePercentage).toFixed(2)}%)`,
      priority: 'low',
      metadata: { change, changePercentage },
    });
  }, [addNotification]);
  
  return {
    notifyTradeSubmitted,
    notifyTradeConfirmed,
    notifyTradeFailed,
    notifyPortfolioUpdate,
  };
}

// =============================================================================
// NOTIFICATION FORMATTING
// =============================================================================

export function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'price_alert':
      return '🚨';
    case 'trade_update':
      return '🔄';
    case 'portfolio_change':
      return '📊';
    case 'system':
      return 'ℹ️';
    default:
      return '📱';
  }
}

export function getNotificationColor(priority: Notification['priority']): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 dark:text-red-400';
    case 'medium':
      return 'text-orange-600 dark:text-orange-400';
    case 'low':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}