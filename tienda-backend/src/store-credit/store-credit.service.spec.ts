import { Test, TestingModule } from '@nestjs/testing';
import { StoreCreditService } from './store-credit.service';

describe('StoreCreditService', () => {
  let service: StoreCreditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreCreditService],
    }).compile();

    service = module.get<StoreCreditService>(StoreCreditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
