import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompletedListener } from './events/listeners/expiration-completed-listener';

const start = async () => {
    console.log("Order Service is starting up!! ...");
    
    if(!process.env.JWT_KEY){

        throw new Error(' Secret JWT_KEY must be defined');
    }

    if(!process.env.MONGO_URI){

        throw new Error(' Environment Variable MONGO_URI must be defined');
    }

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

new TicketCreatedListener(natsWrapper.client).listen();
new TicketUpdatedListener(natsWrapper.client).listen();
new  ExpirationCompletedListener(natsWrapper.client).listen();

await mongoose.connect(process.env.MONGO_URI, {
useNewUrlParser: true,
useUnifiedTopology: true,
useCreateIndex: true
});  

console.log('Connected to MongoDB !!!! ');

} catch (err) {
    console.error(err);
}


app.listen(3000, () => { 
    console.log('Listening on Port 3000 !!! ');
});
};  

start ();