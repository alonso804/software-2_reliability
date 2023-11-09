import amqp from 'amqplib';
import { circuitBreaker } from './controllers/anime';

const queueName = 'retry-queue';

async function publishToQueue(requestData: any) {
    const rabbitMQConnection = await amqp.connect('amqp://localhost');
    const channel = await rabbitMQConnection.createChannel();
    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(requestData)));
}

async function consumeQueue() {  
    const rabbitMQConnection = await amqp.connect('amqp://localhost');
    const channel = await rabbitMQConnection.createChannel();
    await channel.assertQueue(queueName);
  
    channel.consume(queueName, async (message) => {
      if (message !== null) {
        try {
          const requestData = JSON.parse(message.content.toString());
  
          const response = await circuitBreaker.fire(requestData);
          console.log('Successfully processed message:', response);
  
          channel.ack(message);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.reject(message, false);
        }
      }
    });
  }

export {
    publishToQueue,
    consumeQueue
}