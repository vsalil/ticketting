import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import {requireAuth, ValidateRequest} from '@svpillai/common';
import { Ticket } from './../models/tickets';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
//import nats, { Stan } from 'node-nats-streaming';
import { natsWrapper } from '../nats-wrapper';
//const client = Stan);
  /*const client = nats.connect('ticketting', '12442324', {
        url: "http://ticketting-nats-service:4222"
    }); */
    
const router = express.Router();

router.post('/api/tickets', requireAuth, [
        body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
        body('price')
        .not()
        .isEmpty()
        .withMessage('Price is required'),
        body('price')
        .isFloat({ gt:0 })
        .withMessage( 'Price Must be greater than 0')
        //body('title').isEmpty().withMessage('Title should not be empty')
        ],
    ValidateRequest, async (req: Request, res:Response) => {
            const { title, price } = req.body;
            const ticket = Ticket.build({
             title,
             price,
             userid: req.currentUser!.id   
            });
            await ticket.save();
            new TicketCreatedPublisher(natsWrapper.client).publish(
                    {
                        id: ticket.id,
                        version: ticket.version,
                        title: ticket.title,
                        price: ticket.price,
                        userid: ticket.userid
                    }
            );
            res.status(201).send(ticket);
    });

export { router as createTicketRouter };
//const 