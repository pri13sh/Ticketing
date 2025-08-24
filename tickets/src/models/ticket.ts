import mongoose from "mongoose";

interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    usefId: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs):TicketDoc;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        tpe: Number,
        reuired: true
    },
    userId: {
        type: String,
        reuired: true
    }
},{
    toJSON: {
        transform(doc,ret: any) {
            ret.id = ret._id;
            delete ret._id
        }
    }
});

ticketSchema.statics.build = (attrs: TicketAttrs)=>{
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket',ticketSchema);

export { Ticket };