import { Module } from '@nestjs/common';
import { In4ArduinoService } from './in4_arduino.service';
import { In4ArduinoController } from './in4_arduino.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { in4_arduino, in4_arduinoSchema } from './schema/in4_arduino.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: in4_arduino.name, schema: in4_arduinoSchema }])],
  controllers: [In4ArduinoController],
  providers: [In4ArduinoService],
  exports: [In4ArduinoService],
})
export class In4ArduinoModule {}
