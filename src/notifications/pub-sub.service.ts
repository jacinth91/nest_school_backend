import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class PubSubService implements OnModuleInit {
  private publisher: Redis;
  private subscriber: Redis;
  private messageHandlers: Map<string, (message: any) => void> = new Map();
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    // Handle incoming messages
    this.subscriber.on('message', (channel, message) => {
      const handler = this.messageHandlers.get(channel);
      if (handler) {
        handler(JSON.parse(message));
      }
    });

    this.isInitialized = true;
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.onModuleInit();
    }
  }

  async subscribe(channel: string, handler: (message: any) => void) {
    await this.ensureInitialized();
    await this.subscriber.subscribe(channel);
    this.messageHandlers.set(channel, handler);
  }

  async publish(channel: string, message: any) {
    await this.ensureInitialized();
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  private handleMessage(channel: string, message: any) {
    switch (channel) {
      case 'feedback:created':
        this.handleFeedbackCreated(message);
        break;
      case 'feedback:status:updated':
        this.handleFeedbackStatusUpdated(message);
        break;
    }
  }

  private handleFeedbackCreated(message: any) {
    console.log('Processing new feedback:', message);
    // Implement notification logic here
  }

  private handleFeedbackStatusUpdated(message: any) {
    console.log('Processing status update:', message);
    // Implement notification logic here
  }
} 