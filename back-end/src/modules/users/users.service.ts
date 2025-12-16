import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPassword } from 'src/helper/util';
import { isEmail } from 'class-validator';
import aqp from 'api-query-params';
import { skip } from 'node:test';
import mongoose from 'mongoose';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { PushsaferService } from '../pushsafer/pushsafer.service';
// import { TelegramService } from 'src/telegram/telegram.service'; // Vô hiệu hóa telegram

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService,
    private readonly pushsaferService: PushsaferService,
    // private telegramService: TelegramService, // Vô hiệu hóa telegram
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    return user ? true : false;
  };

  async create(createUserDto: CreateUserDto) {
    const { name, email, username, password } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await this.userModel.create({
      name,
      email,
      username,
      password: hashedPassword,
    });
    return {
      _id: newUser._id,
    };
  }

  async findAll(query: string, current: number = 1, pageSize: number = 10) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip((current - 1) * pageSize)
      .select('-password')
      .sort(sort as any); // need to know what type/command can be used
    return { results, totalItems, totalPages, current, pageSize };
  }

  findOne(id: string) {
    if (mongoose.isValidObjectId(id)) {
      return this.userModel.findById(id).select('-password');
    } else if (isEmail(id)) {
      return this.userModel.findOne({ email: id }).select('-password');
    } else {
      throw new BadRequestException('Invalid user ID or email');
    }
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findByCodeID(codeID: string) {
    return await this.userModel.findOne({ codeID });
  }

  async findin4Email(email: string) {
    if (isEmail(email)) {
      return await this.userModel.findOne({ email }).select('-password');
    } else {
      throw new BadRequestException('Invalid email format');
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        $set: {
          name: updateUserDto.name,
          email: updateUserDto.email,
          age: updateUserDto.age,
        },
      },
    );
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return await this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('Invalid user ID');
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, password, email } = registerDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await hashPassword(password);
    // Tạo mã OTP đơn giản 6 số (không hash)
    const activationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const User = await this.userModel.create({
      name,
      password: hashedPassword,
      email,
      isActive: false,
      codeID: activationCode, // Lưu mã OTP trực tiếp (không hash)
      codeExpire: dayjs().add(5, 'minutes').toDate(),
    });
    try {
      await this.mailerService.sendMail({
        to: User.email, // list of receivers
        subject: 'Activate your SmartDry account', // Subject line
        template: 'register',
        context: {
          name: User?.name ?? User.email,
          activationCode: activationCode, // Gửi mã OTP đơn giản trong email
        },
      });
    } catch (err) {
      console.error('Error sending email', err);
    }
    return {
      _id: User._id,
      email: User.email,
    };
  }

  // Gửi email cảnh báo cho giàn phơi thông minh
  async sendDryingRackAlert(
    email: string,
    sensorData: {
      temperature: number;
      humidity: number;
      light: number;
      rainSensor: boolean;
      rackStatus: string;
      rackPosition: number;
    },
    thresholds: {
      autoCloseTemperature: number;
      autoCloseHumidity: number;
      minLightLevel: number;
      autoCloseOnRain: boolean;
    },
  ) {
    try {
      const rainAlert = sensorData.rainSensor && thresholds.autoCloseOnRain;
      const tempAlert =
        sensorData.temperature > thresholds.autoCloseTemperature;
      const humidAlert = sensorData.humidity > thresholds.autoCloseHumidity;
      const lightAlert = sensorData.light < thresholds.minLightLevel;

      await this.mailerService.sendMail({
        to: email,
        subject: '🌧️ SmartDry - Cảnh báo Giàn Phơi',
        template: 'alert',
        context: {
          email,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          light: sensorData.light,
          rainSensor: sensorData.rainSensor,
          rackPosition: sensorData.rackPosition,
          rackOpen: sensorData.rackStatus === 'open',
          rackClosed: sensorData.rackStatus === 'closed',
          rackOpening: sensorData.rackStatus === 'opening',
          rackClosing: sensorData.rackStatus === 'closing',
          thresholds,
          rainAlert,
          tempAlert,
          humidAlert,
          lightAlert,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Lỗi gửi email cảnh báo giàn phơi:', error);
      throw error;
    }
  }

  // Phương thức cũ - giữ lại để tương thích ngược (có thể xóa sau)
  async sendFireAlertEmail(
    email: string,
    sensorData: {
      mq2: number;
      mq7: number;
      mq135: number;
      temperature: number;
      flame: number;
    },
    thresholds: {
      MQ2: number;
      MQ7: number;
      MQ135: number;
      temp: number;
    },
  ) {
    console.warn(
      'sendFireAlertEmail is deprecated. Use sendDryingRackAlert instead.',
    );
    return { success: false, message: 'Method deprecated' };
  }

  async notifyUser(email: string, content: string) {
    // Gửi email thay vì Telegram (vì đã vô hiệu hóa Telegram)
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        console.warn('User not found for email:', email);
        return;
      }

      // Gửi email notification
      await this.mailerService.sendMail({
        to: email,
        subject: '📬 SmartDry - Thông báo hệ thống',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3498db; color: white; padding: 20px; text-align: center;">
              <h2>🌧️ SmartDry Notification</h2>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <pre style="white-space: pre-wrap; font-family: monospace; background: white; padding: 15px; border-radius: 5px;">${content}</pre>
            </div>
            <div style="padding: 15px; text-align: center; font-size: 12px; color: #999;">
              SmartDry © 2025
            </div>
          </div>
        `,
      });

      console.log('✅ Email notification sent to:', email);

      // Kiểm tra nếu có cảnh báo mưa thì gửi Pushsafer
      if (content.includes('🌧️') && content.includes('Phát hiện mưa')) {
        await this.pushsaferService.sendRainAlert();
        console.log('✅ Pushsafer rain alert sent');
      }
    } catch (error) {
      console.error('❌ Error sending notification email:', error);
    }
  }
}
