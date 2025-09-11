import { Listener } from "../events/base-listener";
import { JsMsg } from "nats";

interface TicketCreatedEvent {
  id: string;
  title: string;
  price: number;
  userId: string;
}

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject = "ticket.created";
  queueGroupName = "payment-service";
  protected streamName = "TICKETS_STREAM";

  async onMessage(data: TicketCreatedEvent, msg: JsMsg): Promise<void> {
    console.log("✅ Event data received:", data);
    msg.ack();
  }
}