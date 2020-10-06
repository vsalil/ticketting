import { OrderCreatedListener } from './events/listener/order-created_listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
    
    if(!process.env.NATS_CLIENT_ID){

        throw new Error(' Environment Variable NATS_CLIENT_ID must be defined');
    }
    if(!process.env.NATS_URL){

        throw new Error(' Environment Variable NATS_URL must be defined');
    }
    if(!process.env.NATS_CLUSTER_ID){

        throw new Error(' Environment Variable NATS_CLUSTER_ID must be defined');
    }

try {
await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID, 
    process.env.NATS_CLIENT_ID, 
    process.env.NATS_URL);

 //await natsWrapper.connect('ticketting','212123','http://ticketting-nats-service:4222');

natsWrapper.client.on('close', () => {
    console.log ( 'NATS Connection closed!');
    process.exit();
});
process.on('SIGINT',() => natsWrapper.client.close());
process.on('SIGTERM', () => natsWrapper.client.close());

new OrderCreatedListener(natsWrapper.client).listen();
} catch (err) {
    console.error(err);
}
}; 
start ();