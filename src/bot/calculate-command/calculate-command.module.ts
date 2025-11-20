import { Module } from '@nestjs/common';
import { CalculateModule } from '../../calculate/calculate.module';
import { UserModule } from '../../user/user.module';
import { CalculateCommandUpdate } from './calculate-command.update';

@Module({
  imports: [CalculateModule, UserModule],
  providers: [CalculateCommandUpdate],
})
export class CalculateCommandModule {}
