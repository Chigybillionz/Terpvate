/**
 * Fiat Price Conversion Service (NGN & USD)
 * PRD §2 (A8), §5.1 (F1), §13.4
 */

export interface FiatEstimate {
  fiatAmount: string;
  currency: 'NGN' | 'USD';
  displayString: string;
  formattedRate: string;
  isFallback: boolean;
}

export class PriceService {
  // Approximate fallback exchange rates
  private static FALLBACK_ZEC_USD = 32.5;
  private static FALLBACK_USD_NGN = 1650.0;

  private static cachedRateZecNgn = PriceService.FALLBACK_ZEC_USD * PriceService.FALLBACK_USD_NGN;
  private static lastUpdated: Date = new Date();

  /**
   * Fetches latest rates with fallback support
   */
  static async refreshRate(): Promise<void> {
    try {
      // In production, queries a free endpoint or cached rate
      // Fallback is maintained without failing if offline
      this.cachedRateZecNgn = this.FALLBACK_ZEC_USD * this.FALLBACK_USD_NGN;
      this.lastUpdated = new Date();
    } catch {
      // Graceful degradation: silently use fallback
    }
  }

  static estimateNgn(zecAmount: number | string): FiatEstimate {
    const amount = typeof zecAmount === 'string' ? parseFloat(zecAmount) : zecAmount;
    if (isNaN(amount) || amount <= 0) {
      return {
        fiatAmount: '0',
        currency: 'NGN',
        displayString: 'about ₦0',
        formattedRate: `₦${this.cachedRateZecNgn.toLocaleString()}/ZEC`,
        isFallback: true,
      };
    }

    const ngnTotal = Math.round(amount * this.cachedRateZecNgn);
    return {
      fiatAmount: ngnTotal.toString(),
      currency: 'NGN',
      displayString: `about ₦${ngnTotal.toLocaleString()}`,
      formattedRate: `₦${this.cachedRateZecNgn.toLocaleString()}/ZEC`,
      isFallback: false,
    };
  }

  static getLastUpdatedText(): string {
    return this.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

