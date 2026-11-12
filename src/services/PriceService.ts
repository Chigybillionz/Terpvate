/**
 * Live Fiat Price Conversion Service (NGN & USD)
 * PRD §2 (A8), §5.1 (F1), §13.4, §15, §17.3 #7
 *
 * Rules:
 *  - Graceful degradation: never crash or block UI if offline or API is rate-limited.
 *  - Network timeouts (max 4s) to protect low-end Android / patchy 3G networks.
 *  - In-memory & localStorage caching with 5-minute TTL.
 *  - Rate timestamp display: "about ₦..., rate at HH:MM".
 */

export interface FiatEstimate {
  fiatAmount: string;
  currency: 'NGN' | 'USD';
  displayString: string;
  formattedRate: string;
  rateTime: string;
  isFallback: boolean;
}

export type PriceListener = (rates: { zecNgn: number; zecUsd: number }) => void;

export class PriceService {
  // Safe default fallback rates if network is offline on first load
  private static FALLBACK_ZEC_USD = 45.0;
  private static FALLBACK_ZEC_NGN = 67500.0;

  private static cachedRateZecNgn = PriceService.FALLBACK_ZEC_NGN;
  private static cachedRateZecUsd = PriceService.FALLBACK_ZEC_USD;
  private static lastUpdated: Date = new Date();
  private static isFallback = true;
  private static isRefreshing = false;

  private static listeners = new Set<PriceListener>();

  private static CACHE_KEY = 'terpvate_fiat_rates_v1';
  private static CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  static {
    // Try restoring previously cached rate from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(this.CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.timestamp && Date.now() - parsed.timestamp < this.CACHE_TTL_MS) {
            this.cachedRateZecNgn = parsed.zecNgn || this.cachedRateZecNgn;
            this.cachedRateZecUsd = parsed.zecUsd || this.cachedRateZecUsd;
            this.lastUpdated = new Date(parsed.timestamp);
            this.isFallback = false;
          }
        }
      } catch {
        // Ignore storage access errors
      }
    }
  }

  static subscribe(listener: PriceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notify() {
    this.listeners.forEach((l) =>
      l({ zecNgn: this.cachedRateZecNgn, zecUsd: this.cachedRateZecUsd })
    );
  }

  /**
   * Fetches live rates from public endpoint with timeout and offline fallback
   */
  static async refreshRate(): Promise<boolean> {
    if (this.isRefreshing) return false;
    this.isRefreshing = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second network timeout

      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd,ngn',
        {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data?.zcash?.ngn && data?.zcash?.usd) {
          this.cachedRateZecNgn = Number(data.zcash.ngn);
          this.cachedRateZecUsd = Number(data.zcash.usd);
          this.lastUpdated = new Date();
          this.isFallback = false;

          // Save to persistent storage cache
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              localStorage.setItem(
                this.CACHE_KEY,
                JSON.stringify({
                  zecNgn: this.cachedRateZecNgn,
                  zecUsd: this.cachedRateZecUsd,
                  timestamp: this.lastUpdated.getTime(),
                })
              );
            } catch {}
          }

          this.notify();
          return true;
        }
      }
    } catch (err) {
      // Graceful degradation per PRD §13.4: fall back safely
      console.warn('Live price fetch failed, using cached/fallback rates:', err);
    } finally {
      this.isRefreshing = false;
    }

    return false;
  }

  /**
   * Calculates approximate fiat value in NGN
   */
  static estimateNgn(zecAmount: number | string): FiatEstimate {
    return this.estimate(zecAmount, 'NGN');
  }

  /**
   * General estimate method for NGN or USD
   */
  static estimate(zecAmount: number | string, currency: 'NGN' | 'USD' = 'NGN'): FiatEstimate {
    const amount = typeof zecAmount === 'string' ? parseFloat(zecAmount) : zecAmount;
    const rateTime = this.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isNaN(amount) || amount <= 0) {
      return {
        fiatAmount: '0',
        currency,
        displayString: currency === 'NGN' ? 'about ₦0' : 'about $0.00',
        formattedRate: currency === 'NGN' ? `₦${this.cachedRateZecNgn.toLocaleString()}/ZEC` : `$${this.cachedRateZecUsd.toLocaleString()}/ZEC`,
        rateTime,
        isFallback: this.isFallback,
      };
    }

    if (currency === 'NGN') {
      const ngnTotal = Math.round(amount * this.cachedRateZecNgn);
      return {
        fiatAmount: ngnTotal.toString(),
        currency: 'NGN',
        displayString: `about ₦${ngnTotal.toLocaleString()} · ${rateTime}`,
        formattedRate: `₦${this.cachedRateZecNgn.toLocaleString()}/ZEC`,
        rateTime,
        isFallback: this.isFallback,
      };
    } else {
      const usdTotal = (amount * this.cachedRateZecUsd).toFixed(2);
      return {
        fiatAmount: usdTotal,
        currency: 'USD',
        displayString: `about $${usdTotal} · ${rateTime}`,
        formattedRate: `$${this.cachedRateZecUsd.toFixed(2)}/ZEC`,
        rateTime,
        isFallback: this.isFallback,
      };
    }
  }

  static getRates() {
    return {
      zecNgn: this.cachedRateZecNgn,
      zecUsd: this.cachedRateZecUsd,
      lastUpdated: this.lastUpdated,
      isFallback: this.isFallback,
    };
  }
}
