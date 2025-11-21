import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotCommandsService } from './bot-commands.service';
import { CalculateCommandModule } from './calculate-command/calculate-command.module';
import { CommentCommandModule } from './comment-command/comment-command.module';
import { ContactCommandModule } from './contact-command/contact-command.module';
import { PingCommandModule } from './ping-command/ping-command.module';
import { PortfolioCommandModule } from './portfolio-command/portfolio-command.module';
import { StartCommandModule } from './start-command/start-command.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN') || '',
      }),
    }),
    StartCommandModule,
    CommentCommandModule,
    ContactCommandModule,
    PortfolioCommandModule,
    PingCommandModule,
    CalculateCommandModule,
  ],
  providers: [BotCommandsService],
})
export class BotModule {}
