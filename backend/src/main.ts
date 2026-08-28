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
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: frontendUrl
      ? [frontendUrl, /\.vercel\.app$/, 'http://localhost:3000']
      : true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('LMS API')
    .setDescription('LMS Application API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Ensure port is used for backend (Render assigns process.env.PORT)
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 LMS Backend running on port ${port}`);
}
bootstrap();
