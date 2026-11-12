/**
 * Focus Management Helper
 * PRD §15 (Focus: visible focus ring, focus moves to new screen heading on step change)
 */

export function focusHeading(selector: string = 'h1, h2'): void {
  if (typeof document === 'undefined') return;
  setTimeout(() => {
    const heading = document.querySelector<HTMLElement>(selector);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }, 100);
}
