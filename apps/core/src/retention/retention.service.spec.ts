import { Test, TestingModule } from '@nestjs/testing';
import { RetentionService } from './retention.service';

describe('RetentionService', () => {
  let service: RetentionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetentionService],
    }).compile();

    service = module.get<RetentionService>(RetentionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
