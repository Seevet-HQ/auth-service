import {
    ConflictException,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RedisService } from '../../services/redis.service';
import { User, UserDocument } from '../../users/user.model';
import { RegisterDto } from '../dto/register.dto';

interface JwtPayload {
  id: string;
  email: string;
}

interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') || '7d',
    });
  }

  private getRefreshTokenKey(userId: string): string {
    return `refresh_token:${userId}`;
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresInSeconds = this.configService.get<number>('jwt.refreshExpiresInSeconds') || 604800;
    
    // Store in Redis with TTL
    await this.redisService.set(
      this.getRefreshTokenKey(userId),
      refreshToken,
      expiresInSeconds
    );
    
    this.logger.log(`Stored refresh token in Redis for user: ${userId} with TTL: ${expiresInSeconds}s`);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      }) as JwtPayload;

      // Check if token exists in Redis
      const storedToken = await this.redisService.get(this.getRefreshTokenKey(payload.id));
      if (!storedToken || storedToken !== token) {
        this.logger.error('Refresh token not found in Redis or token mismatch');
        return null;
      }

      return payload;
    } catch (error) {
      this.logger.error('Failed to verify refresh token', error);
      return null;
    }
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    try {
      await this.redisService.del(this.getRefreshTokenKey(userId));
      this.logger.log(`Successfully revoked refresh token for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to revoke refresh token for user: ${userId}`, error);
      throw error;
    }
  }

  async cleanupExpiredRefreshTokens(): Promise<void> {
    // Redis automatically handles TTL, so no manual cleanup needed
    this.logger.log('Redis automatically handles refresh token expiration');
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new this.userModel({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const savedUser = await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken({
      id: savedUser._id.toString(),
      email: savedUser.email,
    });

    const refreshToken = this.generateRefreshToken({
      id: savedUser._id.toString(),
      email: savedUser.email,
    });

    // Store refresh token in Redis
    await this.storeRefreshToken(savedUser._id.toString(), refreshToken);

    this.logger.log(`User registered successfully: ${email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: savedUser._id.toString(),
        email: savedUser.email,
        username: savedUser.username,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
      },
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });

    const refreshToken = this.generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    // Store refresh token in Redis
    await this.storeRefreshToken(user._id.toString(), refreshToken);

    this.logger.log(`User logged in successfully: ${email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    // Verify the refresh token
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken({
      id: payload.id,
      email: payload.email,
    });

    const newRefreshToken = this.generateRefreshToken({
      id: payload.id,
      email: payload.email,
    });

    // Store the new refresh token in Redis
    await this.storeRefreshToken(payload.id, newRefreshToken);

    // Get user info for the response
    const user = await this.userModel.findById(payload.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.revokeRefreshToken(userId);
    this.logger.log(`User logged out: ${userId}`);
  }

  async getProfile(userId: string): Promise<{
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
