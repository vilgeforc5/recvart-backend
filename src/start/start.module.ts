import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Start } from './start.entity';
import { StartService } from './start.service';

@Module({
  imports: [SequelizeModule.forFeature([Start])],
  providers: [StartService],
  exports: [StartService],
})
export class StartModule {}
