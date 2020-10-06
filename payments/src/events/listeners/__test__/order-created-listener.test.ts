import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@svpillai/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);
    const data: OrderCreatedEvent['data'] = {
        id:new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: '34324235325',
        expiresAt: new Date().toISOString(),
    ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 50,
        }
    };
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { data, listener, msg };
};

it('replicates the order info', async () => {
const { listener, data, msg } = await setup();
await listener.onMessage(data, msg);
const order = await Order.findById(data.id);
expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
const { listener, data, msg } = await setup();
await listener.onMessage(data, msg);   
console.log(data);
expect(msg.ack).toHaveBeenCalled();
});




