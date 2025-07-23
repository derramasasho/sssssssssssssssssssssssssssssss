import numeral from 'numeral';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// =============================================================================
// NUMBER FORMATTING
// =============================================================================

/**
 * Format a number with appropriate precision and suffixes
 */
export function formatNumber(
  value: number,
  options: {
    precision?: number;
    compact?: boolean;
    prefix?: string;
    suffix?: string;
  } = {}
): string {
  const { precision = 2, compact = false, prefix = '', suffix = '' } = options;

  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }

  let formatted: string;

  if (compact) {
    if (Math.abs(value) >= 1e9) {
      formatted = numeral(value).format('0.0a').toUpperCase();
    } else if (Math.abs(value) >= 1e6) {
      formatted = numeral(value).format('0.0a').toUpperCase();
    } else if (Math.abs(value) >= 1e3) {
      formatted = numeral(value).format('0.0a').toUpperCase();
    } else {
      formatted = numeral(value).format(`0.${'0'.repeat(precision)}`);
    }
  } else {
    formatted = numeral(value).format(`0,0.${'0'.repeat(precision)}`);
  }

  return `${prefix}${formatted}${suffix}`;
}

/**
 * Format a currency value with appropriate symbol and precision
 */
export function formatCurrency(
  value: number,
  options: {
    currency?: string;
    precision?: number;
    compact?: boolean;
    symbol?: boolean;
  } = {}
): string {
  const { currency = 'USD', precision = 2, compact = false, symbol = true } = options;

  if (isNaN(value) || value === null || value === undefined) {
    return symbol ? '$0' : '0';
  }

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    ETH: 'Ξ',
    BTC: '₿'
  };

  const currencySymbol = symbol ? (currencySymbols[currency] || '$') : '';

  if (compact) {
    if (Math.abs(value) >= 1e9) {
      return `${currencySymbol}${numeral(value / 1e9).format('0.0')}B`;
    } else if (Math.abs(value) >= 1e6) {
      return `${currencySymbol}${numeral(value / 1e6).format('0.0')}M`;
    } else if (Math.abs(value) >= 1e3) {
      return `${currencySymbol}${numeral(value / 1e3).format('0.0')}K`;
    }
  }

  if (Math.abs(value) < 0.01 && value !== 0) {
    return `${currencySymbol}<0.01`;
  }

  return `${currencySymbol}${numeral(value).format(`0,0.${'0'.repeat(precision)}`)}`;
}

/**
 * Format a percentage value
 */
export function formatPercentage(
  value: number,
  options: {
    precision?: number;
    showSign?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { precision = 2, showSign = true, compact = false } = options;

  if (isNaN(value) || value === null || value === undefined) {
    return '0%';
  }

  const sign = showSign && value > 0 ? '+' : '';
  
  if (compact && Math.abs(value) >= 100) {
    return `${sign}${numeral(value).format('0.0')}%`;
  }

  return `${sign}${numeral(value).format(`0.${'0'.repeat(precision)}`)}%`;
}

/**
 * Format a token amount with appropriate precision
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number = 18,
  options: {
    precision?: number;
    compact?: boolean;
    symbol?: string;
  } = {}
): string {
  const { precision = 4, compact = false, symbol = '' } = options;

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount) || numericAmount === 0) {
    return `0${symbol ? ` ${symbol}` : ''}`;
  }

  // Adjust precision based on amount size
  let adjustedPrecision = precision;
  if (numericAmount < 1) {
    adjustedPrecision = Math.max(precision, 6);
  } else if (numericAmount < 0.001) {
    adjustedPrecision = 8;
  }

  const formatted = formatNumber(numericAmount, { precision: adjustedPrecision, compact });
  return `${formatted}${symbol ? ` ${symbol}` : ''}`;
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

// =============================================================================
// ADDRESS FORMATTING
// =============================================================================

/**
 * Truncate an Ethereum address for display
 */
export function formatAddress(
  address: string,
  options: {
    length?: number;
    separator?: string;
  } = {}
): string {
  const { length = 4, separator = '...' } = options;

  if (!address || address.length < 10) {
    return address;
  }

  return `${address.slice(0, length + 2)}${separator}${address.slice(-length)}`;
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

// =============================================================================
// DATE FORMATTING
// =============================================================================

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

// =============================================================================
// PRICE CHANGE FORMATTING
// =============================================================================

/**
 * Format price change with appropriate color and sign
 */
export function formatPriceChange(
  change: number,
  options: {
    isPercentage?: boolean;
    precision?: number;
  } = {}
): {
  formatted: string;
  isPositive: boolean;
  isNegative: boolean;
  className: string;
} {
  const { isPercentage = false, precision = 2 } = options;

  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  let formatted: string;
  if (isPercentage) {
    formatted = formatPercentage(change, { precision, showSign: true });
  } else {
    formatted = formatCurrency(change, { precision });
    if (change > 0) {
      formatted = `+${formatted}`;
    }
  }

  let className = '';
  if (isPositive) {
    className = 'number-positive';
  } else if (isNegative) {
    className = 'number-negative';
  } else {
    className = 'text-gray-500';
  }

  return {
    formatted,
    isPositive,
    isNegative,
    className
  };
}

// =============================================================================
// SIZE FORMATTING
// =============================================================================

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

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

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

// =============================================================================
// CHART FORMATTING
// =============================================================================

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