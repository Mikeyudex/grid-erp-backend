import { Test, TestingModule } from '@nestjs/testing';
import { PreciosTapeteMaterialService } from './precios-tapete-material.service';

describe('PreciosTapeteMaterialService', () => {
  let service: PreciosTapeteMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreciosTapeteMaterialService],
    }).compile();

    service = module.get<PreciosTapeteMaterialService>(PreciosTapeteMaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
