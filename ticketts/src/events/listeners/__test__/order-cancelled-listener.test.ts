import { OrderCancelledListener } from "../order_cancelled_listener";
import { Ticket } from '../../../models/tickets';
import { natsWrapper} from '../../../nats-wrapper';
import  mongoose from 'mongoose';
import { OrderCancelledEvent, Listener } from '@svpillai/common';
import { Message } from 'node-nats-streaming';

const setup = async ( ) => {
    
    // Create an instance of the listener
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const listener = new OrderCancelledListener(natsWrapper.client);
    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 29,
        userid: 'asfasfss',
        });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        },
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
return { msg, data, ticket, orderId, listener } 
}

it ('Updates the ticket, Publish an event, and acks the ticket', async () => {
const { msg, data, ticket, orderId, listener } = await setup();
await listener.onMessage(data, msg);

const updatedTicket = await Ticket.findById(ticket.id);

expect(updatedTicket!.orderId).not.toBeDefined();
expect(msg.ack).toHaveBeenCalled();
expect(natsWrapper.client.publish).toHaveBeenCalled();
});
