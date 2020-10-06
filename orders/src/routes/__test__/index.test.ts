import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const buildTicket = async () => {
    const ticketId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        id: ticketId,
        title: 'Concert',
        price: 20
    });
    await ticket.save();
    return ticket;
}

it ('fetches orders for a particular user ', async () => {

// Create three tickets 
const ticketOne = await buildTicket();
const ticketTwo = await buildTicket();
const ticketThree = await buildTicket();

const userOne = global.signin();
const userTwo = global.signin();

// Create one order as User #1

const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);
//Create tow ordrs as User #2
const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
const { body: orderThree } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);
// Make request to get Orders for user #2
const response = await request(app)
      .get('/api/orders')
      .set('Cookie', userTwo)
      .expect(200);
//console.log(response.body);
//console.log(orderTwo);
//console.log(orderThree);
expect(response.body.length).toEqual(2);
expect(response.body[0].id).toEqual(orderTwo.id);
expect(response.body[1].id).toEqual(orderThree.id);   
expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});