import { describe, it, expect } from 'vitest';
import { zecToZatoshis, zatoshisToZec, formatZecDisplay } from '../src/zcash/units';
import { calculateZip317Fee, getClaimFeeZat } from '../src/zcash/fee';
import { validateZcashAddress } from '../src/zcash/address';
import { buildZip321Uri, parseZip321Uri } from '../src/zcash/zip321';

describe('Zcash Units & Conversions (PRD §13.1)', () => {
  it('converts ZEC string to zatoshis correctly', () => {
    expect(zecToZatoshis('1')).toBe(100_000_000);
    expect(zecToZatoshis('0.05')).toBe(5_000_000);
    expect(zecToZatoshis('0.0001')).toBe(10_000);
    expect(zecToZatoshis('0')).toBe(0);
  });

  it('converts zatoshis to ZEC string without trailing zeros', () => {
    expect(zatoshisToZec(100_000_000)).toBe('1');
    expect(zatoshisToZec(5_000_000)).toBe('0.05');
    expect(zatoshisToZec(10_000)).toBe('0.0001');
  });

  it('formats display amounts gracefully', () => {
    expect(formatZecDisplay('0.05')).toBe('0.05');
    expect(formatZecDisplay('1234.5678')).toBe('1,234.5678');
  });
});

describe('ZIP 317 Conventional Fee (PRD §13.1 & Appendix C)', () => {
  it('calculates the standard shielded transfer fee as 10,000 zatoshis (0.0001 ZEC)', () => {
    expect(calculateZip317Fee(2)).toBe(10_000);
    expect(getClaimFeeZat()).toBe(10_000);
  });
});

describe('Address Validation & Shielded Enforcement (PRD §5.1 F8, §8.3 E5–E7)', () => {
  it('accepts mainnet Unified Addresses (u1...)', () => {
    const validUa = 'u1' + 'a'.repeat(60);
    const res = validateZcashAddress(validUa);
    expect(res.isValid).toBe(true);
    expect(res.type).toBe('unified');
    expect(res.isShielded).toBe(true);
  });

  it('accepts mainnet Sapling shielded addresses (zs1...)', () => {
    const validSapling = 'zs1' + 'a'.repeat(75);
    const res = validateZcashAddress(validSapling);
    expect(res.isValid).toBe(true);
    expect(res.type).toBe('sapling');
    expect(res.isShielded).toBe(true);
  });

  it('blocks transparent addresses (t1... and t3...) with clear privacy explanation', () => {
    const transparentP2pkh = 't1' + 'a'.repeat(33);
    const res = validateZcashAddress(transparentP2pkh);
    expect(res.isValid).toBe(false);
    expect(res.type).toBe('transparent');
    expect(res.errorMessage).toContain('public address');
  });

  it('flags testnet addresses on mainnet', () => {
    const testnetAddr = 'utest1' + 'a'.repeat(55);
    const res = validateZcashAddress(testnetAddr);
    expect(res.isValid).toBe(false);
    expect(res.type).toBe('testnet');
    expect(res.errorMessage).toContain('test network');
  });
});

describe('ZIP 321 Payment Requests (PRD §13.1)', () => {
  it('builds and parses ZIP 321 URI correctly', () => {
    const uri = buildZip321Uri({
      address: 'u1exampleaddress',
      amountZec: '0.0501',
    });
    expect(uri).toBe('zcash:u1exampleaddress?amount=0.0501');

    const parsed = parseZip321Uri(uri);
    expect(parsed).not.toBeNull();
    expect(parsed?.address).toBe('u1exampleaddress');
    expect(parsed?.amountZec).toBe('0.0501');
  });
});
