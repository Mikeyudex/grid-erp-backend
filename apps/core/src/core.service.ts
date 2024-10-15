import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CoreService {
  private readonly logger = new Logger(CoreService.name);
  constructor() { }
}
