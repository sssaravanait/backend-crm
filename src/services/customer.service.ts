import { AppError } from "../errors/AppError";
import { toCustomerResponse } from "../mappers/customer.mapper";
import type { CustomerRepository } from "../repositories/customer.repository";
import type {
    CreateCustomerInput,
    CustomerResponse,
    ListCustomersQuery,
    PaginatedCustomersResponse,
    UpdateCustomerInput,
} from "../schemas/customer.schema";

const customerNotFound = () => AppError.notFound("Customer not found");

export class CustomerService {
    // Constructor injection: the repository is supplied from outside (DIP)
    constructor(private readonly repository: CustomerRepository) { }

    async list(ownerId: string, query: ListCustomersQuery): Promise<PaginatedCustomersResponse> {
        const { items, total } = await this.repository.findMany({ ownerId, ...query });

        return {
            data: items.map(toCustomerResponse),
            meta: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }

    async getById(ownerId: string, id: string): Promise<CustomerResponse> {
        const record = await this.repository.findByIdForOwner(id, ownerId);
        if (!record) throw customerNotFound();
        return toCustomerResponse(record);
    }

    async create(ownerId: string, input: CreateCustomerInput): Promise<CustomerResponse> {
        const record = await this.repository.create({ ...input, ownerId });
        return toCustomerResponse(record);
    }

    async update(ownerId: string, id: string, input: UpdateCustomerInput): Promise<CustomerResponse> {
        const record = await this.repository.updateForOwner(id, ownerId, input);
        if (!record) throw customerNotFound();
        return toCustomerResponse(record);
    }

    async remove(ownerId: string, id: string): Promise<void> {
        const deleted = await this.repository.deleteForOwner(id, ownerId);
        if (!deleted) throw customerNotFound();
    }
}