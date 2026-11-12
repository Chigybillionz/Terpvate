import { describe, it, expect } from 'vitest';
import { CryptoService } from '../src/services/CryptoService';

describe('CryptoService (PRD §13.2 & §14.2)', () => {
  it('generates 32-byte cryptographically random secrets', () => {
    const s1 = CryptoService.generateRandomSecret();
    const s2 = CryptoService.generateRandomSecret();

    expect(s1.length).toBe(32);
    expect(s2.length).toBe(32);
    expect(CryptoService.bytesToHex(s1)).not.toBe(CryptoService.bytesToHex(s2));
  });

  it('encrypts and decrypts private messages with AES-GCM', async () => {
    const secret = CryptoService.generateRandomSecret();
    const message = 'Happy Birthday Emeka! Enjoy your day 🎉';

    const encryptedB64 = await CryptoService.encryptMessage(secret, message);
    expect(encryptedB64).not.toBe(message);

    const decrypted = await CryptoService.decryptMessage(secret, encryptedB64);
    expect(decrypted).toBe(message);
  });

  it('wraps and unwraps secrets with passcodes using PBKDF2 and AES-GCM', async () => {
    const secret = CryptoService.generateRandomSecret();
    const passcode = 'MySecurePasscode123!';

    const wrapped = await CryptoService.wrapSecretWithPasscode(secret, passcode);
    expect(wrapped).toBeDefined();

    const unwrapped = await CryptoService.unwrapSecretWithPasscode(wrapped, passcode);
    expect(CryptoService.bytesToHex(unwrapped)).toBe(CryptoService.bytesToHex(secret));

    // Wrong passcode should fail
    await expect(
      CryptoService.unwrapSecretWithPasscode(wrapped, 'WrongPasscode')
    ).rejects.toThrow();
  });
});
