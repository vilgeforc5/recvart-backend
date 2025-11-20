import { Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { PingCommandUpdate } from './ping-command.update';

@Module({
  imports: [UserModule],
  providers: [PingCommandUpdate],
})
export class PingCommandModule {}
