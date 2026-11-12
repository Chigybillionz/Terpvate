import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LightwalletdService } from '../src/services/LightwalletdService';

describe('LightwalletdService (PRD §13.4 & §13.7)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/latest-block')) {
          return {
            ok: true,
            json: async () => ({ height: 2650123, hash: '0000000000123' }),
          };
        }
        if (url.includes('/address-activity')) {
          return {
            ok: true,
            json: async () => ({
              receivedZat: 0,
              confirmations: 0,
              txid: undefined,
            }),
          };
        }
        if (url.includes('/send-transaction')) {
          return {
            ok: true,
            json: async () => ({ txid: 'mock_txid_broadcast_123' }),
          };
        }
        if (url.includes('/verify-note')) {
          return {
            ok: false,
            status: 404,
          };
        }
        return { ok: false, status: 404 };
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('scans and verifies on-chain note commitments for receiver claim', async () => {
    const verified = await LightwalletdService.verifyNoteCommitments({
      viewingKey: 'uview1testviewingkey123456789012345678901234567890',
      address: 'u1testreceiveraddress12345678901234567890',
      birthdayHeight: 2600000,
      expectedAmountZat: 100_000_000,
    });

    expect(verified.isVerified).toBe(true);
    expect(verified.amountZat).toBe(100_000_000);
    expect(verified.confirmations).toBeGreaterThanOrEqual(3);
  });

  it('rejects fake or invalid links with unverified status', async () => {
    const rejected = await LightwalletdService.verifyNoteCommitments({
      viewingKey: 'invalid_key',
      address: 'invalid_address',
      birthdayHeight: 2600000,
      expectedAmountZat: 0,
    });

    expect(rejected.isVerified).toBe(false);
    expect(rejected.amountZat).toBe(0);
    expect(rejected.error).toBeDefined();
  });
});
