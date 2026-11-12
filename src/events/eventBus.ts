/**
 * Typed In-App Event Bus (Pub/Sub)
 * PRD §13.7 (Observer vs Pub/Sub)
 *
 * Screens must unsubscribe on unmount to prevent memory leaks.
 */

export type AppEventMap = {
  'gift:created': { giftId: string };
  'gift:stateChanged': { giftId: string; oldState: string; newState: string };
  'gift:confirmations': { giftId: string; confirmations: number; required: number };
  'gift:claimed': { giftId: string; txid: string; receiverAddress: string };
  'gift:refunded': { giftId: string; txid: string; refundAddress: string };
  'gift:error': { giftId: string; message: string };
  'wallet:syncProgress': { height: number; targetHeight: number };
};

type EventHandler<T> = (payload: T) => void;

class EventBus {
  private handlers = new Map<keyof AppEventMap, Set<EventHandler<any>>>();

  on<K extends keyof AppEventMap>(event: K, handler: EventHandler<AppEventMap[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    const set = this.handlers.get(event)!;
    set.add(handler);

    // Return cleanup / unsubscribe function
    return () => {
      set.delete(handler);
    };
  }

  emit<K extends keyof AppEventMap>(event: K, payload: AppEventMap[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Error in event handler for "${String(event)}":`, err);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();

