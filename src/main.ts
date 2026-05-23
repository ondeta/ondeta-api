import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureSwagger(app);
  configureValidationPipe(app);
  await app.listen(process.env.PORT ?? 3000);
}

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('OndeTá API')
    .setDescription('API para o aplicativo OndeTá')
    .setVersion('1.0')
    .addBasicAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
}

function configureValidationPipe(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

bootstrap();
