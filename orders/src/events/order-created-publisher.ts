import { Publisher, OrderCreatedEvent, Subjects} from '@svpillai/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {

    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

