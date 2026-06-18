import { Test, TestingModule } from '@nestjs/testing';
import { BuylistService } from './buylist.service';

describe('BuylistService', () => {
  let service: BuylistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuylistService],
    }).compile();

    service = module.get<BuylistService>(BuylistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
