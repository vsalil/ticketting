import nats, { Stan, Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';
console.clear();
const id = randomBytes(4).toString('hex');

const stan = nats.connect('ticketting', id, {
    url: "http://10.0.3.200:4222"
});
stan.on('connect', () => {
    
    //const opts = sc.subscriptionOptions(){
    console.log('Listening to NATs for messages client id:' + id);
    
    stan.on('close', () => {
        console.log ( 'NATS Connection closed!');
        process.exit();
    });

    new TicketCreatedListener(stan).listen();
});

process.on('SIGINIT', () => stan.close());
process.on('SIGTERM', () => stan.close());

