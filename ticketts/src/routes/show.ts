import express, { Request, Response} from 'express';
import { ValidateRequest, requireAuth, NotFoundError } from '@svpillai/common';
import { Ticket } from '../models/tickets';
//import { Request } from 'supertest';
const router = express.Router();
router.get('/api/tickets/:id', async (req: Request, res: Response) => {
   //let ticket = null;
   //try {
    const ticket = await Ticket.findById(req.params.id);   
    if(!ticket) {
        throw new NotFoundError();
      }    
        res.send(ticket);      
   });

export {router as showTicketRouter};
