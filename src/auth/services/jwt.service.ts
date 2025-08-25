import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { RedisService } from '../../services/redis.service';

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);

  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
  }

  generateRefreshToken(payload: any): string {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token in Redis with expiration
    const expiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_SECONDS', 7 * 24 * 60 * 60);
    this.redisService.set(`refresh_token:${payload.id}`, token, expiresIn);

    return token;
  }

  verifyAccessToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      this.logger.error('Failed to verify access token', error);
      return null;
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if token exists in Redis
      const storedToken = this.redisService.get(`refresh_token:${payload.id}`);
      if (!storedToken || storedToken !== token) {
        return null;
      }

      return payload;
    } catch (error) {
      this.logger.error('Failed to verify refresh token', error);
      return null;
    }
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.redisService.del(`refresh_token:${userId}`);
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }

    const newAccessToken = this.generateAccessToken({ id: payload.id, email: payload.email });
    const newRefreshToken = this.generateRefreshToken({ id: payload.id, email: payload.email });

    // Revoke old refresh token
    await this.revokeRefreshToken(payload.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
