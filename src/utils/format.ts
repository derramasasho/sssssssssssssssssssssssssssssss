import numeral from 'numeral';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Format a number with specified decimal places and thousands separators
 */
export function formatNumber(
  value: number, 
  decimals: number = 2, 
  locale: string = 'en-US'
): string {
  if (value === 0) return '0';
  if (!value || isNaN(value)) return '0';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  if (!value || isNaN(value)) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercentage(
  value: number, 
  decimals: number = 2, 
  locale: string = 'en-US'
): string {
  if (!value || isNaN(value)) return '0%';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(
  value: number, 
  locale: string = 'en-US'
): string {
  if (!value || isNaN(value)) return '0';
  
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format token amount with appropriate decimal places
 */
export function formatTokenAmount(
  value: number, 
  decimals: number = 6, 
  symbol?: string
): string {
  if (!value || isNaN(value)) return symbol ? `0 ${symbol}` : '0';
  
  const formatted = formatNumber(value, decimals);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Format address for display (truncated)
 */
export function formatAddress(
  address: string, 
  startChars: number = 6, 
  endChars: number = 4
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format time ago (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
}

/**
 * Format price change with appropriate color classes
 */
export function formatPriceChange(
  value: number, 
  type: 'percentage' | 'currency' = 'percentage'
): {
  formatted: string;
  isPositive: boolean;
  isNegative: boolean;
  colorClass: string;
} {
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  const formatted = type === 'percentage' 
    ? formatPercentage(Math.abs(value))
    : formatCurrency(Math.abs(value));
  
  const sign = isPositive ? '+' : isNegative ? '-' : '';
  
  return {
    formatted: `${sign}${formatted}`,
    isPositive,
    isNegative,
    colorClass: isPositive 
      ? 'text-green-600 dark:text-green-400' 
      : isNegative 
        ? 'text-red-600 dark:text-red-400' 
        : 'text-muted-foreground'
  };
}

/**
 * Format gas price in Gwei
 */
export function formatGasPrice(gasPrice: string | number): string {
  const gasPriceNum = typeof gasPrice === 'string' ? parseFloat(gasPrice) : gasPrice;
  const gwei = gasPriceNum / 1e9;
  return `${formatNumber(gwei, { precision: 1 })} Gwei`;
}

/**
 * Format gas limit
 */
export function formatGasLimit(gasLimit: string | number): string {
  const gasLimitNum = typeof gasLimit === 'string' ? parseFloat(gasLimit) : gasLimit;
  return formatNumber(gasLimitNum, { compact: true });
}

/**
 * Format ENS name or address
 */
export function formatIdentity(address: string, ensName?: string): string {
  if (ensName) {
    return ensName.length > 20 ? `${ensName.slice(0, 17)}...` : ensName;
  }
  return formatAddress(address);
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | string | number,
  options: {
    format?: string;
    relative?: boolean;
  } = {}
): string {
  const { format: dateFormat = 'MMM dd, yyyy', relative = false } = options;

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  if (relative) {
    if (isToday(dateObj)) {
      return format(dateObj, 'HH:mm');
    } else if (isYesterday(dateObj)) {
      return 'Yesterday';
    } else {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
  }

  return format(dateObj, dateFormat);
}

/**
 * Format time remaining until a date
 */
export function formatTimeRemaining(date: Date | string | number): string {
  const targetDate = new Date(date);
  const now = new Date();

  if (targetDate <= now) {
    return 'Expired';
  }

  return formatDistanceToNow(targetDate, { addSuffix: false });
}

/**
 * Format duration in seconds to human readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h`;
  } else {
    return `${Math.floor(seconds / 86400)}d`;
  }
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if a value is a valid number
 */
export function isValidNumber(value: string | number): boolean {
  if (typeof value === 'string') {
    return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
  }
  return !isNaN(value) && isFinite(value);
}

/**
 * Parse a formatted number string back to number
 */
export function parseFormattedNumber(value: string): number {
  // Remove common formatting characters
  const cleaned = value.replace(/[,$%\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format tick values for charts
 */
export function formatChartTick(value: number, type: 'currency' | 'percentage' | 'number' = 'number'): string {
  switch (type) {
    case 'currency':
      return formatCurrency(value, { compact: true, precision: 1 });
    case 'percentage':
      return formatPercentage(value, { precision: 1 });
    default:
      return formatNumber(value, { compact: true, precision: 1 });
  }
}

/**
 * Format tooltip values for charts
 */
export function formatChartTooltip(
  value: number,
  type: 'currency' | 'percentage' | 'number' = 'number',
  label?: string
): string {
  let formatted: string;
  
  switch (type) {
    case 'currency':
      formatted = formatCurrency(value);
      break;
    case 'percentage':
      formatted = formatPercentage(value);
      break;
    default:
      formatted = formatNumber(value);
  }

  return label ? `${label}: ${formatted}` : formatted;
}