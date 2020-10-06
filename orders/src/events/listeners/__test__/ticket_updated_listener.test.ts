import { TicketUpdatedListener } from '../ticket-updated-listener';
import { TicketUpdatedEvent } from '@svpillai/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming'
const setup = async () => {
// create a Listener
const listener = new TicketUpdatedListener(natsWrapper.client);
    
// create and save a ticket
const ticket = Ticket.build({
id: new mongoose.Types.ObjectId().toHexString(),
title: 'concert',
price: 20
});
await ticket.save();

// create a fake data object
const data: TicketUpdatedEvent['data'] = {   
    id: ticket.id,
    version: ticket.version + 1,
    title: 'concert new',
    price: 99242,
    userid: '33423424etetet4242424'
    };
// create a fake msg object
//@ts-ignore
const msg: Message = {
    ack: jest.fn()
};

return { msg, data, ticket, listener };

};
//return all this stuff 
it('finds, updates and saves a ticket ', async () => {
const { msg, data, ticket, listener } = await setup();
await listener.onMessage(data , msg);
const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
    //console.log(updatedTicket);
});

it('acks the message', async () => {

const { msg, data, listener } = await setup();

await listener.onMessage(data, msg);

expect(msg.ack).toHaveBeenCalled();
});

it ('doesnot call ack if there is a skip of the version number', async () => {
    const { msg, data, listener } = await setup();
    data.version = 10;
    try {
        await listener.onMessage(data, msg);
    } catch (error) {
        //console.log(error);
    }    
    expect(msg.ack).not.toHaveBeenCalled();
});