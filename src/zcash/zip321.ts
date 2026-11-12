/**
 * ZIP 321 Payment Request URI Builder & Parser
 * PRD §13.1, Appendix C
 *
 * Format: zcash:<address>?amount=<decimalZEC>&message=<memo>
 */

export interface Zip321PaymentRequest {
  address: string;
  amountZec: string;
  memoBase64Url?: string;
}

export function buildZip321Uri(params: Zip321PaymentRequest): string {
  const url = new URL(`zcash:${params.address}`);
  if (params.amountZec) {
    url.searchParams.set('amount', params.amountZec);
  }
  if (params.memoBase64Url) {
    url.searchParams.set('memo', params.memoBase64Url);
  }
  return url.toString();
}

export function parseZip321Uri(uri: string): Zip321PaymentRequest | null {
  try {
    if (!uri.startsWith('zcash:')) return null;
    const raw = uri.slice(6);
    const [addressPart, queryPart] = raw.split('?');
    if (!addressPart) return null;

    let amountZec = '';
    let memoBase64Url: string | undefined;

    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      amountZec = searchParams.get('amount') || '';
      memoBase64Url = searchParams.get('memo') || undefined;
    }

    return {
      address: addressPart,
      amountZec,
      memoBase64Url,
    };
  } catch {
    return null;
  }
}
