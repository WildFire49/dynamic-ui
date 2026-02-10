import { CARD_THEMES } from './constants';

export const formatIndianCurrency = (value) => {
  if (!value) return value;
  if (typeof value === 'string' && (value.includes('₹') || value.includes('L') || value.includes('Cr'))) return value;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return value;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(2)}K`;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const smartFormat = (value) => {
  if (value === null || value === undefined) return value;
  const str = String(value);
  if (str.includes('₹') || str.includes('L') || str.includes('Cr') || str.includes('%')) return str;
  const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return value;
  if (str.includes('M')) return formatIndianCurrency(parseFloat(str.replace('M', '')) * 1000000);
  if (str.includes('K') || num > 1000) return formatIndianCurrency(num);
  return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export const getSemanticColor = (value, title = '', label = '') => {
  const numVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const context = `${title} ${label}`.toLowerCase();
  const isPercentage = /percent|%|otr/i.test(context);
  const isPositiveMetric = /disbursement|disbursed|amount|revenue|collection|perform/i.test(context);

  if (isNaN(numVal) || numVal === null) return null;

  if (isPercentage) {
    if (numVal >= 95) return CARD_THEMES[1]; // emerald
    if (numVal >= 80) return CARD_THEMES[2]; // amber
    return CARD_THEMES[3]; // rose
  }
  if (isPositiveMetric) {
    if (numVal > 0) return CARD_THEMES[1]; // emerald
    return CARD_THEMES[3]; // rose
  }
  return null;
};

export const toNumeric = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const prettifyLabel = (label = '') =>
  label.toString().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const getSafeDisplayValue = (val, formattedVal, unit) => {
  const numericVal = toNumeric(val);
  if (unit === 'count' && numericVal !== null) return numericVal.toLocaleString('en-IN');
  if (unit === 'currency' && numericVal !== null && !formattedVal) return formatIndianCurrency(numericVal);
  if (formattedVal) return formattedVal;
  if (numericVal !== null) return smartFormat(numericVal);
  return smartFormat(val) || val;
};

export const isCardDataEmpty = (card, hasInfoData) => {
  const {
    primary_value, secondary_value, comparison_data, top_entries, bottom_entries,
    card_type, columns, mini_columns, rows, mini_rows,
    current_value, previous_value, sparkline_data, segments, statuses,
    target_value, progress_percent,
  } = card;

  return !(
    primary_value || secondary_value || comparison_data || top_entries || bottom_entries || hasInfoData
    || (card_type === 'progress_tracker' && (primary_value || target_value || progress_percent != null))
    || (card_type === 'trend_sparkline' && (primary_value || sparkline_data?.length > 0))
    || (card_type === 'distribution_donut' && segments?.length > 0)
    || (card_type === 'status_grid' && statuses?.length > 0)
    || (card_type === 'change_indicator' && (current_value || primary_value || comparison_data))
    || (card_type === 'mini_table' && (columns || mini_columns) && (rows?.length > 0 || mini_rows?.length > 0))
  );
};
