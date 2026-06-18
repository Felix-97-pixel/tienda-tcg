import { Test, TestingModule } from '@nestjs/testing';
import { BuylistController } from './buylist.controller';

describe('BuylistController', () => {
  let controller: BuylistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuylistController],
    }).compile();

    controller = module.get<BuylistController>(BuylistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
