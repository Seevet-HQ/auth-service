import { Controller, Get, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../services/redis.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: 'unknown',
        redis: 'unknown',
      },
    };

    try {
      // Check MongoDB connection
      if (this.mongoConnection.readyState === 1) {
        health.services.mongodb = 'ok';
        this.logger.log('MongoDB connection is healthy');
      } else {
        health.services.mongodb = 'error';
        this.logger.error('MongoDB connection is not healthy');
      }
    } catch (error) {
      health.services.mongodb = 'error';
      this.logger.error('MongoDB health check failed', error);
    }

    try {
      // Check Redis connection
      const ping = await this.redisService.ping();
      if (ping === 'PONG') {
        health.services.redis = 'ok';
        this.logger.log('Redis connection is healthy');
      } else {
        health.services.redis = 'error';
        this.logger.error('Redis connection is not healthy');
      }
    } catch (error) {
      health.services.redis = 'error';
      this.logger.error('Redis health check failed', error);
    }

    // Overall status
    if (health.services.mongodb === 'error' || health.services.redis === 'error') {
      health.status = 'error';
    }

    return health;
  }
}
