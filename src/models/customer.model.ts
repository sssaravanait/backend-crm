import { Types, Schema, model } from "mongoose";
import { CUSTOMER_STATUSES, CustomerStatus } from "../constants/customer.constant";

export interface CustomerAttributes {
    owner: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: CustomerStatus;
    notes?: string;
}

// Fields Mongoose adds because of `timestamps: true`
export interface CustomerTimestamps {
    createdAt: Date;
    updatedAt: Date;
}

export type CustomerRecord = CustomerAttributes & CustomerTimestamps & {
    _id: Types.ObjectId;
}

// The schema generic describes the full stored shape, timestamps included
type CustomerDocument = CustomerAttributes & CustomerTimestamps;

const customerSchema = new Schema<CustomerDocument>(
    {
        owner: { type: Schema.Types.ObjectId, ref: "user", required: true },
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
        phone: { type: String, trim: true, maxlength: 30 },
        company: { type: String, trim: true, maxlength: 120 },
        status: { type: String, enum: [...CUSTOMER_STATUSES], default: 'lead' },
        notes: { type: String, maxlength: 1000 },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// One email per owner. The owner prefix also serves owner-only queries.
customerSchema.index({ owner: 1, email: 1 }, { unique: true });
// Supports the common "my customers by status, newest first" list query
customerSchema.index({ owner: 1, status: 1, createdAt: -1 });

export const CustomerModel = model<CustomerDocument>("Customer", customerSchema);