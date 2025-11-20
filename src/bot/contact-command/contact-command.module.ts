import { Module } from '@nestjs/common';
import { ContactModule } from '../../contact/contact.module';
import { UserModule } from '../../user/user.module';
import { ContactCommandUpdate } from './contact-command.update';

@Module({
  imports: [ContactModule, UserModule],
  providers: [ContactCommandUpdate],
})
export class ContactCommandModule {}
