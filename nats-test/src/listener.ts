import {
  connect,
  StringCodec,
  consumerOpts,
  JetStreamManager,
  RetentionPolicy,
  StorageType,
  AckPolicy,     
} from "nats";

console.clear();

async function start() {
  await setupStream(); // wait for stream to exist

  const nc = await connect({ servers: "localhost:4222" });
  console.log("Listener connected to NATS (JetStream)");

  (async () => {
    try {
      const err = await nc.closed();
      if (err) {
        console.error(`NATS closed with an error: ${err.message}`);
      } else {
        console.log("NATS connection closed");
      }
    } catch (err) {
      console.error("Error while closing NATS:", err);
    }
    process.exit();
  })();

  
  const sc = StringCodec();
  const js = nc.jetstream();

  // Durable + Queue consumer
  const opts = consumerOpts();
  opts.durable("ticketing-service");           // persistent durable name
  opts.manualAck();
  opts.ackExplicit();                          // explicit ack policy
  opts.queue("orders-service-queue-group");    // queue group (load balancing)
  opts.deliverTo("ticket-listener");           // delivery subject
  opts.deliverAll();                           // ✅ replay all available messages

  const sub = await js.subscribe("ticket.created", opts);

  console.log("Waiting for messages...");

  for await (const m of sub) {
    console.log("Message received:", sc.decode(m.data));
    m.ack(); // acknowledge
  }


  process.on("SIGINT", () => {
    console.log("Caught SIGINT, closing NATS...");
    nc.close();
  });

  process.on("SIGTERM", () => {
    console.log("Caught SIGTERM, closing NATS...");
    nc.close();
  });
}

async function setupStream() {
  const nc = await connect({ servers: "localhost:4222" });
  const jsm: JetStreamManager = await nc.jetstreamManager();

  try {
    await jsm.streams.add({
      name: "TICKETS",
      subjects: ["ticket.*"],
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
    });
    console.log("Stream TICKETS created");
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("stream name already in use")) {
        console.log("Stream TICKETS already exists");
      } else {
        console.error("Stream creation error:", err.message);
      }
    } else {
      console.error("Unknown error creating stream:", err);
    }
  } finally {
    await nc.close();
  }
}

start().catch(console.error);
