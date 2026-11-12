/**
 * Send ViewModel (MVVM)
 * PRD §13.6 (House Rules: ViewModels decide; screens show; services do crypto)
 */

import { PriceService, FiatEstimate } from '../services/PriceService';
import { GiftService } from '../services/GiftService';
import { GiftRecord } from '../services/StorageService';
import { liveAnnouncer } from '../a11y/liveAnnouncer';

export interface SendState {
  zecAmount: string;
  fiatEstimate: FiatEstimate;
  message: string;
  passcode: string;
  isPasscodeEnabled: boolean;
  isCreating: boolean;
  error?: string;
}

export class SendViewModel {
  private state: SendState;
  private listeners = new Set<(state: SendState) => void>();

  constructor() {
    this.state = {
      zecAmount: '0.05',
      fiatEstimate: PriceService.estimateNgn('0.05'),
      message: '',
      passcode: '',
      isPasscodeEnabled: false,
      isCreating: false,
    };
  }

  subscribe(listener: (state: SendState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  setAmount(amount: string) {
    this.state.zecAmount = amount;
    this.state.fiatEstimate = PriceService.estimateNgn(amount);
    this.notify();
  }

  setMessage(msg: string) {
    // Character limit check (512 bytes max per §5.1 F2)
    if (new TextEncoder().encode(msg).length <= 512) {
      this.state.message = msg;
      this.notify();
    }
  }

  setPasscode(pass: string) {
    this.state.passcode = pass;
    this.notify();
  }

  togglePasscode(enabled?: boolean) {
    this.state.isPasscodeEnabled = enabled !== undefined ? enabled : !this.state.isPasscodeEnabled;
    this.notify();
  }

  async createGift(): Promise<GiftRecord> {
    const amountNum = parseFloat(this.state.zecAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Please enter a valid gift amount in ZEC.');
    }

    this.state.isCreating = true;
    this.notify();

    try {
      const gift = await GiftService.createGiftDraft({
        zecAmount: this.state.zecAmount,
        message: this.state.message.trim() || undefined,
        passcode: this.state.isPasscodeEnabled ? this.state.passcode : undefined,
      });

      liveAnnouncer.announce('Gift created. Proceeding to payment.');
      return gift;
    } catch (err: any) {
      this.state.error = err?.message || 'Failed to create gift';
      this.notify();
      throw err;
    } finally {
      this.state.isCreating = false;
      this.notify();
    }
  }
}

