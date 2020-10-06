import { Listener, OrderCreatedEvent,Subjects } from '@svpillai/common';
import { QueueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
subject:Subjects.OrderCreated = Subjects.OrderCreated;
queueGroupName = QueueGroupName;
async onMessage(data: OrderCreatedEvent['data'],msg: Message){
    const delay = new Date(data.expiresAt).getTime()  - new Date().getTime(); 
    console.log(' Order Created expiration event is expected to be released within ', delay/1000, ' seconds');
    await expirationQueue.add({
        orderId: data.id
        },{
           delay, 
        });
    msg.ack();
    };
};