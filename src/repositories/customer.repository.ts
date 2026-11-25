import { Types, type FilterQuery } from "mongoose";
import type { CustomerStatus } from "../constants/customer.constant";
import {
    CustomerModel,
    type CustomerAttributes,
    type CustomerRecord,
} from "../models/customer.model";
import type {
    CreateCustomerInput,
    ListCustomersQuery,
    UpdateCustomerInput,
} from "../schemas/customer.schema";

export interface NewCustomer extends CreateCustomerInput {
    ownerId: string;
}

export interface FindCustomersParams {
    ownerId: string;
    page: number;
    limit: number;
    sort: ListCustomersQuery["sort"];
    search?: string;
    status?: CustomerStatus;
}

export interface PagedCustomers {
    items: CustomerRecord[];
    total: number;
}

/**
 * Dependency Inversion: the service depends on this contract, not on Mongoose.
 * Tests can pass an in-memory fake, and the DB can change without touching business logic.
 */
export interface CustomerRepository {
    findMany(params: FindCustomersParams): Promise<PagedCustomers>;
    findByIdForOwner(id: string, ownerId: string): Promise<CustomerRecord | null>;
    create(data: NewCustomer): Promise<CustomerRecord>;
    updateForOwner(id: string, ownerId: string, data: UpdateCustomerInput): Promise<CustomerRecord | null>;
    deleteForOwner(id: string, ownerId: string): Promise<boolean>;
}

const SORT_MAP: Record<ListCustomersQuery["sort"], Record<string, 1 | -1>> = {
    createdAt: { createdAt: 1 },
    "-createdAt": { createdAt: -1 },
    name: { name: 1 },
    "-name": { name: -1 },
};

// Stops user input such as ".*" from being interpreted as regex syntax
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const oid = (id: string) => new Types.ObjectId(id);

export class MongoCustomerRepository implements CustomerRepository {
    async findMany({ ownerId, page, limit, sort, search, status }: FindCustomersParams): Promise<PagedCustomers> {
        const filter: FilterQuery<CustomerAttributes> = { owner: oid(ownerId) };

        if (status) filter.status = status;
        if (search) {
            const pattern = new RegExp(escapeRegex(search), "i");
            filter.$or = [{ name: pattern }, { email: pattern }, { company: pattern }];
        }

        const [items, total] = await Promise.all([
            CustomerModel.find(filter)
                .sort(SORT_MAP[sort])
                .skip((page - 1) * limit)
                .limit(limit)
                .lean<CustomerRecord[]>()
                .exec(),
            CustomerModel.countDocuments(filter).exec(),
        ]);

        return { items, total };
    }

    async findByIdForOwner(id: string, ownerId: string): Promise<CustomerRecord | null> {
        return CustomerModel.findOne({ _id: oid(id), owner: oid(ownerId) })
            .lean<CustomerRecord>()
            .exec();
    }

    async create({ ownerId, ...data }: NewCustomer): Promise<CustomerRecord> {
        const doc = await CustomerModel.create({ ...data, owner: oid(ownerId) });
        return doc.toObject() as CustomerRecord;
    }

    async updateForOwner(id: string, ownerId: string, data: UpdateCustomerInput): Promise<CustomerRecord | null> {
        // Ownership is checked inside the same atomic query, so there's no check-then-act race
        return CustomerModel.findOneAndUpdate(
            { _id: oid(id), owner: oid(ownerId) },
            { $set: data },
            { new: true, runValidators: true },
        )
            .lean<CustomerRecord>()
            .exec();
    }

    async deleteForOwner(id: string, ownerId: string): Promise<boolean> {
        const { deletedCount } = await CustomerModel.deleteOne({
            _id: oid(id),
            owner: oid(ownerId),
        }).exec();
        return deletedCount === 1;
    }
}