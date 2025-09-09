import {
  connect,
  StringCodec,
  consumerOpts,
  JetStreamClient,
  JsMsg,
  NatsConnection,
} from "nats";


// Base Listener (like in STAN, but JetStream aware)
export abstract class Listener {
  abstract subject: string;          // subject name
  abstract queueGroupName: string;   // queue group name
  protected client: JetStreamClient; // JetStream client
  protected ackWait = 5 * 1000;      // default ack wait time

  constructor(client: JetStreamClient) {
    this.client = client;
  }

  // subscription options builder
  subscriptionOptions() {
    const opts = consumerOpts();
    opts.queue(this.queueGroupName); // queue group = load balance
    opts.durable(this.queueGroupName); // durable = remember position
    opts.manualAck(); // manual ack (we ack after processing)
    opts.ackExplicit();
    opts.deliverAll(); // start from all available messages
    return opts;
  }

  // listen to subject
  async listen() {
    const sub = await this.client.subscribe(this.subject, this.subscriptionOptions());
    const sc = StringCodec();

    console.log(`Listening for events on subject: ${this.subject}`);

    for await (const m of sub) {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(m, sc);
      this.onMessage(parsedData, m);
    }
  }

  // helper to parse message
  parseMessage(msg: JsMsg, sc: ReturnType<typeof StringCodec>) {
    return JSON.parse(sc.decode(msg.data));
  }

  // abstract handler (must implement in child)
  abstract onMessage(data: any, msg: JsMsg): void;
}