import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contact } from './contact.entity';
import { ContactService } from './contact.service';

@Module({
  imports: [SequelizeModule.forFeature([Contact])],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
