import { Test, TestingModule } from '@nestjs/testing';
import { TypeOfPieceController } from './type-of-piece.controller';

describe('TypeOfPieceController', () => {
  let controller: TypeOfPieceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeOfPieceController],
    }).compile();

    controller = module.get<TypeOfPieceController>(TypeOfPieceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
