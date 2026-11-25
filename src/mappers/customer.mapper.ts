import type { CustomerRecord } from "../models/customer.model";
import type { CustomerResponse } from "../schemas/customer.schema";

// Explicit mapping: the database shape never leaks directly to the client
export const toCustomerResponse = (record: CustomerRecord): CustomerResponse => ({
    id: record._id.toString(),
    name: record.name,
    email: record.email,
    phone: record.phone,
    company: record.company,
    status: record.status,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
});