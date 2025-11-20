import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Comment } from '../../comment/comment.entity';
import { CommentService } from '../../comment/comment.service';
import { UserService } from '../../user/user.service';

interface CallbackContext extends Context {
  match?: RegExpMatchArray;
}

@Update()
export class CommentCommandUpdate {
  constructor(
    private readonly commentService: CommentService,
    private readonly userService: UserService,
  ) {}

  @Command('otzivi')
  async showComment(@Ctx() ctx: Context) {
    const chatId = ctx.from?.id;
    if (chatId) {
      await this.userService.updateLastMessage(chatId);
    }

    const comments = await this.commentService.getAllComments();

    if (comments.length === 0) {
      await ctx.reply('Пока нет отзывов.');
      return;
    }

    await this.sendComment(ctx, 0);
  }

  @Action(/^comment_(prev|next)_(\d+)$/)
  async handleCommentNavigation(@Ctx() ctx: CallbackContext) {
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

    const comments = await this.commentService.getAllComments();
    if (comments.length === 0) {
      await ctx.answerCbQuery('Нет отзывов');
      return;
    }

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? comments.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === comments.length - 1 ? 0 : currentIndex + 1;
    }

    await ctx.answerCbQuery();
    await this.sendComment(ctx, newIndex);
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

    try {
      if (ctx.callbackQuery) {
        await ctx.editMessageText(message, {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      } else {
        await ctx.reply(message, {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      }
    } catch {
      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
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
}
