import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AppResolver } from './app.resolver';
import { DatabaseModule } from './database/database.module';
import { loggerConfig } from './config/logger.config';
import configuration from './config/configuration';
import { HealthController } from './health/health.controller';
import { RedisService } from './services/redis.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
    }),
    DatabaseModule,
    loggerConfig,
    AuthModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [AppResolver, RedisService],
})
export class AppModule {}
