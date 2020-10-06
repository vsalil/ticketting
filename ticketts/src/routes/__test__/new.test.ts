import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/tickets';
import { natsWrapper } from '../../nats-wrapper';


    it('Has a route handler /api/tickets for post request', async () => { 
    const response = await request(app)
    .post('/api/tickets')
    .send({});
    expect(response.status).not.toEqual(404);
    });

    it('only allow authenticated user', async () => { 
    
        const response = await request(app)
        .post('/api/tickets')
        .send()
        .expect(401);        
    });

    it('User login should get other than 401', async () => {
    //let cookie = global.signin(); 
    //let cookie = ['express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZtTVdZeVpHVXlNbUppTmpaa01EQTFPRGxqWXpneVppSXNJbVZ0WVdsc0lqb2ljM1p3UUdkdFlXbHNMbU52YlNJc0ltbGhkQ0k2TVRVNU5UZzNPRGc0TTMwLlVaUF90ZjdTMUVvWmhIc2lXeUlDN2NGelVTQVFrR19sZ2NBLVd4Y1V3VWMifQ=='];
    //console.log(cookie);
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
    expect(response.status).not.toEqual(401);    
    });

    it('Error if invalid title is provided', async () => { 
        await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: '10'})
        .expect(400);

        await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: '10'})
        .expect(400);  
    });
    
    it('Returns Error if invalid price is provided', async () => { 
        await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
               title: 'abcdefg',
               price: '-10'})
        .expect(400);  
        await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
               title: 'abcdefg',
               price: ''})
        .expect(400);  
        await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
               title: 'abcdefg'
               })
        .expect(400);  
    });

    it('Returns 201 after successful creation of ticket', async () => { 
        let tickets = await Ticket.find({});
        expect(tickets.length).toEqual(0);
        let title = 'New Program - Ticket';
        let price = 200;
        const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price
            })
        .expect(201);
        // console.log(response)
        tickets = await Ticket.find({});
        expect(tickets.length).toEqual(1);
        expect(tickets[0].price).toEqual(price);
        expect(tickets[0].title).toEqual(title);
        //console.log(tickets);
        //console.log(response.body.id);
        });

        it('publishes an Event', async () => {
        let title = 'New Program - Ticket';
        let price = 200;
         await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price
            })
        .expect(201);

            //console.log(natsWrapper);
        expect(natsWrapper.client.publish).toHaveBeenCalled();
        });

        