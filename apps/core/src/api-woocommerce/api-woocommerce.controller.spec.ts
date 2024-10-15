import { Test, TestingModule } from '@nestjs/testing';
import { ApiWoocommerceController } from './api-woocommerce.controller';

describe('ApiWoocommerceController', () => {
  let controller: ApiWoocommerceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiWoocommerceController],
    }).compile();

    controller = module.get<ApiWoocommerceController>(ApiWoocommerceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
