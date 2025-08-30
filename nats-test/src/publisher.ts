import { connect, StringCodec } from "nats";

async function start() {
  // Connect to NATS
  const nc = await connect({ servers: "localhost:4222" });
  console.log("Publisher connected to NATS");

  // Use JetStream
  const js = nc.jetstream();
  const sc = StringCodec();

  // Publish to a subject
  await js.publish("tickets.created", sc.encode(JSON.stringify({
    id: "123",
    title: "concert",
    price: 20
  })));

  console.log("Event published");

  await nc.drain(); // close connection gracefully
}

start();
