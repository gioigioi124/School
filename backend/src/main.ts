import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix to /api
  app.setGlobalPrefix('api');

  // Setup global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Setup global response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Setup global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS
  app.enableCors();

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('LMS API')
    .setDescription('LMS Application API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Actually SwaggerModule needs to be awaited in v11 sometimes, or just createDocument is synchronous.
  // We use SwaggerModule.createDocument
  SwaggerModule.setup('api/docs', app, document);

  // Ensure port 3001 is used for backend
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
