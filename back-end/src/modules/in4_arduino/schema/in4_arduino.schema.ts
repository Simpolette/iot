
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type in4_arduinoDocument = HydratedDocument<in4_arduino>;

@Schema({ timestamps: true })
export class in4_arduino {
    @Prop({ required: true })
    temperature: number; // Nhiệt độ (°C)

    @Prop({ required: true })
    humidity: number; // Độ ẩm (%)

    @Prop({ required: true })
    light: number; // Ánh sáng (lux)

    @Prop({ required: true })
    rainSensor: boolean; // Cảm biến mưa (true: có mưa, false: không mưa)

    @Prop({ required: true })
    rackStatus: string; // Trạng thái giàn phơi ('open', 'close')

    @Prop({ default: 'example@gmail.com' })
    email: string;
}

export const in4_arduinoSchema = SchemaFactory.createForClass(in4_arduino);
