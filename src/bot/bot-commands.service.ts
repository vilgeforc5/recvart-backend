import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotCommandsService implements OnModuleInit {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async onModuleInit() {
    await this.setBotCommands();
  }

  private async setBotCommands() {
    await this.bot.telegram.setMyCommands([
      {
        command: 'calculate',
        description: 'Калькулятор стоимости',
      },
      {
        command: 'portfolio',
        description: 'Портфолио работ',
      },
      {
        command: 'otzivi',
        description: 'Отзывы клиентов',
      },
      {
        command: 'contacts',
        description: 'Контакты',
      },
    ]);
  }
}
