import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
import {randomBytes} from 'crypto';
//import { connect } from 'http2';
console.clear();
const id = randomBytes(4).toString('hex');
console.log(id);

const stan = nats.connect('ticketting', id, {
    url: "http://10.0.3.200:4222"
});
const pr = Number((Math.random().toFixed(2))) * 100;

stan.on('connect', async () => {
        console.log('connected to NATs for publishing');
        const publisher = new TicketCreatedPublisher(stan);
        await publisher.publish({
          id: id,
          title: 'concert',
          price: pr,
        })
       /* const data = JSON.stringify({
            id : id,
            title: `new-conert`,
            price: pr.toFixed(2) 
        });
         // Simple Publisher (all publishes are async in the node version of the client)
        stan.publish('tickets:created', data, (err, guid) => {
          if (err) {
            console.log('publish failed: ' + err)
          } else {
            console.log('published message with guid: ' + guid + data)
          } 
        })*/
})
 

