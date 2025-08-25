import {
    ConflictException,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/user.model';
import { RegisterDto } from '../dto/register.dto';
import { CustomJwtService } from './jwt.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: CustomJwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  }> {
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
    const accessToken = this.jwtService.generateAccessToken({
      id: savedUser._id.toString(),
      email: savedUser.email,
    });

    const refreshToken = await this.jwtService.generateRefreshToken({
      id: savedUser._id.toString(),
      email: savedUser.email,
    });

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
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  }> {
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
    const accessToken = this.jwtService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });

    const refreshToken = await this.jwtService.generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

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

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  }> {
    const tokens = await this.jwtService.refreshTokens(refreshToken);
    if (!tokens) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user info for the response
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel.findById(payload.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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
    await this.jwtService.revokeRefreshToken(userId);
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
