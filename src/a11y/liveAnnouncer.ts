/**
 * Accessible Live Region Announcer
 * PRD §15 (Screen readers: live regions announce status changes)
 */

class LiveAnnouncer {
  private liveRegion: HTMLDivElement | null = null;

  init(): void {
    if (typeof document === 'undefined') return;
    if (this.liveRegion) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.id = 'a11y-live-announcer';
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.margin = '-1px';
    this.liveRegion.style.overflow = 'hidden';
    this.liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    this.liveRegion.style.whiteSpace = 'nowrap';
    this.liveRegion.style.border = '0';

    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) this.init();
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    // Clearing text first ensures re-announcement of identical strings
    this.liveRegion.textContent = '';
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    }, 50);
  }
}

export const liveAnnouncer = new LiveAnnouncer();

