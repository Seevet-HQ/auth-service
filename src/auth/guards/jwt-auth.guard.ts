import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../services/redis.service';

interface JwtPayload {
  id: string;
  email: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const authHeader = request?.headers?.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      }) as JwtPayload;

      if (!payload) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Check if the token is blacklisted
      const isBlacklisted = await this.isAccessTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Attach user info to request
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async isAccessTokenBlacklisted(token: string): Promise<boolean> {
    try {
      // Use the same hashing logic as in the auth service
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const blacklistKey = `blacklisted_access_token:${hash}`;
      
      const blacklisted = await this.redisService.exists(blacklistKey);
      return blacklisted;
    } catch (error) {
      // Fail securely - deny access when security checks fail
      this.logger.error('Failed to check token blacklist - denying access', error);
      return true; // Token is considered blacklisted if we can't verify
    }
  }
}
