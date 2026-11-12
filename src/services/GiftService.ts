/**
 * Core Gift Service
 * PRD §13.2, §13.4, §13.6 (House Rule 2: Business rules in services)
 */

import { CryptoService } from './CryptoService';
import { LinkCodec } from './LinkCodec';
import { StorageService, GiftRecord } from './StorageService';
import { LightwalletdService } from './LightwalletdService';
import { GiftStateMachine } from '../events/stateMachine';
import { workerBridge } from '../worker/workerBridge';
import { zecToZatoshis } from '../zcash/units';
import { getClaimFeeZat } from '../zcash/fee';
import { buildZip321Uri } from '../zcash/zip321';

export class GiftService {
  /**
   * Initializes a new gift draft
   */
  static async createGiftDraft(params: {
    zecAmount: string;
    message?: string;
    passcode?: string;
  }): Promise<GiftRecord> {
    const secretBytes = CryptoService.generateRandomSecret();
    const secretHex = CryptoService.bytesToHex(secretBytes);
    const amountZat = zecToZatoshis(params.zecAmount);
    const claimFeeZat = getClaimFeeZat();
    const id = `gift_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Approximate current block height (e.g. 2,600,000)
    const birthdayHeight = 2600000;

    // Off-thread derive throw-away address (Mainnet or Testnet)
    const isTestnet = LightwalletdService.getActiveEndpoint().network === 'testnet';
    const { address } = await workerBridge.deriveAddress(secretHex, isTestnet);

    let messageEnc: string | undefined;
    if (params.message) {
      messageEnc = await CryptoService.encryptMessage(secretBytes, params.message);
    }

    let wrappedSecretHex: string | undefined;
    let isPasscodeProtected = false;
    if (params.passcode && params.passcode.trim().length > 0) {
      isPasscodeProtected = true;
      wrappedSecretHex = await CryptoService.wrapSecretWithPasscode(secretBytes, params.passcode);
    }

    const gift: GiftRecord = {
      id,
      version: 1,
      state: 'AWAITING_PAYMENT',
      amountZat,
      claimFeeZat,
      depositAddress: address,
      messagePlain: params.message,
      messageEnc,
      birthdayHeight,
      passcodeProtected: isPasscodeProtected,
      wrappedSecretHex,
      confirmations: 0,
      createdAt: Date.now(),
      remindAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30-day soft reminder (§8.3 E14)
      secretHex,
    };

    // Generate shareable link
    gift.shareableLink = LinkCodec.buildFullLink({
      secretHex: isPasscodeProtected ? wrappedSecretHex! : secretHex,
      birthdayHeight,
      isPasscodeProtected,
      amountZat,
      encryptedMessageB64: messageEnc,
    });

    await StorageService.saveGift(gift);
    return gift;
  }

  /**
   * Gets the ZIP-321 funding URI for a gift
   */
  static getFundingUri(gift: GiftRecord): string {
    const totalZat = gift.amountZat + gift.claimFeeZat;
    const totalZec = (totalZat / 100_000_000).toFixed(8).replace(/\.?0+$/, '');
    return buildZip321Uri({
      address: gift.depositAddress,
      amountZec: totalZec,
    });
  }

  /**
   * Begins tracking confirmation progress for a gift
   */
  static startFundingWatcher(
    gift: GiftRecord,
    onProgress: (progress: {
      confirmations: number;
      isReady: boolean;
      isUnderfunded: boolean;
      receivedZat: number;
      remainingZat: number;
    }) => void
  ): void {
    const requiredZat = gift.amountZat + gift.claimFeeZat;

    // Check live lightwalletd activity first
    LightwalletdService.checkAddressActivity(gift.depositAddress, gift.birthdayHeight, requiredZat)
      .then((liveAct) => {
        if (liveAct.receivedZat > 0) {
          GiftStateMachine.transition(gift, {
            type: 'paymentSeen',
            txid: liveAct.txid || `live_tx_${Date.now()}`,
            receivedZat: liveAct.receivedZat,
          });

          const updated = GiftStateMachine.transition(gift, {
            type: 'confirmationsChanged',
            confirmations: liveAct.confirmations,
          });

          const remainingZat = Math.max(0, requiredZat - (updated.receivedZat || 0));
          onProgress({
            confirmations: updated.confirmations,
            isReady: updated.state === 'READY',
            isUnderfunded: updated.state === 'UNDERFUNDED',
            receivedZat: updated.receivedZat || 0,
            remainingZat,
          });
        }
      })
      .catch(() => {});

    workerBridge.watchConfirmations(
      gift.depositAddress,
      3, // 3 confirmations required (§0 #3, §13.2 #4)
      gift.birthdayHeight,
      (res) => {
        GiftStateMachine.transition(gift, {
          type: 'paymentSeen',
          txid: res.txid,
          receivedZat: res.receivedZat,
        });

        const updated = GiftStateMachine.transition(gift, {
          type: 'confirmationsChanged',
          confirmations: res.confirmations,
        });

        const remainingZat = Math.max(0, requiredZat - (updated.receivedZat || 0));
        onProgress({
          confirmations: updated.confirmations,
          isReady: updated.state === 'READY',
          isUnderfunded: updated.state === 'UNDERFUNDED',
          receivedZat: updated.receivedZat || 0,
          remainingZat,
        });
      },
      requiredZat
    );
  }

  /**
   * Claim flow: Sweeps funds to the recipient's shielded address
   */
  static async claimGift(params: {
    secretHex: string;
    destinationAddress: string;
    amountZat: number;
    feeZat: number;
    giftRecord?: GiftRecord;
  }): Promise<string> {
    const isTestnet =
      params.destinationAddress.startsWith('utest1') ||
      params.destinationAddress.startsWith('ztestsapling1') ||
      LightwalletdService.getActiveEndpoint().network === 'testnet';

    const txid = await workerBridge.buildAndBroadcastSweep(
      params.secretHex,
      params.destinationAddress,
      params.amountZat,
      params.feeZat,
      isTestnet
    );

    if (params.giftRecord) {
      GiftStateMachine.transition(params.giftRecord, {
        type: 'txMined',
        txid,
        isClaim: true,
      });
    }

    return txid;
  }

  /**
   * Take back flow (Refund): Sweeps funds back to the sender
   */
  static async refundGift(gift: GiftRecord, refundAddress: string): Promise<string> {
    GiftStateMachine.transition(gift, {
      type: 'refundRequested',
      refundAddress,
    });

    const txid = await workerBridge.buildAndBroadcastSweep(
      gift.secretHex,
      refundAddress,
      gift.amountZat,
      gift.claimFeeZat
    );

    GiftStateMachine.transition(gift, {
      type: 'txMined',
      txid,
      isClaim: false,
    });

    return txid;
  }
}

