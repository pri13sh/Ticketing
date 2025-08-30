import {
  connect,
  StringCodec,
  consumerOpts,
  JetStreamManager,
  RetentionPolicy,
  StorageType,
} from "nats";

console.clear();

async function start() {
  await setupStream(); // ✅ await here so stream is ready before subscribing

  const nc = await connect({ servers: "localhost:4222" });
  console.log("Listener connected to NATS (JetStream)");

  const sc = StringCodec();
  const js = nc.jetstream();

  // Build subscription options (durable = survives restarts, like STAN durable)
  const opts = consumerOpts();
  opts.durable("ticketing-service");
  opts.manualAck(); // manual ack like STAN
  opts.ackExplicit(); // only ack when we say so
  opts.deliverTo("ticket-listener"); // delivery subject (auto inbox if not set)

  const sub = await js.subscribe("ticket.created", opts);

  console.log("🚀 Waiting for messages...");

  for await (const m of sub) {
    console.log("📩 Message received:", sc.decode(m.data));
    m.ack(); // acknowledge (important in JetStream)
  }
}

async function setupStream() {
  const nc = await connect({ servers: "localhost:4222" }); // use Service name in K8s
  const jsm: JetStreamManager = await nc.jetstreamManager();

  try {
    await jsm.streams.add({
      name: "TICKETS",
      subjects: ["ticket.*"],
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
    });
    console.log("✅ Stream TICKETS created");
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("stream name already in use")) {
        console.log("ℹ️ Stream TICKETS already exists");
      } else {
        console.error("❌ Stream creation error:", err.message);
      }
    } else {
      console.error("❌ Unknown error creating stream:", err);
    }
  } finally {
    await nc.close(); // ✅ always close setup connection
  }
}

start().catch(console.error);
