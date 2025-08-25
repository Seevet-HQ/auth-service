import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../users/user.model';
import { AuthResolver } from './graphql/auth.resolver';
import { AuthService } from './services/auth.service';
import { CustomJwtService } from './services/jwt.service';
import { RedisService } from '../services/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessExpiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, CustomJwtService, RedisService, AuthResolver],
  exports: [AuthService, CustomJwtService],
})
export class AuthModule {}
