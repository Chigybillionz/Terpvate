/**
 * My Gifts ViewModel (Sender Local Management)
 * PRD §8.1 (S9), §10.4 (LATCH: Time, Status), §13.6
 */

import { StorageService, GiftRecord } from '../services/StorageService';
import { GiftService } from '../services/GiftService';
import { liveAnnouncer } from '../a11y/liveAnnouncer';

export interface MyGiftsState {
  gifts: GiftRecord[];
  filter: 'ALL' | 'WAITING' | 'READY' | 'CLAIMED';
  isLoading: boolean;
  selectedGift?: GiftRecord;
  isRefunding: boolean;
  refundTxid?: string;
  error?: string;
}

export class MyGiftsViewModel {
  private state: MyGiftsState;
  private listeners = new Set<(state: MyGiftsState) => void>();

  constructor() {
    this.state = {
      gifts: [],
      filter: 'ALL',
      isLoading: true,
      isRefunding: false,
    };
  }

  subscribe(listener: (state: MyGiftsState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  async loadGifts(): Promise<void> {
    this.state.isLoading = true;
    this.notify();

    try {
      const list = await StorageService.getAllGifts();
      this.state.gifts = list;
    } catch (err: any) {
      this.state.error = 'Failed to load past gifts from device storage';
    } finally {
      this.state.isLoading = false;
      this.notify();
    }
  }

  setFilter(filter: 'ALL' | 'WAITING' | 'READY' | 'CLAIMED') {
    this.state.filter = filter;
    this.notify();
  }

  getFilteredGifts(): GiftRecord[] {
    if (this.state.filter === 'ALL') return this.state.gifts;
    if (this.state.filter === 'WAITING') {
      return this.state.gifts.filter((g) => g.state === 'AWAITING_PAYMENT' || g.state === 'CONFIRMING');
    }
    if (this.state.filter === 'READY') {
      return this.state.gifts.filter((g) => g.state === 'READY');
    }
    if (this.state.filter === 'CLAIMED') {
      return this.state.gifts.filter((g) => g.state === 'CLAIMED' || g.state === 'TAKEN_BACK');
    }
    return this.state.gifts;
  }

  async refundGift(gift: GiftRecord, refundAddress: string): Promise<string> {
    this.state.isRefunding = true;
    this.notify();

    try {
      const txid = await GiftService.refundGift(gift, refundAddress);
      this.state.refundTxid = txid;
      liveAnnouncer.announce('Gift refunded successfully to your wallet.');
      await this.loadGifts();
      return txid;
    } catch (err: any) {
      this.state.error = err?.message || 'Failed to refund gift';
      throw err;
    } finally {
      this.state.isRefunding = false;
      this.notify();
    }
  }
}
