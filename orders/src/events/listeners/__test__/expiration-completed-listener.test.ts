import { ExpirationCompletedListener } from '../expiration-completed-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteEvent, OrderStatus } from '@svpillai/common';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup =  async () => {

    const listener = new ExpirationCompletedListener(natsWrapper.client);
    const ticket = Ticket.build({
        id:  mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    const order = Order.build({
        userId: '334dwerewrer',
        status: OrderStatus.Created,
        expiersAt: new Date(),
        ticket,      
         });
    await order.save();
    const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
    };
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, order, ticket, data, msg }
};

it('updates the order status to cancelled', async() => {
    const { listener, order, data, msg  } = await setup();
    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Emits order cancelled event', async() => {
    const { listener, order, data, msg  } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[1][1]
        );
    //console.log((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    
    expect(eventData.id).toEqual(order.id);  

});

it('acks the message', async() => {
    const { listener, data, msg  } = await setup();
    await listener.onMessage(data, msg);
    expect( msg.ack ).toHaveBeenCalled();

});

