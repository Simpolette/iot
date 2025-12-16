// src/modules/in4_arduino/in4_arduino.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { in4_arduino, in4_arduinoDocument } from './schema/in4_arduino.schema';
import { CreateIn4ArduinoDto } from './dto/create-in4_arduino.dto';
import { UpdateIn4ArduinoDto } from './dto/update-in4_arduino.dto';

@Injectable()
export class In4ArduinoService {
  constructor(
    @InjectModel(in4_arduino.name)
    private readonly in4ArduinoModel: Model<in4_arduinoDocument>,
  ) { }

  async create(createIn4ArduinoDto: CreateIn4ArduinoDto) {
    return await this.in4ArduinoModel.create(createIn4ArduinoDto);
  }

  async findAll() {
    return await this.in4ArduinoModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    return await this.in4ArduinoModel.findById(id).exec();
  }

  async update(id: string, updateIn4ArduinoDto: UpdateIn4ArduinoDto) {
    return await this.in4ArduinoModel.findByIdAndUpdate(id, updateIn4ArduinoDto, {
      new: true,
    }).exec();
  }

  async save(dto: { temperature: number; humidity: number; light: number; rainSensor: boolean; rackStatus: string; email?: string }) {
    return await this.in4ArduinoModel.create(dto);
  }

  async findLatest(limit: number = 100000, email?: string) {
    const query: any = {};
    if (email) {
      query.email = email;
    }
    return await this.in4ArduinoModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }



  async remove(id: string) {
    return await this.in4ArduinoModel.findByIdAndDelete(id).exec();
  }
}
