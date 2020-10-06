import express, { Request, Response } from 'express' ;
import { requireAuth , ValidateRequest, NotFoundError, OrderStatus, BadRequestError, currentUser} from '@svpillai/common';
import { body } from 'express-validator';
import mangoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mangoose.Types.ObjectId.isValid(input))
    .withMessage('Ticket must  be provided')
], ValidateRequest, async (req: Request, res: Response) => {
const { ticketId } = req.body;

// Find the ticket the user is trying to order in the database

const ticket = await Ticket.findById(ticketId);
if (!ticket) {
    throw new NotFoundError();
}
// Makesure that the ticket is not already reserved
const isReserved = await ticket.isReserved();
if(isReserved) {
    throw new BadRequestError("Ticket is already Reserved");
}

// Calculate an expiration date for the order
const expiration = new Date();
expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

// Build the order and save it to the database

const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiersAt: expiration,
    ticket
    
});
//console.log(order.expiersAt);

const result = await order.save();
//console.log({order}, expiration , new Date(), result);
// Publish an event saying that an order was created

new OrderCreatedPublisher(natsWrapper.client).publish({
id: order.id,
version: order.version,
status: order.status,
userId: order.userId,
expiresAt: order.expiersAt.toISOString(),
ticket:{
    id: ticket.id,
    price: ticket.price
},
});
    res.status(201).send(order);
}
);

export { router as newOrderRouter};