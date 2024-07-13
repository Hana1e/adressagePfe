import { Test, TestingModule } from '@nestjs/testing';
import { EnquetePolygoneService } from './enquete-polygone.service';

describe('EnquetePolygoneService', () => {
  let service: EnquetePolygoneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnquetePolygoneService],
    }).compile();

    service = module.get<EnquetePolygoneService>(EnquetePolygoneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
