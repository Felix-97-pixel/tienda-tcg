import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('TapTrade API')
    .setDescription('Documentación de la API de e-commerce TapTrade')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Apply Prisma Exception Filter globally
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.use(cookieParser());

  const allowedOrigins = [
    'http://localhost:3000',
    'https://taptrade.cl',
    'https://www.taptrade.cl',
  ];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  const port = process.env.PORT || 3001;
  await app.listen(port);
}
bootstrap();
