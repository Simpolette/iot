import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
// import { bot } from './telegram/telegram.bot'; // Vô hiệu hóa telegram
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const PORT = configService.get('PORT'); // Default port if use local
  
  // Kết nối MQTT Microservice để subscribe topics từ ESP32
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: configService.get<string>('MQTT_URL'),
      username: configService.get<string>('MQTT_USERNAME'),
      password: configService.get<string>('MQTT_PASSWORD'),
      // Subscribe các topics mà ESP32 sẽ publish
      subscribeOptions: {
        qos: 1
      },
    },
  });

  app.setGlobalPrefix('api', { exclude: [''] });

  // Enable CORS cho local development
  app.enableCors({
    origin: ['http://localhost:5500', 'http://localhost:5501'], // Support cả 2 ports
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.startAllMicroservices().then(() => {
    console.log('✅ MQTT microservice is running');
    console.log('📡 Subscribed to topics: smartdry/data');
    console.log('📤 Publishing to topics: smartdry/config, smartdry/control');
  });
  
  await app.listen(process.env.PORT ?? 8080);
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  
  // await bot.start(); // Vô hiệu hóa telegram bot
  // console.log("✅ Telegram bot started");
}
bootstrap();
