import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { RedisService } from '../../services/redis.service';

@Injectable()
export class CustomJwtService {
  private readonly logger = new Logger(CustomJwtService.name);

  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });
  }

  generateRefreshToken(payload: any): string {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    // Store refresh token in Redis with expiration
    const expiresIn = this.configService.get<number>(
      'jwt.refreshExpiresInSeconds',
    );
    this.redisService.set(`refresh_token:${payload.id}`, token, expiresIn);

    return token;
  }

  verifyAccessToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
    } catch (error) {
      this.logger.error('Failed to verify access token', error);
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Check if token exists in Redis
      const storedToken = await this.redisService.get(
        `refresh_token:${payload.id}`,
      );
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

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }

    const newAccessToken = this.generateAccessToken({
      id: payload.id,
      email: payload.email,
    });
    const newRefreshToken = this.generateRefreshToken({
      id: payload.id,
      email: payload.email,
    });

    // Revoke old refresh token
    await this.revokeRefreshToken(payload.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
