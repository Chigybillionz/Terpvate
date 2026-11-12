import { describe, it, expect } from 'vitest';
import { GiftStateMachine } from '../src/events/stateMachine';
import { GiftRecord } from '../src/services/StorageService';

function makeTestGift(): GiftRecord {
  return {
    id: 'test_gift_1',
    version: 1,
    state: 'AWAITING_PAYMENT',
    amountZat: 5_000_000, // 0.05 ZEC
    claimFeeZat: 10_000,  // 0.0001 ZEC
    depositAddress: 'u1testaddress',
    birthdayHeight: 2600000,
    passcodeProtected: false,
    confirmations: 0,
    createdAt: Date.now(),
    secretHex: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  };
}

describe('Gift State Machine (PRD §7.6 & §13.7)', () => {
  it('transitions from AWAITING_PAYMENT to CONFIRMING when payment is seen', () => {
    const gift = makeTestGift();
    const updated = GiftStateMachine.transition(gift, {
      type: 'paymentSeen',
      txid: 'tx_fund_1',
      receivedZat: 5_010_000,
    });

    expect(updated.state).toBe('CONFIRMING');
    expect(updated.fundTxid).toBe('tx_fund_1');
  });

  it('transitions to UNDERFUNDED if payment is lower than requested (PRD §8.3 E1)', () => {
    const gift = makeTestGift();
    const updated = GiftStateMachine.transition(gift, {
      type: 'paymentSeen',
      txid: 'tx_fund_low',
      receivedZat: 4_000_000, // Less than 5,010,000 required
    });

    expect(updated.state).toBe('UNDERFUNDED');
  });

  it('transitions from CONFIRMING to READY after 3 confirmations', () => {
    let gift = makeTestGift();
    gift.state = 'CONFIRMING';

    gift = GiftStateMachine.transition(gift, {
      type: 'confirmationsChanged',
      confirmations: 1,
    });
    expect(gift.state).toBe('CONFIRMING');
    expect(gift.confirmations).toBe(1);

    gift = GiftStateMachine.transition(gift, {
      type: 'confirmationsChanged',
      confirmations: 3,
    });
    expect(gift.state).toBe('READY');
    expect(gift.confirmations).toBe(3);
  });

  it('transitions to CLAIMED when receiver claim is mined', () => {
    let gift = makeTestGift();
    gift.state = 'READY';

    gift = GiftStateMachine.transition(gift, {
      type: 'claimRequested',
      receiverAddress: 'u1receiver',
    });
    expect(gift.state).toBe('CLAIMING');

    gift = GiftStateMachine.transition(gift, {
      type: 'txMined',
      txid: 'claim_txid_123',
      isClaim: true,
    });
    expect(gift.state).toBe('CLAIMED');
    expect(gift.claimTxid).toBe('claim_txid_123');
  });

  it('transitions to TAKEN_BACK when sender refund is mined', () => {
    let gift = makeTestGift();
    gift.state = 'READY';

    gift = GiftStateMachine.transition(gift, {
      type: 'refundRequested',
      refundAddress: 'u1senderrefund',
    });
    expect(gift.state).toBe('CLAIMING');

    gift = GiftStateMachine.transition(gift, {
      type: 'txMined',
      txid: 'refund_txid_456',
      isClaim: false,
    });
    expect(gift.state).toBe('TAKEN_BACK');
    expect(gift.refundTxid).toBe('refund_txid_456');
  });
});

