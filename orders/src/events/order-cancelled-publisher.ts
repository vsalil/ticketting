import { Publisher, OrderCancelledEvent, Subjects} from '@svpillai/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
