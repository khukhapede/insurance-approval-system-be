import { NestFactory, Reflector } from '@nestjs/core'; // ✅ Add Reflector import
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common'; // ✅ Add ClassSerializerInterceptor
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors();

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://insurance-approval-fe.vercel.app',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
