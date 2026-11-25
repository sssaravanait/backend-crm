import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CustomerController } from '../controllers/customer.controller';
import { CustomerService } from '../services/customer.service';
import { MongoCustomerRepository } from '../repositories/customer.repository';
import { 
    createCustomerSchema, 
    updateCustomerSchema, 
    listCustomersQuerySchema, 
    customerIdParamsSchema 
} from '../schemas/customer.schema';

// Default parameter = composition root. Tests can inject a fake service.
export const customerRouter = (
    service: CustomerService = new CustomerService(new MongoCustomerRepository())
): Router => {
    const router = Router();
    const controller = new CustomerController(service);
    const validateId = validate(customerIdParamsSchema, "params");

    // Every customer route requires a valid JWT
    router.use(authenticate);

    router.get('/', validate(listCustomersQuerySchema), controller.getAll);
    router.post('/', validate(createCustomerSchema), controller.create);
    router.get('/:id', validateId, controller.getOne);
    router.patch('/:id', validateId, validate(updateCustomerSchema), controller.update);
    router.delete('/:id', validateId, controller.delete);

    return router;
}