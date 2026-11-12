/**
 * Cryptographic Primitives & Key Management using WebCrypto
 * PRD §13.2, §14.2
 */

export class CryptoService {
  /**
   * Generates a 32-byte cryptographically secure random secret
   */
  static generateRandomSecret(): Uint8Array {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  /**
   * Derives an AES-GCM key from a 32-byte secret using HKDF
   */
  private static async deriveAesKey(secret: Uint8Array, info: string): Promise<CryptoKey> {
    const masterKey = await crypto.subtle.importKey(
      'raw',
      secret as unknown as BufferSource,
      { name: 'HKDF' },
      false,
      ['deriveKey']
    );

    const encoder = new TextEncoder();
    return crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(16), // Fixed domain salt
        info: encoder.encode(info),
      },
      masterKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts a plaintext message with AES-GCM (returns iv + ciphertext in base64url)
   */
  static async encryptMessage(secret: Uint8Array, message: string): Promise<string> {
    if (!message) return '';
    const key = await this.deriveAesKey(secret, 'tip-msg-encryption-v1');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(message);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return this.toBase64Url(combined);
  }

  /**
   * Decrypts an AES-GCM encrypted message from base64url
   */
  static async decryptMessage(secret: Uint8Array, payloadB64Url: string): Promise<string> {
    if (!payloadB64Url) return '';
    const combined = this.fromBase64Url(payloadB64Url);
    if (combined.length < 13) throw new Error('Invalid ciphertext payload');

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const key = await this.deriveAesKey(secret, 'tip-msg-encryption-v1');

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext as unknown as BufferSource
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Derives a key wrapping key from a user passcode using PBKDF2 (100,000 iterations)
   */
  static async wrapSecretWithPasscode(secret: Uint8Array, passcode: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passcode),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100_000,
        hash: 'SHA-256',
      },
      passKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      secret as unknown as BufferSource
    );

    // Payload: [16 bytes salt][12 bytes iv][wrapped bytes]
    const combined = new Uint8Array(salt.length + iv.length + wrapped.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(wrapped), salt.length + iv.length);

    return this.toBase64Url(combined);
  }

  /**
   * Unwraps a secret wrapped with a passcode
   */
  static async unwrapSecretWithPasscode(wrappedB64Url: string, passcode: string): Promise<Uint8Array> {
    const combined = this.fromBase64Url(wrappedB64Url);
    if (combined.length < 28) throw new Error('Invalid wrapped secret data');

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const passKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passcode),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100_000,
        hash: 'SHA-256',
      },
      passKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      ciphertext as unknown as BufferSource
    );

    return new Uint8Array(decrypted);
  }

  private static toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private static fromBase64Url(str: string): Uint8Array {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
