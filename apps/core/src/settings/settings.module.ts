import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsSchema } from './settings.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
  ],
  providers: [SettingsService],
  controllers: [SettingsController]
})
export class SettingsModule {}
