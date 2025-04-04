import { Test, TestingModule } from '@nestjs/testing';
import { TypeOfPieceService } from './type-of-piece.service';

describe('TypeOfPieceService', () => {
  let service: TypeOfPieceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeOfPieceService],
    }).compile();

    service = module.get<TypeOfPieceService>(TypeOfPieceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
