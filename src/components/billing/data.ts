// Single source of truth for the Copilot usage-based billing visuals.
// Figures follow GitHub Docs for usage-based billing (effective June 1, 2026).

export const CREDIT_USD = 0.01;

export type PlanId = 'business' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  seatUsd: number;
  creditsPerSeat: number;
}

export const PLANS: Record<PlanId, Plan> = {
  business: { id: 'business', name: 'Copilot Business', seatUsd: 19, creditsPerSeat: 1900 },
  enterprise: { id: 'enterprise', name: 'Copilot Enterprise', seatUsd: 39, creditsPerSeat: 3900 },
};

export interface CostCenter {
  id: string;
  name: string;
  seats: number;
  /** Share of this cost center's own included credits used so far this month (0..1). */
  usedShare: number;
  /** Index into the --cc-N color tokens. */
  color: 0 | 1 | 2;
}

export const COST_CENTERS: CostCenter[] = [
  { id: 'eng', name: 'Engineering', seats: 30, usedShare: 36500 / 57000, color: 0 },
  { id: 'ds', name: 'Data Science', seats: 15, usedShare: 1, color: 1 },
  { id: 'mkt', name: 'Marketing', seats: 5, usedShare: 3800 / 9500, color: 2 },
];

export const TOTAL_SEATS = COST_CENTERS.reduce((n, c) => n + c.seats, 0);

export const ENTERPRISE_BUDGET_USD = 500;

export const USER_BUDGETS = [
  { level: 'Individual', example: 'e.g. @mona · $100' },
  { level: 'Cost center', example: 'e.g. Eng · $30/user' },
  { level: 'Universal', example: 'everyone · $10/user' },
] as const;

export const METERED_ORDER = [
  { level: 'Cost center budget', note: 'if in one' },
  { level: 'Organization budget', note: 'license org' },
  { level: 'Enterprise budget', note: 'otherwise' },
] as const;

export const credits = (plan: Plan, seats: number) => plan.creditsPerSeat * seats;
export const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 });
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export function licenseUsd(plan: Plan, seats = TOTAL_SEATS) {
  return plan.seatUsd * seats;
}

export function maxBillUsd(plan: Plan, seats = TOTAL_SEATS, budget = ENTERPRISE_BUDGET_USD) {
  return licenseUsd(plan, seats) + budget;
}

export const SOURCES = [
  { title: 'Usage-based billing for organizations and enterprises', url: 'https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises' },
  { title: 'Budgets for usage-based billing', url: 'https://docs.github.com/en/copilot/concepts/billing-and-usage/organizations-and-enterprises/budgets' },
  { title: 'Budgets and alerts', url: 'https://docs.github.com/en/billing/concepts/budgets-and-alerts' },
];
