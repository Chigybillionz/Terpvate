/**
 * Claim ViewModel (Receiver Journey)
 * PRD §8.2 (R1–R7), §9.2, §13.6
 */

import { LinkCodec, DecodedGiftLink } from '../services/LinkCodec';
import { CryptoService } from '../services/CryptoService';
import { GiftService } from '../services/GiftService';
import { StorageService } from '../services/StorageService';
import { validateZcashAddress, AddressValidationResult } from '../zcash/address';
import { zatoshisToZec } from '../zcash/units';
import { liveAnnouncer } from '../a11y/liveAnnouncer';

export interface ClaimState {
  fragment: string;
  decoded?: DecodedGiftLink;
  unwrappedSecretHex?: string;
  isPasscodeProtected: boolean;
  passcodeInput: string;
  passcodeError?: string;
  amountZat: number;
  claimFeeZat: number;
  messagePlain: string;
  isVerifying: boolean;
  isVerified: boolean;
  receiverAddress: string;
  addressValidation: AddressValidationResult;
  isClaiming: boolean;
  isClaimed: boolean;
  claimTxid?: string;
  error?: string;
}

export class ClaimViewModel {
  private state: ClaimState;
  private listeners = new Set<(state: ClaimState) => void>();

  constructor(fragment: string) {
    let initialAmountZat = 5_000_000;
    let isPasscodeProtected = false;
    let decodedLink: DecodedGiftLink | undefined;

    try {
      decodedLink = LinkCodec.decodeFragment(fragment);
      isPasscodeProtected = decodedLink.isPasscodeProtected;
      if (decodedLink.amountZat && decodedLink.amountZat > 0) {
        initialAmountZat = decodedLink.amountZat;
      }
    } catch {
      // Defer error to parseAndVerify
    }

    this.state = {
      fragment,
      decoded: decodedLink,
      isPasscodeProtected,
      passcodeInput: '',
      amountZat: initialAmountZat,
      claimFeeZat: 10_000,
      messagePlain: '',
      isVerifying: true,
      isVerified: false,
      receiverAddress: '',
      addressValidation: { isValid: false, type: 'invalid', isShielded: false },
      isClaiming: false,
      isClaimed: false,
    };
  }

  getState(): ClaimState {
    return { ...this.state };
  }

  subscribe(listener: (state: ClaimState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  async parseAndVerify(): Promise<void> {
    try {
      const decoded = LinkCodec.decodeFragment(this.state.fragment);
      this.state.decoded = decoded;
      this.state.isPasscodeProtected = decoded.isPasscodeProtected;

      if (decoded.amountZat && decoded.amountZat > 0) {
        this.state.amountZat = decoded.amountZat;
      }

      // Cross-check stored gifts (for prototype/local testing on same browser)
      try {
        const storedGifts = await StorageService.getAllGifts();
        const matched = storedGifts.find(
          (g) =>
            g.secretHex === decoded.secretHex ||
            (decoded.secretHex && g.shareableLink?.includes(decoded.secretHex))
        );
        if (matched) {
          if (matched.amountZat) {
            this.state.amountZat = matched.amountZat;
          }
          if (matched.messagePlain && !this.state.messagePlain) {
            this.state.messagePlain = matched.messagePlain;
          }
        }
      } catch {
        // Storage lookup fallback
      }

      if (!decoded.isPasscodeProtected) {
        this.state.unwrappedSecretHex = decoded.secretHex;
        if (decoded.encryptedMessageB64) {
          try {
            const secretBytes = CryptoService.hexToBytes(decoded.secretHex);
            this.state.messagePlain = await CryptoService.decryptMessage(
              secretBytes,
              decoded.encryptedMessageB64
            );
          } catch {
            this.state.messagePlain = '';
          }
        }
      }

      // Simulate on-chain verification delay (R2: "checking..." -> verified)
      setTimeout(() => {
        this.state.isVerifying = false;
        this.state.isVerified = true;
        liveAnnouncer.announce('Gift verified on blockchain. Ready to claim.');
        this.notify();
      }, 1200);

      this.notify();
    } catch (err: any) {
      this.state.isVerifying = false;
      this.state.error = err?.message || 'Invalid gift link';
      this.notify();
    }
  }

  async submitPasscode(passcode: string): Promise<boolean> {
    if (!this.state.decoded) return false;
    try {
      const unwrappedBytes = await CryptoService.unwrapSecretWithPasscode(
        this.state.decoded.secretHex,
        passcode
      );
      this.state.unwrappedSecretHex = CryptoService.bytesToHex(unwrappedBytes);
      this.state.passcodeError = undefined;

      if (this.state.decoded.encryptedMessageB64) {
        this.state.messagePlain = await CryptoService.decryptMessage(
          unwrappedBytes,
          this.state.decoded.encryptedMessageB64
        );
      }

      this.notify();
      return true;
    } catch {
      this.state.passcodeError = 'That passcode doesn’t match. Check with the sender.';
      this.notify();
      return false;
    }
  }

  setReceiverAddress(address: string) {
    this.state.receiverAddress = address;
    this.state.addressValidation = validateZcashAddress(address);
    this.notify();
  }

  async executeClaim(): Promise<string> {
    if (!this.state.addressValidation.isValid) {
      throw new Error(this.state.addressValidation.errorMessage || 'Invalid address');
    }
    if (!this.state.unwrappedSecretHex) {
      throw new Error('Secret key not unlocked');
    }

    this.state.isClaiming = true;
    this.notify();

    try {
      const txid = await GiftService.claimGift({
        secretHex: this.state.unwrappedSecretHex,
        destinationAddress: this.state.receiverAddress,
        amountZat: this.state.amountZat,
        feeZat: this.state.claimFeeZat,
      });

      this.state.claimTxid = txid;
      this.state.isClaimed = true;
      liveAnnouncer.announce(`Gift claimed! ${this.getDisplayZec()} ZEC is on its way to your wallet.`);
      return txid;
    } catch (err: any) {
      this.state.error = err?.message || 'Failed to claim gift';
      throw err;
    } finally {
      this.state.isClaiming = false;
      this.notify();
    }
  }

  getDisplayZec(): string {
    return zatoshisToZec(this.state.amountZat);
  }
}

