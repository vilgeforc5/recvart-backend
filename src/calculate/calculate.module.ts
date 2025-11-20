import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Calculate } from './calculate.entity';
import { CalculateService } from './calculate.service';

@Module({
  imports: [SequelizeModule.forFeature([Calculate])],
  providers: [CalculateService],
  exports: [CalculateService],
})
export class CalculateModule {}
