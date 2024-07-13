import { Module } from '@nestjs/common';
import { ModeEnqueteController } from './mode-enquete.controller';

@Module({
  controllers: [ModeEnqueteController]
})
export class ModeEnqueteModule {}
