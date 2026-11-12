/**
 * Zcash ZIP 317 Conventional Fee Calculation
 * PRD §13.1, Appendix C
 *
 * Conventional fee = marginal_fee (5,000 zatoshis) * max(grace_actions = 2, logical_actions)
 * Standard shielded transfer (1-in / 2-out or grace action <= 2) = 10,000 zatoshis (0.0001 ZEC)
 */

export const MARGINAL_FEE_ZAT = 5_000;
export const GRACE_ACTIONS = 2;
export const STANDARD_CLAIM_FEE_ZAT = 10_000; // 0.0001 ZEC

export function calculateZip317Fee(logicalActions: number = 2): number {
  const actions = Math.max(GRACE_ACTIONS, logicalActions);
  return MARGINAL_FEE_ZAT * actions;
}

export function getClaimFeeZat(): number {
  return STANDARD_CLAIM_FEE_ZAT;
}
