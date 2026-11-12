import { describe, it, expect } from 'vitest';
import { LinkCodec } from '../src/services/LinkCodec';

describe('LinkCodec (PRD §13.2 #2)', () => {
  it('encodes and decodes fragment without passcode correctly', () => {
    const secretHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const birthdayHeight = 2600000;
    const isPasscodeProtected = false;
    const encryptedMessageB64 = 'dGVzdC1tZXNzYWdl';

    const fragment = LinkCodec.encodeFragment({
      secretHex,
      birthdayHeight,
      isPasscodeProtected,
      encryptedMessageB64,
    });

    expect(fragment).toBe(`1.${secretHex}.${birthdayHeight}.0.${encryptedMessageB64}`);

    const decoded = LinkCodec.decodeFragment(fragment);
    expect(decoded.version).toBe(1);
    expect(decoded.secretHex).toBe(secretHex);
    expect(decoded.birthdayHeight).toBe(birthdayHeight);
    expect(decoded.isPasscodeProtected).toBe(false);
    expect(decoded.encryptedMessageB64).toBe(encryptedMessageB64);
  });

  it('sets flag bit 0 when passcode protected', () => {
    const fragment = LinkCodec.encodeFragment({
      secretHex: 'abcdef1234567890abcdef1234567890',
      birthdayHeight: 2500100,
      isPasscodeProtected: true,
    });

    expect(fragment.includes('.1.')).toBe(true);
    const decoded = LinkCodec.decodeFragment(fragment);
    expect(decoded.isPasscodeProtected).toBe(true);
  });

  it('encodes and decodes fragment with custom amountZat correctly (e.g. 1 ZEC)', () => {
    const secretHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const birthdayHeight = 2600000;
    const isPasscodeProtected = false;
    const amountZat = 100_000_000; // 1 ZEC
    const encryptedMessageB64 = 'c2VjcmV0LW1lc3NhZ2U=';

    const fragment = LinkCodec.encodeFragment({
      secretHex,
      birthdayHeight,
      isPasscodeProtected,
      amountZat,
      encryptedMessageB64,
    });

    expect(fragment).toBe(`1.${secretHex}.${birthdayHeight}.0.${amountZat}.${encryptedMessageB64}`);

    const decoded = LinkCodec.decodeFragment(fragment);
    expect(decoded.version).toBe(1);
    expect(decoded.secretHex).toBe(secretHex);
    expect(decoded.birthdayHeight).toBe(birthdayHeight);
    expect(decoded.isPasscodeProtected).toBe(false);
    expect(decoded.amountZat).toBe(amountZat);
    expect(decoded.encryptedMessageB64).toBe(encryptedMessageB64);
  });

  it('encodes and decodes fragment with amountZat and no message attached', () => {
    const secretHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const birthdayHeight = 2600000;
    const isPasscodeProtected = false;
    const amountZat = 50_000_000; // 0.5 ZEC

    const fragment = LinkCodec.encodeFragment({
      secretHex,
      birthdayHeight,
      isPasscodeProtected,
      amountZat,
    });

    expect(fragment).toBe(`1.${secretHex}.${birthdayHeight}.0.${amountZat}.`);

    const decoded = LinkCodec.decodeFragment(fragment);
    expect(decoded.amountZat).toBe(amountZat);
    expect(decoded.encryptedMessageB64).toBe('');
  });

  it('supports backwards compatibility decoding legacy fragment without amountZat', () => {
    const secretHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const legacyFragment = `1.${secretHex}.2600000.0.bGVnYWN5LW1zZw==`;

    const decoded = LinkCodec.decodeFragment(legacyFragment);
    expect(decoded.secretHex).toBe(secretHex);
    expect(decoded.amountZat).toBeUndefined();
    expect(decoded.encryptedMessageB64).toBe('bGVnYWN5LW1zZw==');
  });

  it('rejects truncated fragments with user-friendly error (PRD §8.3 E10)', () => {
    expect(() => LinkCodec.decodeFragment('#1.bad')).toThrowError(
      'This link looks incomplete. Ask the sender to share it again.'
    );
  });
});

