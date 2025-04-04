import { Test, TestingModule } from '@nestjs/testing';
import { PreciosTapeteMaterialController } from './precios-tapete-material.controller';

describe('PreciosTapeteMaterialController', () => {
  let controller: PreciosTapeteMaterialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreciosTapeteMaterialController],
    }).compile();

    controller = module.get<PreciosTapeteMaterialController>(PreciosTapeteMaterialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
