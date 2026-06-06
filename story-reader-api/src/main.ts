import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import fastifyCors from '@fastify/cors';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3000;

  const isProduction = config.get<string>('nodeEnv') === 'production';
  const frontendUrl = config.get<string>('frontendUrl') ?? 'http://localhost:4444';

  await app.register(fastifyCors, {
    origin: isProduction ? [frontendUrl] : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Story Reader API')
    .setDescription('Backend API cho ứng dụng đọc truyện chữ online')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 Server running at http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs\n`);
}

bootstrap();
