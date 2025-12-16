// Service quản lý active user email
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { in4_arduino } from '../modules/in4_arduino/schema/in4_arduino.schema';

@Injectable()
export class ActiveUserService {
  private activeUserEmail: string = 'group09nmcntt@gmail.com'; // Default

  constructor(
    @InjectModel(in4_arduino.name)
    private readonly in4ArduinoModel: Model<in4_arduino>,
  ) {}

  /**
   * Set active user email và tự động migrate data
   */
  async setActiveUserEmail(email: string): Promise<void> {
    console.log(`🔄 Switching active user from ${this.activeUserEmail} to ${email}`);
    
    // Nếu email mới khác email hiện tại
    if (this.activeUserEmail !== email) {
      const oldEmail = this.activeUserEmail;
      this.activeUserEmail = email;

      // Tự động migrate data từ default email sang email mới
      await this.migrateDefaultEmailData(email);
      
      console.log(`✅ Active user email updated to: ${email}`);
    }
  }

  /**
   * Get active user email
   */
  getActiveUserEmail(): string {
    return this.activeUserEmail;
  }

  /**
   * Migrate dữ liệu từ default/old email sang email mới
   */
  async migrateDefaultEmailData(newEmail: string): Promise<number> {
    try {
      // Kiểm tra xem user mới đã có dữ liệu chưa
      const existingDataCount = await this.in4ArduinoModel.countDocuments({ email: newEmail });
      
      if (existingDataCount > 0) {
        console.log(`✅ User ${newEmail} đã có ${existingDataCount} records, không cần migrate`);
        return 0;
      }

      // Tìm tất cả records với default email
      const defaultEmails = ['default@example.com', 'example@gmail.com'];
      const defaultDataCount = await this.in4ArduinoModel.countDocuments({ 
        email: { $in: defaultEmails } 
      });

      if (defaultDataCount === 0) {
        console.log('⚠️ Không có dữ liệu default để migrate');
        return 0;
      }

      console.log(`📊 Tìm thấy ${defaultDataCount} records với email mặc định`);
      console.log(`🔄 Đang migrate sang email: ${newEmail}...`);

      // Update tất cả records
      const result = await this.in4ArduinoModel.updateMany(
        { email: { $in: defaultEmails } },
        { $set: { email: newEmail } }
      );

      console.log(`✅ Đã migrate ${result.modifiedCount} records sang ${newEmail}`);
      return result.modifiedCount;

    } catch (error) {
      console.error('❌ Lỗi khi migrate data:', error);
      return 0;
    }
  }

  /**
   * Migrate data theo yêu cầu thủ công
   */
  async manualMigrate(fromEmail: string, toEmail: string): Promise<number> {
    try {
      const count = await this.in4ArduinoModel.countDocuments({ email: fromEmail });
      
      if (count === 0) {
        console.log(`⚠️ Không tìm thấy dữ liệu với email: ${fromEmail}`);
        return 0;
      }

      console.log(`🔄 Migrating ${count} records từ ${fromEmail} → ${toEmail}`);

      const result = await this.in4ArduinoModel.updateMany(
        { email: fromEmail },
        { $set: { email: toEmail } }
      );

      console.log(`✅ Đã migrate ${result.modifiedCount} records`);
      return result.modifiedCount;

    } catch (error) {
      console.error('❌ Lỗi khi migrate:', error);
      return 0;
    }
  }

  /**
   * Lấy thống kê email trong database
   */
  async getEmailStats(): Promise<any[]> {
    const stats = await this.in4ArduinoModel.aggregate([
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          latestRecord: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return stats;
  }
}
