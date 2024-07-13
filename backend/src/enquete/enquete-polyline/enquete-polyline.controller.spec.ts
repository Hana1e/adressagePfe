import { Test, TestingModule } from '@nestjs/testing';
import { EnquetePolylineController } from './enquete-polyline.controller';

describe('EnquetePolylineController', () => {
  let controller: EnquetePolylineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnquetePolylineController],
    }).compile();

    controller = module.get<EnquetePolylineController>(EnquetePolylineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
