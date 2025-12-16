import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherService } from './weather.service';

@Module({
  imports: [HttpModule],      // Use HttpModule internally
  providers: [WeatherService], 
  exports: [WeatherService],  // Export so In4Arduino can use it
})
export class WeatherModule {}