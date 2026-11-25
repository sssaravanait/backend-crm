export const CUSTOMER_STATUSES = ['lead', 'active', 'inactive'] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];