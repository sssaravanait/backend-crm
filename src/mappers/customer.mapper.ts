import type { CustomerRecord } from "../models/customer.model";
import type { CustomerResponse } from "../schemas/customer.schema";
import { formatApiDate } from '../shared/formatters/date.formatter';

// Explicit mapping: the database shape never leaks directly to the client
export const toCustomerResponse = (record: CustomerRecord): CustomerResponse => ({
    id: record._id.toString(),
    name: record.name,
    email: record.email,
    phone: record.phone,
    company: record.company,
    status: record.status,
    notes: record.notes,
    createdAt: formatApiDate(record.createdAt),
    updatedAt: formatApiDate(record.updatedAt),
});