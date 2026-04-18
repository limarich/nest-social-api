import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors(); // TODO: Configure CORS properly if needed

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
