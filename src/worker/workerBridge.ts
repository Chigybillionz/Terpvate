/**
 * Worker Bridge (UI-Thread to Web Worker Interface)
 * PRD §13.4, §13.7
 */

import type { WorkerRequest, WorkerResponse } from './wallet.worker';

class WorkerBridge {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, {
    resolve: (val: any) => void;
    reject: (err: any) => void;
    onProgress?: (progress: any) => void;
  }>();

  private initWorker() {
    if (!this.worker && typeof window !== 'undefined') {
      this.worker = new Worker(new URL('./wallet.worker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
        const res = event.data;
        const pending = this.pendingRequests.get(res.id);
        if (!pending) return;

        if (res.type === 'error') {
          pending.reject(new Error(res.message));
          this.pendingRequests.delete(res.id);
        } else if (res.type === 'confirmationsUpdate') {
          if (pending.onProgress) {
            pending.onProgress(res);
          }
          if (res.isReady) {
            pending.resolve(res);
            this.pendingRequests.delete(res.id);
          }
        } else {
          pending.resolve(res);
          this.pendingRequests.delete(res.id);
        }
      });
    }
  }

  async deriveAddress(secretHex: string): Promise<{ address: string; viewingKey: string }> {
    this.initWorker();
    const id = `req_${Math.random().toString(36).substring(2, 9)}`;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker!.postMessage({ id, type: 'deriveAddress', secretHex } as WorkerRequest);
    });
  }

  watchConfirmations(
    address: string,
    required: number,
    birthdayHeight: number,
    onProgress: (res: any) => void
  ): Promise<any> {
    this.initWorker();
    const id = `watch_${Math.random().toString(36).substring(2, 9)}`;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject, onProgress });
      this.worker!.postMessage({
        id,
        type: 'pollConfirmations',
        address,
        required,
        birthdayHeight,
      } as WorkerRequest);
    });
  }

  async buildAndBroadcastSweep(
    secretHex: string,
    destinationAddress: string,
    amountZat: number,
    feeZat: number
  ): Promise<string> {
    this.initWorker();
    const id = `sweep_${Math.random().toString(36).substring(2, 9)}`;

    const res: any = await new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker!.postMessage({
        id,
        type: 'buildSweepTx',
        secretHex,
        destinationAddress,
        amountZat,
        feeZat,
      } as WorkerRequest);
    });

    return res.txid;
  }
}

export const workerBridge = new WorkerBridge();
