/**
 * Gift Lifecycle Event-Driven State Machine
 * PRD §7.6 (The Event-Driven State Machine, Group 19)
 */

import { GiftRecord, StorageService } from '../services/StorageService';
import { eventBus } from './eventBus';

export type GiftEvent =
  | { type: 'paymentSeen'; txid: string; receivedZat: number }
  | { type: 'confirmationsChanged'; confirmations: number }
  | { type: 'claimRequested'; receiverAddress: string }
  | { type: 'txBroadcast'; txid: string; isClaim: boolean }
  | { type: 'txMined'; txid: string; isClaim: boolean }
  | { type: 'refundRequested'; refundAddress: string }
  | { type: 'timerElapsed' };

export class GiftStateMachine {
  /**
   * Applies an event transition to a GiftRecord according to §7.6
   */
  static transition(gift: GiftRecord, event: GiftEvent): GiftRecord {
    const oldState = gift.state;
    let nextState = oldState;
    const updated: GiftRecord = { ...gift };

    switch (oldState) {
      case 'DRAFT':
        if (event.type === 'confirmationsChanged' || event.type === 'paymentSeen') {
          nextState = 'AWAITING_PAYMENT';
        }
        break;

      case 'AWAITING_PAYMENT':
        if (event.type === 'paymentSeen') {
          updated.fundTxid = event.txid;
          const required = gift.amountZat + gift.claimFeeZat;
          if (event.receivedZat < required) {
            nextState = 'UNDERFUNDED';
          } else {
            nextState = 'CONFIRMING';
          }
        }
        break;

      case 'UNDERFUNDED':
        if (event.type === 'paymentSeen') {
          const required = gift.amountZat + gift.claimFeeZat;
          if (event.receivedZat >= required) {
            nextState = 'CONFIRMING';
          }
        }
        break;

      case 'CONFIRMING':
        if (event.type === 'confirmationsChanged') {
          updated.confirmations = event.confirmations;
          if (event.confirmations >= 3) {
            nextState = 'READY';
          }
        }
        break;

      case 'READY':
        if (event.type === 'claimRequested') {
          nextState = 'CLAIMING';
        } else if (event.type === 'refundRequested') {
          updated.refundAddress = event.refundAddress;
          nextState = 'CLAIMING'; // Shared sweep broadcast state
        } else if (event.type === 'timerElapsed') {
          nextState = 'EXPIRED';
        }
        break;

      case 'CLAIMING':
        if (event.type === 'txMined') {
          if (event.isClaim) {
            updated.claimTxid = event.txid;
            nextState = 'CLAIMED';
          } else {
            updated.refundTxid = event.txid;
            nextState = 'TAKEN_BACK';
          }
        }
        break;

      case 'EXPIRED':
        // Soft expiry: bearer link remains valid, receiver can still claim or sender can refund
        if (event.type === 'claimRequested') {
          nextState = 'CLAIMING';
        } else if (event.type === 'refundRequested') {
          updated.refundAddress = event.refundAddress;
          nextState = 'CLAIMING';
        }
        break;

      case 'CLAIMED':
      case 'TAKEN_BACK':
        // Terminal states
        break;
    }

    updated.state = nextState;

    if (oldState !== nextState) {
      eventBus.emit('gift:stateChanged', {
        giftId: gift.id,
        oldState,
        newState: nextState,
      });
      // Save state update asynchronously
      StorageService.saveGift(updated).catch(() => {});
    }

    return updated;
  }
}
