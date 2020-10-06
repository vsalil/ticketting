import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// Interface describes what it creates a Ticket

interface TicketAttrs {
    title: string;
    price: number;
    userid: string
    }

// An interface that describes properties
// that a Ticket model has

interface TicketModel extends mongoose.Model<TicketDoc> {

    build(attrs: TicketAttrs): TicketDoc;
}

// An interface that describes properties
// that a Ticket Document has

interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userid: string;
    version: number;
    orderId?: string;
}

const TicketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userid: {
        type: String,
        required: true
    } ,  
    orderId: {
        type: String,
        required: false
    }
},{
    toJSON: {
        transform(doc,ret){
            ret.id = ret._id;
            delete ret._id;
             }
          }
    }
);
TicketSchema.set('versionKey', 'version');
TicketSchema.plugin(updateIfCurrentPlugin);

TicketSchema.statics.build = (attrs: TicketAttrs) => {

    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('ticket', TicketSchema);

const buildTicket = (attrs: TicketAttrs) => {

    return new Ticket(attrs);
};

export { Ticket };


