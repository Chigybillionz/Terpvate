/**
 * Zcash Unit Conversions (1 ZEC = 100,000,000 Zatoshis)
 * PRD §13.1
 */

export const ZATOSHIS_PER_ZEC = 100_000_000;

export function zecToZatoshis(zecStr: string | number): number {
  const num = typeof zecStr === 'string' ? parseFloat(zecStr) : zecStr;
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * ZATOSHIS_PER_ZEC);
}

export function zatoshisToZec(zatoshis: number): string {
  if (zatoshis <= 0) return '0';
  const zec = zatoshis / ZATOSHIS_PER_ZEC;
  // Format up to 8 decimal places, removing unnecessary trailing zeroes
  return zec.toFixed(8).replace(/\.?0+$/, '');
}

export function formatZecDisplay(zecStr: string | number): string {
  const num = typeof zecStr === 'string' ? parseFloat(zecStr) : zecStr;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}
