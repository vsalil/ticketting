import { OrderCreatedEvent, OrderStatus } from '@svpillai/common';
import { OrderCreatedListener } from '../order_created_listeners';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/tickets';
import mongoose from 'mongoose';
import { Message }  from 'node-nats-streaming';
const setup = async ( ) => {
    
    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);
    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userid: 'asfasfss',
    });

await ticket.save();
// create the fake data Event
const data: OrderCreatedEvent['data'] = {

    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asfassfaasf',
    expiresAt: 'dddsdfassa',
    ticket: {
        id: ticket.id,
        price: ticket.price
    }
    };
    //@ts-ignore
    const msg:Message = {
        ack: jest.fn(),
    };
    return { listener, ticket, data, msg };
};

it('sets the user id of the ticket', async() => {

const { listener, ticket, data, msg } = await setup();
await listener.onMessage(data, msg);
const updatedTicket = await Ticket.findById(ticket.id);
expect(updatedTicket!.orderId).toEqual(data.id);

});

it('acks the message', async() => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async() => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    //@ts-ignore
    const ticketUpdateData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[2][1]);
    //console.log(data);
    //console.log({ticketUpdateData});
    expect(data.id).toEqual(ticketUpdateData.orderId)
});