import { Subjects, Listener, OrderCreatedEvent } from '@svpillai/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{

    subject:Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
       
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket throw error
        if ( !ticket ) {

            throw new Error ("Ticket not found ");
        }

        // Mark the ticket as being reserved as order property
        ticket.set({ orderId: data.id });
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userid: ticket.userid,
            orderId: ticket.orderId,
            version: ticket.version
        });
        //ack teh message
        msg.ack();
    }

}