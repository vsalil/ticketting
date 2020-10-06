import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';
import { OrderStatus, OrderCancelledEvent, Listener } from '@svpillai/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const order = Order.build({ 
        id: mongoose.Types.ObjectId().toHexString(),
        userId: 'dadgsdagadsgqwrqew',
        version: 0,
        price: 55,
        status: OrderStatus.Created
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asfsafasfasf' }
    };

    //@ts-ignore        

    const msg: Message = {

        ack: jest.fn()
    };

    return { listener, msg, data, order };
};

it (' updates the status of the order ', async () =>{

    const { listener, msg, data, order } = await setup();
    await listener.onMessage(data,msg);
    
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it (' It acks the message ', async () =>{

    const { listener, msg, data, order } = await setup();
    await listener.onMessage(data,msg);
    const updatedOrder = await Order.findById(order.id);
    console.log({updatedOrder});
    expect(msg.ack).toHaveBeenCalled();
})

