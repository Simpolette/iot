import { PartialType } from '@nestjs/mapped-types';
import { CreateIn4ArduinoDto } from './create-in4_arduino.dto';

export class UpdateIn4ArduinoDto extends PartialType(CreateIn4ArduinoDto) {}
