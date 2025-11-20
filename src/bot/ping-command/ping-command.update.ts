import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UserService } from '../../user/user.service';

@Update()
export class PingCommandUpdate {
  constructor(private readonly userService: UserService) {}

  @Command('ping')
  async ping(@Ctx() ctx: Context) {
    const chatId = ctx.from?.id;
    if (chatId) {
      await this.userService.updateLastMessage(chatId);
    }
    await ctx.reply('Все ОК');
  }
}
