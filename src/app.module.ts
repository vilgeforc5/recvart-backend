import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { CalculateModule } from './calculate/calculate.module';
import { CommentModule } from './comment/comment.module';
import { ContactModule } from './contact/contact.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { StartModule } from './start/start.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: 'database.sqlite',
      autoLoadModels: true,
      synchronize: true,
    }),
    BotModule,
    StartModule,
    CommentModule,
    ContactModule,
    PortfolioModule,
    CalculateModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
