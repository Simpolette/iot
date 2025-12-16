import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly pythonApiUrl = 'http://127.0.0.1:8000/predict';

  constructor(private readonly httpService: HttpService) {}

  async predictRain(temperature: number, humidity: number): Promise<boolean> {
    try {
      // Send data to your Python API
      const response = await lastValueFrom(
        this.httpService.post(this.pythonApiUrl, { temperature, humidity })
      );

      // Check result (assuming Python returns { "prediction": "Rain" })
      const isRain = response.data.prediction === 'Rain';
      
      if (isRain) {
        this.logger.warn(`☔ AI Alert: Rain predicted! (Temp: ${temperature}, Hum: ${humidity})`);
      }
      
      return isRain;
    } catch (error) {
      // Fail silently (log error) so we don't crash the MQTT loop
      this.logger.error(`AI Service Offline: ${error.message}`);
      return false; 
    }
  }
}