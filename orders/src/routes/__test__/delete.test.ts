import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus} from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import  mongoose  from 'mongoose';

it ('marks an order as cancelled',async()=>{
// create a ticket with Ticket model
const ticketId = mongoose.Types.ObjectId().toHexString();
const ticket = Ticket.build({
    id: ticketId,
    title: 'concert',
    price: 20
    });

await ticket.save();

const user = global.signin();

//Make a request to create an order

const {body: order } = await request(app)
.post('/api/orders')
.set('Cookie', user)
.send({ ticketId: ticket.id })
.expect(201);
// Make a request to cancel the order
await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);
//expection to makesure that the order is canelled
const updatedOrder = await Order.findById(order.id);
expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});


it('Emits an event during an order cancellation ', async () => {
    const ticketId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        id: ticketId,
        title: 'concert',
        price: 20
        });
    
    await ticket.save();
    
    const user = global.signin();
    
    //Make a request to create an order
    
    const {body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);
    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);
    //expection to makesure that the order is canelled
    expect(natsWrapper.client.publish).toHaveBeenCalled();


});

