import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import { ValidateRequest,NotFoundError,requireAuth, NotAuthorizedError, BadRequestError } from '@svpillai/common'
import { Ticket } from '../models/tickets';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();
router.put('/api/tickets/:id', requireAuth, [
    body('title').not().isEmpty().withMessage('ticket title is missing'),
    //body('price').not().isEmpty().withMessage('price is missing'),
    body('price').isFloat({ gt:0 }).withMessage('Price Must be greater than 0')
], ValidateRequest, 
    async (req: Request, res: Response) => {
    const { title, price } = req.body;
    //console.log(req);
    const ticket = await Ticket.findById(req.params.id);
    //const origticket = await Ticket.findById(req.params.id);
    if(!ticket) {          
        throw new NotFoundError();
    } else {
    if ( ticket.orderId)
    {
        throw new BadRequestError('Cannot edit a reserved Ticket')
    }
    if(ticket.userid == req.currentUser!.id){
        ticket.set(
            {title:req.body.title,
             price:req.body.price}
          );        
        await ticket.save();
        new TicketUpdatedPublisher(natsWrapper.client).publish({

            id: ticket.id,
            version:ticket.version,
            title: ticket.title,
            price: ticket.price,
            userid: ticket.userid,
        });
        } 
       else {
           throw new NotAuthorizedError;
       }     
    }
    res.send(ticket);
});

export { router as updateTicketRouter };