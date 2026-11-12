/**
 * Pay ViewModel (MVVM)
 * PRD §13.6, §8.1 (S6 & S7)
 */

import { GiftRecord, StorageService } from '../services/StorageService';
import { GiftService } from '../services/GiftService';
import { buildZip321Uri } from '../zcash/zip321';
import { zatoshisToZec } from '../zcash/units';
import { liveAnnouncer } from '../a11y/liveAnnouncer';

export interface PayState {
  gift: GiftRecord;
  fundingUri: string;
  confirmations: number;
  requiredConfirmations: number;
  isConfirmed: boolean;
  isWatching: boolean;
  timeRemainingSeconds: number;
  isUnderfunded: boolean;
  receivedZat: number;
  remainingZat: number;
  error?: string;
}

export class PayViewModel {
  private state: PayState;
  private listeners = new Set<(state: PayState) => void>();

  constructor(gift: GiftRecord) {
    const requiredZat = gift.amountZat + gift.claimFeeZat;
    const receivedZat = gift.receivedZat || 0;
    const isUnderfunded = gift.state === 'UNDERFUNDED';
    const remainingZat = Math.max(0, requiredZat - receivedZat);

    let fundingUri = GiftService.getFundingUri(gift);
    if (isUnderfunded && remainingZat > 0) {
      fundingUri = buildZip321Uri({
        address: gift.depositAddress,
        amountZec: zatoshisToZec(remainingZat),
      });
    }

    this.state = {
      gift,
      fundingUri,
      confirmations: gift.confirmations || 0,
      requiredConfirmations: 3,
      isConfirmed: gift.state === 'READY',
      isWatching: false,
      timeRemainingSeconds: 240, // ~4 minutes estimate
      isUnderfunded,
      receivedZat,
      remainingZat,
    };
  }

  subscribe(listener: (state: PayState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  startWatching(onReady: () => void) {
    if (this.state.isWatching || this.state.isConfirmed) return;
    this.state.isWatching = true;
    this.notify();

    const requiredZat = this.state.gift.amountZat + this.state.gift.claimFeeZat;

    GiftService.startFundingWatcher(this.state.gift, (progress) => {
      this.state.confirmations = progress.confirmations;
      this.state.isConfirmed = progress.isReady;
      this.state.isUnderfunded = progress.isUnderfunded;
      this.state.receivedZat = progress.receivedZat;
      this.state.remainingZat = progress.remainingZat;

      if (progress.isUnderfunded && progress.remainingZat > 0) {
        this.state.fundingUri = buildZip321Uri({
          address: this.state.gift.depositAddress,
          amountZec: zatoshisToZec(progress.remainingZat),
        });
        liveAnnouncer.announce(
          `Additional payment needed. We received ${zatoshisToZec(progress.receivedZat)} ZEC but needed ${zatoshisToZec(requiredZat)} ZEC. Send remaining ${zatoshisToZec(progress.remainingZat)} ZEC.`
        );
      } else if (progress.isReady) {
        liveAnnouncer.announce('Payment confirmed. Your gift is ready to share.');
      } else {
        liveAnnouncer.announce(`Payment seen. ${progress.confirmations} of 3 confirmations.`);
      }

      this.notify();

      if (progress.isReady) {
        this.state.isWatching = false;
        // Update local record
        StorageService.getGift(this.state.gift.id).then((updated) => {
          if (updated) this.state.gift = updated;
          onReady();
        });
      }
    });
  }

  /**
   * Simulates partial payment to test the underfunded handling and UI
   */
  async simulateUnderpayment(customReceivedZat?: number): Promise<void> {
    const requiredZat = this.state.gift.amountZat + this.state.gift.claimFeeZat;
    let partialZat: number;

    if (customReceivedZat !== undefined) {
      partialZat = customReceivedZat;
    } else if (this.state.gift.amountZat === 100_000_000) {
      // For 1 ZEC gift (required 1.0001 ZEC), simulate exact 0.9 ZEC received
      partialZat = 90_000_000;
    } else {
      partialZat = Math.round(requiredZat * 0.9);
    }

    const remainingZat = Math.max(0, requiredZat - partialZat);

    this.state.gift.state = 'UNDERFUNDED';
    this.state.gift.receivedZat = partialZat;
    this.state.gift.confirmations = 1;

    this.state.isUnderfunded = true;
    this.state.receivedZat = partialZat;
    this.state.remainingZat = remainingZat;
    this.state.confirmations = 1;
    this.state.fundingUri = buildZip321Uri({
      address: this.state.gift.depositAddress,
      amountZec: zatoshisToZec(remainingZat),
    });

    await StorageService.saveGift(this.state.gift);

    liveAnnouncer.announce(
      `We received ${zatoshisToZec(partialZat)} ZEC but needed ${zatoshisToZec(requiredZat)} ZEC. Send the remaining ${zatoshisToZec(remainingZat)} ZEC.`
    );

    this.notify();
  }

  /**
   * Simulates full payment resolution and triggers progression to Ready
   */
  async simulateFullPayment(onReady: () => void): Promise<void> {
    const requiredZat = this.state.gift.amountZat + this.state.gift.claimFeeZat;
    this.state.gift.state = 'READY';
    this.state.gift.confirmations = 3;
    this.state.gift.receivedZat = requiredZat;

    this.state.isUnderfunded = false;
    this.state.isConfirmed = true;
    this.state.confirmations = 3;
    this.state.receivedZat = requiredZat;
    this.state.remainingZat = 0;

    await StorageService.saveGift(this.state.gift);
    liveAnnouncer.announce('Payment confirmed. Your gift is ready to share.');
    this.notify();
    onReady();
  }
}


