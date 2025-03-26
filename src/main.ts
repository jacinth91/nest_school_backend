import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with all origins allowed
  app.enableCors({
    origin: ['http://localhost:3000','https://school-mgt-rho.vercel.app','https://school-mgt-n177.vercel.app','https://fe-obfs-gaudium-l6hd.vercel.app'], // Allow all origins using array
    methods: ['GET', 'HEAD', 'PUT','POST', 'DELETE','OPTIONS','PATCH'],
    credentials: true,
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Add cookie-parser middleware
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('School Management API')
    .setDescription('API documentation for the School Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3002);
  console.log(`Server is running on port ${process.env.PORT ?? 3002}`);
}
bootstrap();
