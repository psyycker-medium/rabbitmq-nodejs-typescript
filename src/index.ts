import client, {Connection, Channel, ConsumeMessage} from 'amqplib'

// Function to send some messages before consuming the queue
const sendMessages = (channel: Channel) => {
  for (let i = 0; i < 10; i++) {
    channel.sendToQueue('myQueue', Buffer.from(`message ${i}`))
  }
}

// consumer for the queue.
// We use currying to give it the channel required to acknowledge the message
const consumer = (channel: Channel) => (msg: ConsumeMessage | null): void => {
  if (msg) {
    // Display the received message
    console.log(msg.content.toString())
    // Acknowledge the message
    channel.ack(msg)
  }
}

const start = async () => {
  const connection: Connection = await client.connect('amqp://username:password@localhost:5672')
  // Create a channel
  const channel: Channel = await connection.createChannel()
  // Makes the queue available to the client
  await channel.assertQueue('myQueue')
  // Send some messages to the queue
  sendMessages(channel)
  // Start the consumer
  await channel.consume('myQueue', consumer(channel))
}

start()
