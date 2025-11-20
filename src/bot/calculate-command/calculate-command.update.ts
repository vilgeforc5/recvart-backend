import { Action, Command, Ctx, Hears, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { CalculateService } from '../../calculate/calculate.service';
import { UserService } from '../../user/user.service';

interface CalculateSession {
  propertyType?: string;
  location?: string;
  area?: string;
  contactMethod?: string;
  contactInfo?: string;
  waitingForArea?: boolean;
  waitingForContact?: boolean;
}

interface CallbackContext extends Context {
  match?: RegExpMatchArray;
}

const calculateSessions = new Map<number, CalculateSession>();

@Update()
export class CalculateCommandUpdate {
  constructor(
    private readonly calculateService: CalculateService,
    private readonly userService: UserService,
  ) {}

  @Command('calculate')
  async startCalculate(@Ctx() ctx: Context) {
    const chatId = ctx.from?.id;
    if (!chatId) return;

    await this.userService.updateLastMessage(chatId);
    calculateSessions.set(chatId, {});

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

  @Action(/^calc_step1_(\d+)$/)
  async handleStep1(@Ctx() ctx: CallbackContext) {
    const match = ctx.match;
    if (!match || !match[1]) {
      await ctx.answerCbQuery('Ошибка');
      return;
    }

    const chatId = ctx.from?.id;
    if (!chatId) return;

    await this.userService.updateLastMessage(chatId);

    const index = parseInt(match[1], 10);
    const calculateConfig = await this.calculateService.getCalculate();
    if (!calculateConfig) {
      await ctx.answerCbQuery('Конфигурация не найдена');
      return;
    }

    const step1Options = JSON.parse(
      calculateConfig.step1Options || '[]',
    ) as string[];

    if (index < 0 || index >= step1Options.length) {
      await ctx.answerCbQuery('Ошибка');
      return;
    }

    const propertyType = step1Options[index];
    const session = calculateSessions.get(chatId) || {};
    session.propertyType = propertyType;
    calculateSessions.set(chatId, session);

    await ctx.answerCbQuery();

    const step2Options = JSON.parse(
      calculateConfig.step2Options || '[]',
    ) as string[];

    const keyboard = step2Options.map((option: string, index: number) => [
      { text: option, callback_data: `calc_step2_${index}` },
    ]);

    await ctx.reply(calculateConfig.step2Question, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Action(/^calc_step2_(\d+)$/)
  async handleStep2(@Ctx() ctx: CallbackContext) {
    const match = ctx.match;
    if (!match || !match[1]) {
      await ctx.answerCbQuery('Ошибка');
      return;
    }

    const chatId = ctx.from?.id;
    if (!chatId) return;

    await this.userService.updateLastMessage(chatId);

    const index = parseInt(match[1], 10);
    const calculateConfig = await this.calculateService.getCalculate();
    if (!calculateConfig) {
      await ctx.answerCbQuery('Конфигурация не найдена');
      return;
    }

    const step2Options = JSON.parse(
      calculateConfig.step2Options || '[]',
    ) as string[];

    if (index < 0 || index >= step2Options.length) {
      await ctx.answerCbQuery('Ошибка');
      return;
    }

    const location = step2Options[index];
    const session = calculateSessions.get(chatId) || {};
    session.location = location;
    session.waitingForArea = true;
    session.waitingForContact = false;
    calculateSessions.set(chatId, session);

    await ctx.answerCbQuery();

    await ctx.reply(calculateConfig.step3Question);
  }

  @Action(/^calc_step4_(\d+)$/)
  async handleStep4(@Ctx() ctx: CallbackContext) {
    const match = ctx.match;
    if (!match || !match[1]) {
      await ctx.answerCbQuery('Ошибка');
      return;
    }

    const chatId = ctx.from?.id;
    if (!chatId) return;

    await this.userService.updateLastMessage(chatId);

    const index = parseInt(match[1], 10);
    const calculateConfig = await this.calculateService.getCalculate();
    if (!calculateConfig) {
      await ctx.answerCbQuery('Конфигурация не найдена');
      return;
    }

    const step4Options = JSON.parse(
      calculateConfig.step4Options || '[]',
    ) as string[];

    if (index < 0 || index >= step4Options.length) {
      await ctx.answerCbQuery('Ошибка');
      return;
    }

    const contactMethod = step4Options[index];
    const session = calculateSessions.get(chatId) || {};
    session.contactMethod = contactMethod;
    session.waitingForArea = false;
    session.waitingForContact = true;
    calculateSessions.set(chatId, session);

    await ctx.answerCbQuery();

    await ctx.reply(calculateConfig.step5ContactPrompt);
  }

  @Hears(/.*/)
  async handleTextMessage(@Ctx() ctx: Context) {
    const chatId = ctx.from?.id;
    if (!chatId) return;

    const session = calculateSessions.get(chatId);
    if (!session) return;

    if (!ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text.trim();

    if (session.waitingForArea) {
      const area = parseFloat(text);

      if (isNaN(area) || area <= 0) {
        await ctx.reply('Пожалуйста, введите корректное число (метраж в м²)');
        return;
      }

      session.area = text;
      session.waitingForArea = false;
      calculateSessions.set(chatId, session);

      const calculateConfig = await this.calculateService.getCalculate();
      if (!calculateConfig) {
        await ctx.reply('Конфигурация не найдена');
        return;
      }

      const step4Options = JSON.parse(
        calculateConfig.step4Options || '[]',
      ) as string[];

      const keyboard = step4Options.map((option: string, index: number) => [
        { text: option, callback_data: `calc_step4_${index}` },
      ]);

      await ctx.reply(calculateConfig.step4Question, {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
      return;
    }

    if (session.waitingForContact) {
      session.contactInfo = text;
      session.waitingForContact = false;
      calculateSessions.set(chatId, session);

      await this.finishCalculate(ctx, chatId);
      return;
    }
  }

  private async finishCalculate(@Ctx() ctx: Context, chatId: number) {
    const session = calculateSessions.get(chatId);
    if (!session) return;

    const calculateConfig = await this.calculateService.getCalculate();
    if (!calculateConfig) {
      await ctx.reply('Конфигурация не найдена');
      calculateSessions.delete(chatId);
      return;
    }

    if (
      !session.propertyType ||
      !session.location ||
      !session.area ||
      !session.contactMethod ||
      !session.contactInfo
    ) {
      await ctx.reply(
        'Произошла ошибка. Пожалуйста, начните заново командой /calculate',
      );
      calculateSessions.delete(chatId);
      return;
    }

    const application = `💰 Расчет стоимости ремонта

🏠 Тип помещения: ${session.propertyType}
📍 Расположение: ${session.location}
📐 Метраж: ${session.area} м²
💬 Способ связи: ${session.contactMethod}
📱 ${session.contactMethod === 'Email' ? 'Email' : 'Телефон'}: ${session.contactInfo}`;

    await ctx.reply(application);
    await ctx.reply(calculateConfig.finalMessage);

    calculateSessions.delete(chatId);
  }
}
