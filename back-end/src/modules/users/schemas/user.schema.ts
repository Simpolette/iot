
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  chat_id: number;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: 'Local' })
  accountType: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ required: false })
  codeID?: string;

  @Prop({ required: false })
  codeExpire?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
