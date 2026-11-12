/**
 * Tip Gift Link Codec
 * PRD §13.2 (Core Protocol Design)
 *
 * Link format:
 *   https://tip.app/g#1.<secret>.<birthday>.<flags>.<encrypted-message>
 *
 * Rules:
 *   - The URL fragment (#...) is NEVER transmitted to any web server.
 *   - flags bit 0 (1): passcode protected.
 */

export interface DecodedGiftLink {
  version: number;
  secretHex: string;
  birthdayHeight: number;
  isPasscodeProtected: boolean;
  encryptedMessageB64: string;
}

export class LinkCodec {
  static readonly VERSION = 1;

  /**
   * Encodes gift parameters into a fragment string:
   * "1.<secret>.<birthday>.<flags>.<encrypted-message>"
   */
  static encodeFragment(params: {
    secretHex: string;
    birthdayHeight: number;
    isPasscodeProtected: boolean;
    encryptedMessageB64?: string;
  }): string {
    const flags = params.isPasscodeProtected ? 1 : 0;
    const msg = params.encryptedMessageB64 || '';
    return `${this.VERSION}.${params.secretHex}.${params.birthdayHeight}.${flags}.${msg}`;
  }

  /**
   * Generates a full shareable link using window.location.origin
   */
  static buildFullLink(params: {
    secretHex: string;
    birthdayHeight: number;
    isPasscodeProtected: boolean;
    encryptedMessageB64?: string;
    origin?: string;
  }): string {
    const baseOrigin = params.origin || (typeof window !== 'undefined' ? window.location.origin : 'https://tip.app');
    const fragment = this.encodeFragment(params);
    return `${baseOrigin}/g#${fragment}`;
  }

  /**
   * Decodes and validates a URL fragment string
   * Throws friendly errors if format is corrupt or truncated (PRD §8.3 E10)
   */
  static decodeFragment(fragmentStr: string): DecodedGiftLink {
    const clean = fragmentStr.startsWith('#') ? fragmentStr.slice(1) : fragmentStr;
    const parts = clean.split('.');

    if (parts.length < 4) {
      throw new Error('This link looks incomplete. Ask the sender to share it again.');
    }

    const version = parseInt(parts[0], 10);
    if (isNaN(version) || version !== this.VERSION) {
      throw new Error('Unsupported gift link version. Please ensure you are using the latest version of Tip.');
    }

    const secretHex = parts[1];
    if (!secretHex || secretHex.length < 16) {
      throw new Error('This link looks incomplete. Ask the sender to share it again.');
    }

    const birthdayHeight = parseInt(parts[2], 10);
    if (isNaN(birthdayHeight) || birthdayHeight < 0) {
      throw new Error('This link contains an invalid block reference.');
    }

    const flags = parseInt(parts[3], 10);
    const isPasscodeProtected = (flags & 1) === 1;
    const encryptedMessageB64 = parts.slice(4).join('.'); // In case message contains dots

    return {
      version,
      secretHex,
      birthdayHeight,
      isPasscodeProtected,
      encryptedMessageB64,
    };
  }
}

