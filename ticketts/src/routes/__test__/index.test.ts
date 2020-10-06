import request from 'supertest';
import {app} from '../../app';

const title = 'concerts';
const price = 50;
const createTicket  = async () => {
    return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title,
        price
    })
    .expect(201);
};

it('Return the list of tickets available', async () => { 
await createTicket();
await createTicket();
await createTicket();

const response = await request(app)
.get('/api/tickets')
.send()
.expect(200); 
 expect(response.body.length).toEqual(3);
});
 


