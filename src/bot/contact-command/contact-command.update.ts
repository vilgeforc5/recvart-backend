import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ContactService } from '../../contact/contact.service';
import { UserService } from '../../user/user.service';

interface Button {
  text: string;
  url: string;
}

@Update()
export class ContactCommandUpdate {
  constructor(
    private readonly contactService: ContactService,
    private readonly userService: UserService,
  ) {}

  @Command('contacts')
  async showContacts(@Ctx() ctx: Context) {
    const chatId = ctx.from?.id;
    if (chatId) {
      await this.userService.updateLastMessage(chatId);
    }

    const contactData = await this.contactService.getContact();
    if (!contactData) {
      await ctx.reply('Конфигурация не найдена');
      return;
    }

    await ctx.reply(contactData.address);

    const buttons = JSON.parse(contactData.buttons || '[]') as Button[];
    const keyboard = this.buildKeyboard(buttons);

    await ctx.reply(contactData.managerText, {
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private buildKeyboard(buttons: Button[]) {
    if (buttons.length === 0) return [];

    const keyboard: Array<Array<{ text: string; url: string }>> = [];

    for (const button of buttons) {
      keyboard.push([{ text: button.text, url: button.url }]);
    }

    return keyboard;
  }
}
