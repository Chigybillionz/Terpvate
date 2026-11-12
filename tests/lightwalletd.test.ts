import { describe, it, expect } from 'vitest';
import { LightwalletdService } from '../src/services/LightwalletdService';

describe('LightwalletdService (PRD §13.4 & §13.7)', () => {
  it('provides verified default high-availability endpoints', () => {
    const endpoints = LightwalletdService.getEndpoints();
    expect(endpoints.length).toBeGreaterThanOrEqual(3);
    expect(endpoints.some((ep) => ep.id === 'zec-rocks')).toBe(true);
    expect(endpoints.some((ep) => ep.network === 'mainnet')).toBe(true);
    expect(endpoints.some((ep) => ep.network === 'testnet')).toBe(true);
  });

  it('allows active endpoint switching', () => {
    LightwalletdService.setActiveEndpoint('ecc-testnet');
    expect(LightwalletdService.getActiveEndpoint().id).toBe('ecc-testnet');
    expect(LightwalletdService.getActiveEndpoint().network).toBe('testnet');

    // Switch back to primary mainnet
    LightwalletdService.setActiveEndpoint('zec-rocks');
    expect(LightwalletdService.getActiveEndpoint().id).toBe('zec-rocks');
  });

  it('safely handles offline / fallback address activity queries', async () => {
    const activity = await LightwalletdService.checkAddressActivity(
      'u1testaddress',
      2600000,
      100_010_000
    );

    expect(activity).toBeDefined();
    expect(activity.receivedZat).toBe(0);
    expect(activity.isConfirmed).toBe(false);
  });

  it('broadcasts transactions with valid response structure', async () => {
    const res = await LightwalletdService.broadcastTransaction('04000080...');
    expect(res.success).toBe(true);
    expect(res.txid).toBeDefined();
  });
});
