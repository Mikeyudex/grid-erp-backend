import { Test, TestingModule } from '@nestjs/testing';
import { CategoryMappingController } from './category-mapping.controller';

describe('CategoryMappingController', () => {
  let controller: CategoryMappingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryMappingController],
    }).compile();

    controller = module.get<CategoryMappingController>(CategoryMappingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
