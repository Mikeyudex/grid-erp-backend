import { Test, TestingModule } from '@nestjs/testing';
import { RoleUserController } from './role-user.controller';

describe('RoleUserController', () => {
  let controller: RoleUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleUserController],
    }).compile();

    controller = module.get<RoleUserController>(RoleUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
