import { Publisher, Subjects, TicketUpdatedEvent } from '@svpillai/common';
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
   readonly subject = Subjects.TicketUpdated ;
}