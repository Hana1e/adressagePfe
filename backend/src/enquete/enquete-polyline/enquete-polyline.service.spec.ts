import { Test, TestingModule } from '@nestjs/testing';
import { EnquetePolylineService } from './enquete-polyline.service';

describe('EnquetePolylineService', () => {
  let service: EnquetePolylineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnquetePolylineService],
    }).compile();

    service = module.get<EnquetePolylineService>(EnquetePolylineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
