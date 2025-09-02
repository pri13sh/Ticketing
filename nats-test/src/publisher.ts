import { connect, StringCodec } from "nats";

console.clear();
async function start() {
  // Connect to NATS
  const nc = await connect({ servers: "localhost:4222" });
  console.log("Publisher connected to NATS");

  const sc = StringCodec();

  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20
  });

  // simple publish (no ack)
  nc.publish("ticket.created", sc.encode(data));

  console.log("Event published");
//   await nc.drain();

}

start();
