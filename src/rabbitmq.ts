import amqp from 'amqplib';

import { circuitBreaker } from './controllers/anime';
import { logger } from './logger';

const queueName = 'retry-queue';

async function publishToQueue(requestData: Record<string, unknown>): Promise<void> {
  const rabbitMQConnection = await amqp.connect('amqp://localhost');
  const channel = await rabbitMQConnection.createChannel();
  await channel.assertQueue(queueName);
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(requestData)));
}

async function consumeQueue(): Promise<void> {
  const rabbitMQConnection = await amqp.connect('amqp://localhost');
  const channel = await rabbitMQConnection.createChannel();
  await channel.assertQueue(queueName);

  channel.consume(queueName, async (message) => {
    if (message !== null) {
      try {
        const requestData = JSON.parse(message.content.toString()) as { id: number };
        // const response = await findByIdService(requestData);
        const response = await circuitBreaker.fire(requestData);
        logger.info('Successfully processed message:', response);
        channel.ack(message);
      } catch (error) {
        logger.debug('Error processing message:', error);
        channel.reject(message, false);
      }
    }
  });
}

export { consumeQueue, publishToQueue };
