import  request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@svpillai/common';

it('returns a 404 when purchasing an order that deosnt exist', async () => { 
await request(app)
    .post( '/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: '34235234535223sgddsg',
        orderId:  mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that deosnt belongs to the user', async () => { 
const order = Order.build({
    id: mongoose.Types.ObjectId().toString(),
    userId: mongoose.Types.ObjectId().toString(),
    version: 0,
    price: 50,
    status: OrderStatus.Created
    });
    await order.save();
    await request(app)
    .post( '/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: '34235234535223sgddsg',
        orderId:  order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => { 


});
