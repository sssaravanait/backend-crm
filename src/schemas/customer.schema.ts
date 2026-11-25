import { z } from "zod";
import { CUSTOMER_STATUSES } from "../constants/customer.constant";

const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;

const requiredText = (max: number) => z.string().trim().min(1, "Required").max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();

// Shared between create and update (DRY)
const customerFields = {
    name: requiredText(120),
    email: z.string().trim().toLowerCase().email("Invalid email").max(254),
    phone: optionalText(30),
    company: optionalText(120),
    status: z.enum(CUSTOMER_STATUSES).default("lead"),
    notes: z.string().max(2000).optional(),
};

// ---------- Request schemas ----------

// .strict() rejects unknown keys, which blocks mass assignment (e.g. sending `owner`)
export const createCustomerSchema = z.object(customerFields).strict();

export const updateCustomerSchema = z
    .object(customerFields)
    .partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Provide at least one field to update",
    });

export const customerIdParamsSchema = z.object({
    id: z.string().regex(MONGO_ID_REGEX, "Invalid customer id"),
});

export const listCustomersQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
    status: z.enum(CUSTOMER_STATUSES).optional(),
    sort: z.enum(["createdAt", "-createdAt", "name", "-name"]).default("-createdAt"),
});

// ---------- Response schemas ----------

export const customerResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    company: z.string().optional(),
    status: z.enum(CUSTOMER_STATUSES),
    notes: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const paginatedCustomersResponseSchema = z.object({
    data: z.array(customerResponseSchema),
    meta: z.object({
        page: z.number().int(),
        limit: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
    }),
});

// ---------- Inferred types ----------

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
export type CustomerIdParams = z.infer<typeof customerIdParamsSchema>;
export type CustomerResponse = z.infer<typeof customerResponseSchema>;
export type PaginatedCustomersResponse = z.infer<typeof paginatedCustomersResponseSchema>;