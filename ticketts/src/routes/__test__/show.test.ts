import request from 'supertest';
import {app} from '../../app'
import mongoose from 'mongoose';

it('It returns 404 if the ticket is not found ',async ()=>{
    const id = new mongoose.Types.ObjectId().toHexString();
    const response =  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
     .expect(404);
     //console.log(response.body);
});

it('It returns ticket if the ticket is  found ',async ()=>{
    const title = "Test Concert";
    const price = 25;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({title, price})
    .expect(201);  
    //console.log(`/api/tickets/${response.body.id}`);
    //console.log('/api/tickets/'+ response.body.id );
    const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set('Cookie',global.signin())
    .send({})
    .expect(200);
    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
    //console.log(res);
    });
    