import { Module } from '@nestjs/common';
import { PortfolioModule } from '../../portfolio/portfolio.module';
import { UserModule } from '../../user/user.module';
import { PortfolioCommandUpdate } from './portfolio-command.update';

@Module({
  imports: [PortfolioModule, UserModule],
  providers: [PortfolioCommandUpdate],
})
export class PortfolioCommandModule {}
