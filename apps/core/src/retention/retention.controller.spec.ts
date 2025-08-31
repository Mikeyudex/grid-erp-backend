import { Test, TestingModule } from '@nestjs/testing';
import { RetentionController } from './retention.controller';

describe('RetentionController', () => {
  let controller: RetentionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetentionController],
    }).compile();

    controller = module.get<RetentionController>(RetentionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
