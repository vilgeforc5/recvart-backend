import { Action, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { CalculateService } from '../../calculate/calculate.service';
import { Comment } from '../../comment/comment.entity';
import { CommentService } from '../../comment/comment.service';
import { ContactService } from '../../contact/contact.service';
import { Portfolio } from '../../portfolio/portfolio.entity';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { StartService } from '../../start/start.service';
import { UserService } from '../../user/user.service';

interface Button {
  text: string;
  callback_data: string;
}

interface CallbackContext extends Context {
  match?: RegExpMatchArray;
}

@Update()
export class StartCommandUpdate {
  constructor(
    private readonly startService: StartService,
    private readonly commentService: CommentService,
    private readonly portfolioService: PortfolioService,
    private readonly contactService: ContactService,
    private readonly userService: UserService,
    private readonly calculateService: CalculateService,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    const chatId = ctx.from?.id;
    if (chatId) {
      await this.userService.createOrUpdateUser(chatId, {
        username: ctx.from?.username,
        firstName: ctx.from?.first_name,
        lastName: ctx.from?.last_name,
      });
      await this.userService.updateLastMessage(chatId);
    }

    const startData = await this.startService.getStart();
    if (!startData) {
      await ctx.reply('Конфигурация не найдена');
      return;
    }

    const message = startData.content;

    const buttons = JSON.parse(startData.buttons || '[]') as Button[];
    const keyboard = this.buildKeyboard(buttons);

    const sentMessage = await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });

    await ctx.pinChatMessage(sentMessage.message_id);
  }

  @Action(/^(?!comment_|portfolio_|calc_)(.+)$/)
  async handleButtonClick(@Ctx() ctx: CallbackContext) {
    const match = ctx.match;
    if (!match || !match[1]) {
      await ctx.answerCbQuery('Ошибка');
      return;
    }

    const chatId = ctx.from?.id;
    if (chatId) {
      await this.userService.updateLastMessage(chatId);
    }

    const callbackData = match[1];

    await ctx.answerCbQuery();

    if (callbackData === 'otzivi') {
      await this.handleOtziviCommand(ctx);
    } else if (callbackData === 'portfolio') {
      await this.handlePortfolioCommand(ctx);
    } else if (callbackData === 'contacts') {
      await this.handleContactsCommand(ctx);
    } else if (callbackData === 'calculate') {
      await this.handleCalculateCommand(ctx);
    } else {
      await ctx.reply(`Команда "${callbackData}" не найдена.`);
    }
  }

  private async handleOtziviCommand(ctx: Context) {
    const comments = await this.commentService.getAllComments();

    if (comments.length === 0) {
      await ctx.reply('Пока нет отзывов.');
      return;
    }

    await this.sendComment(ctx, 0);
  }

  private async handlePortfolioCommand(ctx: Context) {
    const portfolios = await this.portfolioService.getAllPortfolios();

    if (portfolios.length === 0) {
      await ctx.reply('Пока нет портфолио.');
      return;
    }

    await this.sendPortfolio(ctx, 0);
  }

  private async handleContactsCommand(ctx: Context) {
    const contactData = await this.contactService.getContact();
    if (!contactData) {
      await ctx.reply('Конфигурация не найдена');
      return;
    }

    await ctx.reply(contactData.address);

    const buttons = JSON.parse(contactData.buttons || '[]') as Array<{
      text: string;
      url: string;
    }>;
    const keyboard = this.buildContactKeyboard(buttons);

    await ctx.reply(contactData.managerText, {
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handleCalculateCommand(ctx: Context) {
    const calculateConfig = await this.calculateService.getCalculate();
    if (!calculateConfig) {
      await ctx.reply('Конфигурация не найдена');
      return;
    }

    const step1Options = JSON.parse(
      calculateConfig.step1Options || '[]',
    ) as string[];

    const keyboard = step1Options.map((option: string, index: number) => [
      { text: option, callback_data: `calc_step1_${index}` },
    ]);

    await ctx.reply(calculateConfig.step1Question, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  private async sendComment(ctx: Context, index: number) {
    const comments = await this.commentService.getAllComments();

    if (comments.length === 0) {
      await ctx.reply('Пока нет отзывов.');
      return;
    }

    if (index < 0 || index >= comments.length) {
      await ctx.reply('Отзыв не найден.');
      return;
    }

    const comment = comments[index];
    const message = this.formatComment(comment);

    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];
    const row: Array<{ text: string; callback_data: string }> = [
      {
        text: '◀️ Предыдущий',
        callback_data: `comment_prev_${index}`,
      },
      {
        text: 'Следующий ▶️',
        callback_data: `comment_next_${index}`,
      },
    ];
    keyboard.push(row);

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  private formatComment(comment: Comment): string {
    const dateFormatted = this.formatDate(comment.date);
    return (
      `👤 Имя: ${comment.name}\n` +
      `📅 Дата: ${dateFormatted}\n\n` +
      `💬 Отзыв:\n${comment.text}`
    );
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateString;
    }
  }

  private async sendPortfolio(ctx: Context, index: number) {
    const portfolios = await this.portfolioService.getAllPortfolios();

    if (portfolios.length === 0) {
      await ctx.reply('Пока нет портфолио.');
      return;
    }

    if (index < 0 || index >= portfolios.length) {
      await ctx.reply('Портфолио не найдено.');
      return;
    }

    const portfolio = portfolios[index];
    const message = this.formatPortfolio(portfolio);

    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];
    const row: Array<{ text: string; callback_data: string }> = [
      {
        text: '◀️ Предыдущий',
        callback_data: `portfolio_prev_${index}`,
      },
      {
        text: 'Следующий ▶️',
        callback_data: `portfolio_next_${index}`,
      },
    ];
    keyboard.push(row);

    try {
      await ctx.replyWithPhoto(portfolio.imageSrc, {
        caption: message,
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch {
      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
  }

  private formatPortfolio(portfolio: Portfolio): string {
    return `${portfolio.title}\n\n${portfolio.description}`;
  }

  private buildKeyboard(buttons: Button[]): Array<Array<Button>> {
    if (buttons.length === 0) return [];

    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];
    const buttonsPerRow = 2;

    for (let i = 0; i < buttons.length; i += buttonsPerRow) {
      const row = buttons.slice(i, i + buttonsPerRow);
      keyboard.push(row);
    }

    return keyboard;
  }

  private buildContactKeyboard(
    buttons: Array<{ text: string; url: string }>,
  ): Array<Array<{ text: string; url: string }>> {
    if (buttons.length === 0) return [];

    const keyboard: Array<Array<{ text: string; url: string }>> = [];

    for (const button of buttons) {
      keyboard.push([{ text: button.text, url: button.url }]);
    }

    return keyboard;
  }
}
