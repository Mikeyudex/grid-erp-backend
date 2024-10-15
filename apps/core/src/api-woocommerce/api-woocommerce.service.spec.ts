import { Test, TestingModule } from '@nestjs/testing';
import { ApiWoocommerceService } from './api-woocommerce.service';

describe('ApiWoocommerceService', () => {
  let service: ApiWoocommerceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiWoocommerceService],
    }).compile();

    service = module.get<ApiWoocommerceService>(ApiWoocommerceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
