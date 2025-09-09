import { Listener } from "../events/base-listener";
import {
  JsMsg
} from "nats";

// Example implementation
export class TicketCreatedListener extends Listener {
  subject = "ticket.created";
  queueGroupName = "payment-service";

  onMessage(data: any, msg: JsMsg) {
    console.log("✅ Event data received:", data);
    msg.ack(); // acknowledge
  }
}