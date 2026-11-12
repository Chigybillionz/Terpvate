/**
 * Pay ViewModel (MVVM)
 * PRD §13.6, §8.1 (S6 & S7)
 */

import { GiftRecord, StorageService } from '../services/StorageService';
import { GiftService } from '../services/GiftService';
import { liveAnnouncer } from '../a11y/liveAnnouncer';

export interface PayState {
  gift: GiftRecord;
  fundingUri: string;
  confirmations: number;
  requiredConfirmations: number;
  isConfirmed: boolean;
  isWatching: boolean;
  timeRemainingSeconds: number;
  error?: string;
}

export class PayViewModel {
  private state: PayState;
  private listeners = new Set<(state: PayState) => void>();

  constructor(gift: GiftRecord) {
    const fundingUri = GiftService.getFundingUri(gift);
    this.state = {
      gift,
      fundingUri,
      confirmations: gift.confirmations || 0,
      requiredConfirmations: 3,
      isConfirmed: gift.state === 'READY',
      isWatching: false,
      timeRemainingSeconds: 240, // ~4 minutes estimate
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

    GiftService.startFundingWatcher(this.state.gift, (confirmations, isReady) => {
      this.state.confirmations = confirmations;
      this.state.isConfirmed = isReady;

      liveAnnouncer.announce(
        isReady
          ? 'Payment confirmed. Your gift is ready to share.'
          : `Payment seen. ${confirmations} of 3 confirmations.`
      );

      this.notify();

      if (isReady) {
        this.state.isWatching = false;
        // Update local record
        StorageService.getGift(this.state.gift.id).then((updated) => {
          if (updated) this.state.gift = updated;
          onReady();
        });
      }
    });
  }
}
