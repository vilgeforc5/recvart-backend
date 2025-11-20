import { Module } from '@nestjs/common';
import { CalculateModule } from '../../calculate/calculate.module';
import { CommentModule } from '../../comment/comment.module';
import { ContactModule } from '../../contact/contact.module';
import { PortfolioModule } from '../../portfolio/portfolio.module';
import { StartModule } from '../../start/start.module';
import { UserModule } from '../../user/user.module';
import { StartCommandUpdate } from './start-command.update';

@Module({
  imports: [
    StartModule,
    CommentModule,
    PortfolioModule,
    ContactModule,
    UserModule,
    CalculateModule,
  ],
  providers: [StartCommandUpdate],
})
export class StartCommandModule {}
