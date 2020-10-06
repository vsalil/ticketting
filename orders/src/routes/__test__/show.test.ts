import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
it('Fetches the order', async () => {

//create a ticket
const ticketId = mongoose.Types.ObjectId().toHexString();
const ticket = Ticket.build({
    id: ticketId,
 title: "concert",
 price: 20
});

await ticket.save();

const user = global.signin();

const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie',user)
    .send({ ticketId: ticket.id})
    .expect(201);
// make a request to build an order with this ticket
const {body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie',user)
    .send()
    .expect(200);
// make request to fetch the order
expect(fetchedOrder.id).toEqual(order.id);
});

it('Other users order is not allowed to fetch', async () => {

    //create a ticket
    const ticketId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
     id: ticketId,
     title: "concert",
     price: 20
    });
    
    await ticket.save();
    
    const user1 = global.signin();
    const user2 = global.signin();
     
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie',user1)
        .send({ ticketId: ticket.id})
        .expect(201);
    // make a request to build an order with this ticket
    const {body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie',user2)
        .send()
        .expect(401);
    // make request to fetch the order
    //expect(fetchedOrder.id).toEqual(order.id);
    });
