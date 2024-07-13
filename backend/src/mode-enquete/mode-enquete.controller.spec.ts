import { Test, TestingModule } from '@nestjs/testing';
import { ModeEnqueteController } from './mode-enquete.controller';

describe('ModeEnqueteController', () => {
  let controller: ModeEnqueteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModeEnqueteController],
    }).compile();

    controller = module.get<ModeEnqueteController>(ModeEnqueteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
