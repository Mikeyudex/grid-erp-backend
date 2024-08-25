import { Module } from '@nestjs/common';
import { OracleCloudService } from './oracle-cloud.service';

@Module({
  providers: [OracleCloudService],
  exports: [OracleCloudService],
})
export class OracleCloudModule {}
