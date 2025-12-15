import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query() query: string,
    @Query('current') current: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.usersService.findAll(query, current, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':email')
  async findin4Email(@Param('email') email: string) {
    const user = await this.usersService.findin4Email(email);
  return user;
  }

  // Endpoint mới cho giàn phơi thông minh
  @Post('alert')
  async sendDryingRackAlert(@Body() body: {
    email: string;
    sensorData: {
      temperature: number;
      humidity: number;
      light: number;
      rainSensor: boolean;
      rackStatus: string;
      rackPosition: number;
    };
    thresholds: {
      autoCloseTemperature: number;
      autoCloseHumidity: number;
      minLightLevel: number;
      autoCloseOnRain: boolean;
    };
  }) {
    const { email, sensorData, thresholds } = body;
    return this.usersService.sendDryingRackAlert(email, sensorData, thresholds);
  }

  // Endpoint cũ - deprecated
  @Post('fired')
  async sendFireAlertEmail(@Body() body: any) {
    console.warn('POST /users/fired is deprecated. Use POST /users/alert instead.');
    return { success: false, message: 'This endpoint is deprecated' };
  }

  @Put('update')
  async updateUser(@Body() body: UpdateUserDto) {
    console.log('[PUT /users/update] Dữ liệu nhận từ frontend:', body);
    return this.usersService.update(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
