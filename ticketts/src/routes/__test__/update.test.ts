import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/tickets';

const title = 'Concert New';
const price = 20;
const title_m = 'Conert Modified';
const price_m = 30;

it('Returns 404 error if the ticket is not found', async () => {
 const id = new mongoose.Types.ObjectId().toHexString();
 await request(app)
.put(`/api/tickets/${id}`)
.set('Cookie',global.signin())
.send({
    title,
    price 
})
.expect(404)
});

it('Returns 401 error if the user is not authenticated', async () => {
const id = new mongoose.Types.ObjectId().toHexString();
 await request(app)
.put(`/api/tickets/${id}`)
.send({
    title,
    price
    })
 .expect(401);
});

it('Returns 200 error if the ticket is found and modified', async () => {
    const cookie = global.signin();
    const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie',cookie)
    .send({
       title,
       price })
   .expect(201);
     
   const res_update = await request(app)
   .put(`/api/tickets/${response.body.id}`)
   .set('Cookie',cookie)
   .send({
       title: title_m,
       price: price_m
   })
   .expect(200);
   expect(res_update.body.title).toEqual(title_m);
   expect(res_update.body.price).toEqual(price_m);
   });

   it('Returns 401 error if the ticket is not owned by the user', async () => {
    const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie',global.signin())
    .send({
       title,
       price })
   .expect(201);

    await request(app)
   .put(`/api/tickets/${response.body.id}`)
   .set('Cookie',global.signin())
   .send({
       title: title_m,
       price
   })
   .expect(401);
   });

   it('Returns 400 error if the user provides invalid title and price', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
   .put(`/api/tickets/${id}`)
   .set('Cookie',global.signin())
   .send({
       title: 'Best Concert',
     
       })
    .expect(400);
   });

   it('publishes an event during an update', async ()=> {
    const cookie = global.signin();
    const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie',cookie)
    .send({
       title,
       price })
   .expect(201);
     
   const res_update = await request(app)
   .put(`/api/tickets/${response.body.id}`)
   .set('Cookie',cookie)
   .send({
       title: title_m,
       price: price_m
   })
   .expect(200);
   expect(natsWrapper.client.publish).toHaveBeenCalled();
   });

   it('Rejects updates if the ticket is reserved', async() => {
    const cookie = global.signin();
    const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie',cookie)
    .send({
       title,
       price });
   const ticket = await Ticket.findById(response.body.id);
   ticket!.set({orderId: mongoose.Types.ObjectId().toHexString()}) 
   await ticket!.save();

   const res_update = await request(app)
   .put(`/api/tickets/${response.body.id}`)
   .set('Cookie',cookie)
   .send({
       title: title_m,
       price: price_m
   })
   .expect(400);

   })
