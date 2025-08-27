import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppResolver } from './app.resolver';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { loggerConfig } from './config/logger.config';
import { DatabaseModule } from './database/database.module';
import { RedisService } from './services/redis.service';
import { SecurityService } from './services/security.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    // Add rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute (general)
          },
          {
            ttl: 300000, // 5 minutes
            limit: 1000, // 1000 requests per 5 minutes
          },
        ],
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        playground: configService.get('security.enablePlayground'),
        introspection: configService.get('security.enableIntrospection'),
        autoSchemaFile: true,
        cors: {
          origin: configService.get('security.allowedOrigins'),
          credentials: true,
          maxAge: 86400, // Cache preflight for 24 hours
        },
        // Add security headers
        context: ({ req }) => ({ req }),
        formatError: (error) => {
          // Don't expose internal errors in production
          if (process.env.NODE_ENV === 'production') {
            return {
              message: 'Internal server error',
              extensions: { code: 'INTERNAL_SERVER_ERROR' },
            };
          }
          return error;
        },
      }),
    }),
    DatabaseModule,
    loggerConfig,
    AuthModule,
    UsersModule,
  ],
  providers: [
    AppResolver, 
    RedisService,
    SecurityService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [RedisService, SecurityService],
})
export class AppModule {}
