import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Portfolio } from '../../portfolio/portfolio.entity';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { UserService } from '../../user/user.service';

interface CallbackContext extends Context {
  match?: RegExpMatchArray;
}

@Update()
export class PortfolioCommandUpdate {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly userService: UserService,
  ) {}

  @Command('portfolio')
  async showPortfolio(@Ctx() ctx: Context) {
    const chatId = ctx.from?.id;
    if (chatId) {
      await this.userService.updateLastMessage(chatId);
    }

    const portfolios = await this.portfolioService.getAllPortfolios();

    if (portfolios.length === 0) {
      await ctx.reply('Пока нет портфолио.');
      return;
    }

    await this.sendPortfolio(ctx, 0);
  }

  @Action(/^portfolio_(prev|next)_(\d+)$/)
  async handlePortfolioNavigation(@Ctx() ctx: CallbackContext) {
    const chatId = ctx.from?.id;
    if (chatId) {
      await this.userService.updateLastMessage(chatId);
    }

    const match = ctx.match;
    if (!match || !match[1] || !match[2]) {
      await ctx.answerCbQuery('Ошибка навигации');
      return;
    }
    const direction = match[1];
    const currentIndex = parseInt(match[2], 10);

    const portfolios = await this.portfolioService.getAllPortfolios();
    if (portfolios.length === 0) {
      await ctx.answerCbQuery('Нет портфолио');
      return;
    }

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? portfolios.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === portfolios.length - 1 ? 0 : currentIndex + 1;
    }

    await ctx.answerCbQuery();
    await this.sendPortfolio(ctx, newIndex);
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
      if (ctx.callbackQuery) {
        if (ctx.callbackQuery.message && 'photo' in ctx.callbackQuery.message) {
          await ctx.editMessageMedia(
            {
              type: 'photo',
              media: portfolio.imageSrc,
              caption: message,
            },
            {
              reply_markup: {
                inline_keyboard: keyboard,
              },
            },
          );
        } else {
          await ctx.deleteMessage();
          await ctx.replyWithPhoto(portfolio.imageSrc, {
            caption: message,
            reply_markup: {
              inline_keyboard: keyboard,
            },
          });
        }
      } else {
        await ctx.replyWithPhoto(portfolio.imageSrc, {
          caption: message,
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      }
    } catch {
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
  }

  private formatPortfolio(portfolio: Portfolio): string {
    return `${portfolio.title}\n\n${portfolio.description}`;
  }
}
