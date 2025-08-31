import { Module } from '@nestjs/common';
import { RetentionService } from './retention.service';
import { RetentionController } from './retention.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Retention, RetentionSchema } from './retention.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Retention.name, schema: RetentionSchema}])
  ],
  providers: [RetentionService],
  controllers: [RetentionController]
})
export class RetentionModule {}
