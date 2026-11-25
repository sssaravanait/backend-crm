import type { Request, Response } from "express";
import { getValidated } from "../middlewares/validate.middleware";
import { getUserId } from "../utils/requestUser";
import { sendSuccess } from "../utils/api-response";
import type { CustomerService } from "../services/customer.service";
import {
    customerResponseSchema,
    paginatedCustomersResponseSchema,
    type CreateCustomerInput,
    type CustomerIdParams,
    type ListCustomersQuery,
    type UpdateCustomerInput,
} from "../schemas/customer.schema";

// Controllers only translate HTTP <-> service calls. No business rules here.
export class CustomerController {
    constructor(private readonly service: CustomerService) {

    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        const query = getValidated<ListCustomersQuery>(res, "query");
        const result = await this.service.list(getUserId(req), query);
        sendSuccess(res, { paginatedCustomersResponseSchema, result }, 200);
    };

    getOne = async (req: Request, res: Response): Promise<void> => {
        const { id } = getValidated<CustomerIdParams>(res, "params");
        const customer = await this.service.getById(getUserId(req), id);
        sendSuccess(res, { customerResponseSchema, customer }, 200);
    };

    create = async (req: Request, res: Response): Promise<void> => {
        const input = getValidated<CreateCustomerInput>(res, "body");
        const customer = await this.service.create(getUserId(req), input);
        sendSuccess(res, { customerResponseSchema, customer }, 201);
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const { id } = getValidated<CustomerIdParams>(res, "params");
        const input = getValidated<UpdateCustomerInput>(res, "body");
        const customer = await this.service.update(getUserId(req), id, input);
        sendSuccess(res, { customerResponseSchema, customer }, 200);
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        const { id } = getValidated<CustomerIdParams>(res, "params");
        await this.service.remove(getUserId(req), id);
        res.status(204).end();
    };
}