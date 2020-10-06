import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { requireAuth, OrderStatus, ValidateRequest, BadRequestError,NotFoundError, NotAuthorizedError } from '@svpillai/common';

const router = express.Router();

router.post('/api/payments',requireAuth,[ 
        body('token')
        .not()
        .isEmpty()
        .withMessage('Token is missing'),
        body('orderId')
        .not()
        .isEmpty()
        .withMessage('OrderId is missing'),
    ],                                           
        ValidateRequest,
async (req: Request, res: Response) => {
const { token, orderId } = req.body;

const order = await Order.findById(orderId);

if (!order) {
    throw new NotFoundError();
}

if(order.userId !== req.currentUser!.id) {

    throw new NotAuthorizedError();
}
if (order.status === OrderStatus.Cancelled) {

    throw new BadRequestError('Cannot pay for a cancelled error');

}
res.send({success: true});
});

export { router as createChargeRouter }