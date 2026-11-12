import { describe, it, expect, vi } from 'vitest';
import { PriceService } from '../src/services/PriceService';

describe('PriceService (PRD §2 A8, §5.1 F1, §13.4)', () => {
  it('estimates NGN value with rate timestamp based on 1 ZEC = ₦1,782,520', () => {
    const est = PriceService.estimateNgn('0.05');
    expect(est.currency).toBe('NGN');
    expect(parseInt(est.fiatAmount, 10)).toBe(89126); // 0.05 * 1,782,520 = 89,126
    expect(est.displayString).toContain('about ₦89,126');
    expect(est.rateTime).toBeDefined();
  });

  it('estimates USD value when requested', () => {
    const est = PriceService.estimate('0.1', 'USD');
    expect(est.currency).toBe('USD');
    expect(parseFloat(est.fiatAmount)).toBeGreaterThan(0);
    expect(est.displayString).toContain('about $');
  });

  it('handles invalid or zero amounts gracefully without crashing', () => {
    const zeroEst = PriceService.estimateNgn('0');
    expect(zeroEst.fiatAmount).toBe('0');
    expect(zeroEst.displayString).toBe('about ₦0');

    const invalidEst = PriceService.estimateNgn('invalid');
    expect(invalidEst.fiatAmount).toBe('0');
    expect(invalidEst.displayString).toBe('about ₦0');
  });

  it('notifies subscribers when rates refresh', async () => {
    const listener = vi.fn();
    const unsub = PriceService.subscribe(listener);

    // Mock successful fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        zcash: { ngn: 1200000, usd: 800 },
      }),
    }));

    const success = await PriceService.refreshRate();
    expect(success).toBe(true);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        zecNgn: 1200000,
        zecUsd: 800,
      })
    );

    unsub();
    vi.unstubAllGlobals();
  });

  it('falls back safely when live fetch fails or throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));

    const success = await PriceService.refreshRate();
    expect(success).toBe(false);

    const est = PriceService.estimateNgn('1');
    expect(parseFloat(est.fiatAmount)).toBeGreaterThan(0); // Uses cached fallback

    vi.unstubAllGlobals();
  });
});

