/**
 * Zcash Address Validation & Network Classification
 * PRD §5.1 (F8), §8.3 (E5, E6, E7), §13.1
 */

export type AddressType = 'unified' | 'sapling' | 'transparent' | 'testnet' | 'invalid';

export interface AddressValidationResult {
  isValid: boolean;
  type: AddressType;
  errorMessage?: string;
  isShielded: boolean;
}

// Bech32 regex patterns for Zcash address prefixes
const UNIFIED_MAINNET_REGEX = /^u1[ac-hj-np-z02-9]{50,}$/i;
const SAPLING_MAINNET_REGEX = /^zs1[ac-hj-np-z02-9]{75}$/i;
const TRANSPARENT_P2PKH_REGEX = /^t1[a-km-zA-HJ-NP-Z1-9]{33}$/;
const TRANSPARENT_P2SH_REGEX = /^t3[a-km-zA-HJ-NP-Z1-9]{33}$/;

// Testnet patterns
const UNIFIED_TESTNET_REGEX = /^utest1[ac-hj-np-z02-9]{50,}$/i;
const SAPLING_TESTNET_REGEX = /^ztestsapling1[ac-hj-np-z02-9]{75}$/i;
const TRANSPARENT_TESTNET_REGEX = /^tm[a-km-zA-HJ-NP-Z1-9]{33}$/;

export function validateZcashAddress(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): AddressValidationResult {
  const trimmed = address.trim();

  if (!trimmed) {
    return {
      isValid: false,
      type: 'invalid',
      errorMessage: 'Please enter a Zcash address.',
      isShielded: false,
    };
  }

  // Check testnet prefixes if on mainnet (E7)
  if (network === 'mainnet') {
    if (
      UNIFIED_TESTNET_REGEX.test(trimmed) ||
      SAPLING_TESTNET_REGEX.test(trimmed) ||
      TRANSPARENT_TESTNET_REGEX.test(trimmed)
    ) {
      return {
        isValid: false,
        type: 'testnet',
        errorMessage: 'This address is for a test network. Use a normal Zcash address.',
        isShielded: false,
      };
    }
  }

  // Check transparent addresses (E6) - Blocked in MVP
  if (TRANSPARENT_P2PKH_REGEX.test(trimmed) || TRANSPARENT_P2SH_REGEX.test(trimmed)) {
    return {
      isValid: false,
      type: 'transparent',
      errorMessage:
        'This is a public address. Using it would show the amount to everyone. Please use a private (shielded) address.',
      isShielded: false,
    };
  }

  // Check Unified Addresses (ZIP 316)
  if (UNIFIED_MAINNET_REGEX.test(trimmed)) {
    return {
      isValid: true,
      type: 'unified',
      isShielded: true,
    };
  }

  // Check Sapling Shielded Addresses
  if (SAPLING_MAINNET_REGEX.test(trimmed)) {
    return {
      isValid: true,
      type: 'sapling',
      isShielded: true,
    };
  }

  // Invalid address format (E5)
  return {
    isValid: false,
    type: 'invalid',
    errorMessage:
      'That doesn’t look like a Zcash address. Check that it starts with u1 or zs1, or scan the QR code.',
    isShielded: false,
  };
}
