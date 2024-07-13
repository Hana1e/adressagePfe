import { Test, TestingModule } from '@nestjs/testing';
import { EnquetePolygoneController } from './enquete-polygone.controller';

describe('EnquetePolygoneController', () => {
  let controller: EnquetePolygoneController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnquetePolygoneController],
    }).compile();

    controller = module.get<EnquetePolygoneController>(EnquetePolygoneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
