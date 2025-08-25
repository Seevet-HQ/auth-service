import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      this.redisClient = createClient({
        socket: {
          host: this.configService.get<string>('redis.host'),
          port: this.configService.get<number>('redis.port'),
        },
        password: this.configService.get<string>('redis.password'),
        database: this.configService.get<number>('redis.db'),
      });

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis Client Error', err);
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis Client Connected');
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis Client Ready');
      });

      await this.redisClient.connect();
      this.logger.log('Redis client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis client', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await this.redisClient.get(key);
      this.logger.debug(
        `Redis GET ${key}: ${result ? result.substring(0, 50) + '...' : 'null'}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get key: ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      this.logger.debug(
        `Redis SET ${key}: ${value.substring(0, 50)}... (length: ${value.length})`,
      );
      if (ttl) {
        await this.redisClient.setEx(key, ttl, value);
      } else {
        await this.redisClient.set(key, value);
      }
      this.logger.debug(`Redis SET successful for key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set key: ${key}`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key: ${key}`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key: ${key}`, error);
      return false;
    }
  }

  async ping(): Promise<string> {
    try {
      return await this.redisClient.ping();
    } catch (error) {
      this.logger.error('Failed to ping Redis', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}
