import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { LoggerModule } from 'nestjs-pino';
import { EnvSchema } from 'src/common/schemas/type-orm.schema';
import { HashModule } from 'src/common/utils/hash/hash.module';
import databaseConfig from 'src/common/config/database.config';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PostModule } from 'src/post/post.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [
    // load .env file globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema: EnvSchema
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        ...config,
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty' }
          : undefined,
      },
    }),
    HashModule,
    UserModule,
    AuthModule,
    PostModule,
    CommentModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      }
    ])
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: false,
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
