import { Test, TestingModule } from '@nestjs/testing';
import { StoreCreditController } from './store-credit.controller';

describe('StoreCreditController', () => {
  let controller: StoreCreditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreCreditController],
    }).compile();

    controller = module.get<StoreCreditController>(StoreCreditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
