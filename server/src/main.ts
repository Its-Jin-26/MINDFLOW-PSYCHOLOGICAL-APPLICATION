import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'], credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
