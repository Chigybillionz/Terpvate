/**
 * Claim ViewModel (Receiver Journey)
 * PRD §8.2 (R1–R7), §9.2, §13.6
 */

import { LinkCodec, DecodedGiftLink } from '../services/LinkCodec';
import { CryptoService } from '../services/CryptoService';
import { GiftService } from '../services/GiftService';
import { LightwalletdService } from '../services/LightwalletdService';
import { workerBridge } from '../worker/workerBridge';
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
  verificationError?: string;
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

      let derivedAddress = '';
      let derivedViewingKey = '';

      if (!decoded.isPasscodeProtected) {
        this.state.unwrappedSecretHex = decoded.secretHex;
        const derived = await workerBridge.deriveAddress(decoded.secretHex);
        derivedAddress = derived.address;
        derivedViewingKey = derived.viewingKey;

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

      // Live on-chain note verification (PRD §8.2 R2, §13.2 #4)
      const noteResult = await LightwalletdService.verifyNoteCommitments({
        viewingKey: derivedViewingKey || `uview1${decoded.secretHex.slice(0, 40)}`,
        address: derivedAddress || `u1${decoded.secretHex.slice(0, 30)}terpvate${decoded.secretHex.slice(30, 56)}`,
        birthdayHeight: decoded.birthdayHeight,
        expectedAmountZat: decoded.amountZat,
        secretHex: decoded.secretHex,
      });

      this.state.isVerifying = false;
      if (noteResult.isVerified) {
        this.state.isVerified = true;
        this.state.amountZat = noteResult.amountZat;
        this.state.verificationError = undefined;
        liveAnnouncer.announce(`Gift verified on blockchain for ${this.getDisplayZec()} ZEC. Ready to claim.`);
      } else {
        this.state.isVerified = false;
        this.state.verificationError = noteResult.error || 'This gift could not be verified on the Zcash blockchain.';
        liveAnnouncer.announce(this.state.verificationError);
      }

      this.notify();
    } catch (err: any) {
      this.state.isVerifying = false;
      this.state.isVerified = false;
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

      const derived = await workerBridge.deriveAddress(this.state.unwrappedSecretHex);

      if (this.state.decoded.encryptedMessageB64) {
        this.state.messagePlain = await CryptoService.decryptMessage(
          unwrappedBytes,
          this.state.decoded.encryptedMessageB64
        );
      }

      // Re-verify note commitments with unlocked secret
      const noteResult = await LightwalletdService.verifyNoteCommitments({
        viewingKey: derived.viewingKey,
        address: derived.address,
        birthdayHeight: this.state.decoded.birthdayHeight,
        expectedAmountZat: this.state.amountZat,
        secretHex: this.state.unwrappedSecretHex,
      });

      if (noteResult.isVerified) {
        this.state.isVerified = true;
        this.state.amountZat = noteResult.amountZat;
        this.state.verificationError = undefined;
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
    const trimmed = address.trim();
    this.state.receiverAddress = trimmed;

    // Detect network or use active endpoint
    const activeNetwork = LightwalletdService.getActiveEndpoint().network;
    const isTestnetAddr = trimmed.startsWith('utest1') || trimmed.startsWith('ztestsapling1');
    const network = isTestnetAddr || activeNetwork === 'testnet' ? 'testnet' : 'mainnet';

    this.state.addressValidation = validateZcashAddress(trimmed, network);
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

