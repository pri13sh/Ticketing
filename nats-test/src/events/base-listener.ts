import {
  StringCodec,
  consumerOpts,
  JetStreamClient,
  JsMsg,
  JetStreamManager,
  AckPolicy,
  RetentionPolicy,
  StorageType
} from "nats";

export abstract class Listener<T> {
  abstract subject: string;
  abstract queueGroupName: string;
  protected client: JetStreamClient;
  protected ackWait = 5 * 1000;
  protected streamName = "EVENTS";

  constructor(client: JetStreamClient) {
    this.client = client;
  }

  // Ensure stream exists before subscribing
  private async ensureStreamExists() {
    const jsm = await this.client.jetstreamManager();
    
    try {
      await jsm.streams.add({
        name: this.streamName,
        subjects: [`${this.subject}`],
        retention: RetentionPolicy.Limits,
        storage: StorageType.File,
        max_consumers: -1,
        max_msgs: -1,
        max_bytes: -1,
      });
      console.log(`✅ Stream ${this.streamName} created for subject ${this.subject}`);
    } catch (err) {
      if (err instanceof Error && !err.message.includes("stream name already in use")) {
        throw err;
      }
    }
  }

  // Create consumer with proper JetStream configuration
  private async createConsumer() {
    const jsm = await this.client.jetstreamManager();
    
    try {
      await jsm.consumers.add(this.streamName, {
        durable_name: this.queueGroupName,
        ack_policy: AckPolicy.Explicit,
        deliver_group: this.queueGroupName,
        deliver_subject: `deliver.${this.queueGroupName}`,
        filter_subject: this.subject,
        max_ack_pending: 100,
        ack_wait: this.ackWait * 1000000
      });
      console.log(`✅ Consumer ${this.queueGroupName} created`);
    } catch (err) {
      if (err instanceof Error && err.message.includes("already exists")) {
        console.log(`ℹ️ Consumer ${this.queueGroupName} already exists`);
        return;
      }
      throw err;
    }
  }

  subscriptionOptions() {
    const opts = consumerOpts();
    opts.durable(this.queueGroupName);
    opts.manualAck();
    opts.ackExplicit();
    opts.deliverAll();
    return opts;
  }

  async listen() {
    // Ensure stream exists first
    await this.ensureStreamExists();
    
    // Then ensure consumer exists
    await this.createConsumer();
    
    // Use regular subscribe with proper options
    const sub = await this.client.subscribe(
      this.subject, 
      this.subscriptionOptions()
    );
    
    const sc = StringCodec();
    console.log(`🎯 Listening on ${this.subject} in group ${this.queueGroupName}`);

    for await (const m of sub) {
      try {
        const parsedData = this.parseMessage(m, sc);
        await this.onMessage(parsedData, m);
      } catch (error) {
        console.error(`Error processing message: ${error}`);
      }
    }
  }

  protected parseMessage(msg: JsMsg, sc: ReturnType<typeof StringCodec>): T {
    return JSON.parse(sc.decode(msg.data));
  }

  abstract onMessage(data: T, msg: JsMsg): Promise<void>;
}