import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { AccessToken } from '../decorators/access-token.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { LoginInput } from './inputs/login.input';
import { RefreshTokenInput } from './inputs/refresh-token.input';
import { RegisterInput } from './inputs/register.input';
import { AuthResponseObject } from './objects/auth-response.object';
import { LogoutResponseObject } from './objects/logout-response.object';
import { UserObject } from './objects/user.object';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponseObject)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 registration attempts per 5 minutes
  async register(
    @Args('input') input: RegisterInput,
  ): Promise<AuthResponseObject> {
    const authResponse = await this.authService.register(input);
    // Transform the response to match UserObject structure
    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: {
        id: authResponse.user.id,
        email: authResponse.user.email,
        username: authResponse.user.username,
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        role: authResponse.user.role,
        isEmailVerified: false, // Default value for new users
        isActive: true, // Default value for new users
        createdAt: new Date(), // Current time for new users
        updatedAt: new Date(), // Current time for new users
      },
    };
  }

  @Mutation(() => AuthResponseObject)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  async login(@Args('input') input: LoginInput): Promise<AuthResponseObject> {
    const authResponse = await this.authService.login(
      input.email,
      input.password,
    );
    // Get full user profile to include missing fields
    const userProfile = await this.authService.getProfile(authResponse.user.id);
    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: userProfile,
    };
  }

  @Mutation(() => AuthResponseObject)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 refresh attempts per minute
  async refreshTokens(
    @Args('input') input: RefreshTokenInput,
  ): Promise<AuthResponseObject> {
    const authResponse = await this.authService.refreshTokens(
      input.refreshToken,
    );
    // Get full user profile to include missing fields
    const userProfile = await this.authService.getProfile(authResponse.user.id);
    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: userProfile,
    };
  }

  @Mutation(() => LogoutResponseObject)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 logout attempts per minute
  async logout(@CurrentUser() user: any, @AccessToken() accessToken: string): Promise<LogoutResponseObject> {
    await this.authService.logout(user.id, accessToken);
    return { message: 'Logged out successfully' };
  }

  @Query(() => UserObject)
  @UseGuards(JwtAuthGuard)
  async profile(@CurrentUser() user: any): Promise<UserObject> {
    return this.authService.getProfile(user.id);
  }
}
