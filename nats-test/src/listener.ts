import {
  connect,
  NatsConnection,
} from "nats";
import { TicketCreatedListener } from './events/ticket-created-listener';

// Main startup
async function start() {
  const nc: NatsConnection = await connect({ servers: "localhost:4222" });
  console.log("Listener connected to NATS (JetStream)");

  const js = nc.jetstream();

  // create listener instance
  const ticketListener = new TicketCreatedListener(js);
  await ticketListener.listen();

  // handle close signals
  process.on("SIGINT", () => nc.close());
  process.on("SIGTERM", () => nc.close());
}

start().catch(console.error);
