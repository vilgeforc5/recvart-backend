import { Test, TestingModule } from '@nestjs/testing';
import { Context } from 'telegraf';
import { CalculateService } from '../../calculate/calculate.service';
import { UserService } from '../../user/user.service';
import { CalculateCommandUpdate } from './calculate-command.update';

describe('CalculateCommandUpdate', () => {
  let update: CalculateCommandUpdate;

  const mockCalculateService = {
    getCalculate: jest.fn(),
  };

  const mockUserService = {
    updateLastMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateCommandUpdate,
        {
          provide: CalculateService,
          useValue: mockCalculateService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    update = module.get<CalculateCommandUpdate>(CalculateCommandUpdate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(update).toBeDefined();
  });

  describe('startCalculate', () => {
    it('should start calculate flow with step 1', async () => {
      const chatId = 12345;
      const mockCalculate = {
        id: 'singleton',
        step1Question: 'Question 1',
        step1Options: JSON.stringify(['Option 1', 'Option 2']),
      };

      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue(mockCalculate);

      await update.startCalculate(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockCalculateService.getCalculate).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        mockCalculate.step1Question,
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should return early when chatId is undefined', async () => {
      const mockCtx = {
        from: undefined,
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.startCalculate(mockCtx);

      expect(mockCalculateService.getCalculate).not.toHaveBeenCalled();
      expect(mockCtx.reply).not.toHaveBeenCalled();
    });

    it('should show error when calculate config not found', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue(null);

      await update.startCalculate(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith('Конфигурация не найдена');
    });
  });

  describe('handleStep1', () => {
    it('should handle step 1 selection and show step 2', async () => {
      const chatId = 12345;
      const mockCalculate = {
        id: 'singleton',
        step1Options: JSON.stringify(['Option 1', 'Option 2']),
        step2Question: 'Question 2',
        step2Options: JSON.stringify(['Option A', 'Option B']),
      };

      const mockCtx = {
        from: { id: chatId },
        match: ['calc_step1_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue(mockCalculate);

      await update.handleStep1(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        mockCalculate.step2Question,
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should handle error when match is invalid', async () => {
      const mockCtx = {
        match: null,
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.handleStep1(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('Ошибка');
    });

    it('should handle error when index is out of bounds', async () => {
      const chatId = 12345;
      const mockCalculate = {
        id: 'singleton',
        step1Options: JSON.stringify(['Option 1']),
      };

      const mockCtx = {
        from: { id: chatId },
        match: ['calc_step1_5', '5'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue(mockCalculate);

      await update.handleStep1(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('Ошибка');
    });
  });

  describe('handleStep2', () => {
    it('should handle step 2 selection and show step 3', async () => {
      const chatId = 12345;
      const mockCalculate = {
        id: 'singleton',
        step2Options: JSON.stringify(['Option A', 'Option B']),
        step3Question: 'Question 3',
      };

      const mockCtx = {
        from: { id: chatId },
        match: ['calc_step2_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue(mockCalculate);

      await update.handleStep2(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(mockCalculate.step3Question);
    });

    it('should handle error when config not found', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        match: ['calc_step2_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue(null);

      await update.handleStep2(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith(
        'Конфигурация не найдена',
      );
    });
  });

  describe('handleStep4', () => {
    it('should handle step 4 selection and show step 5', async () => {
      const chatId = 12345;
      const mockCalculate = {
        id: 'singleton',
        step4Options: JSON.stringify(['Option X', 'Option Y']),
        step5ContactPrompt: 'Enter contact info',
      };

      const mockCtx = {
        from: { id: chatId },
        match: ['calc_step4_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue(mockCalculate);

      await update.handleStep4(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        mockCalculate.step5ContactPrompt,
      );
    });
  });

  describe('handleTextMessage', () => {
    it('should handle area input and show step 4', async () => {
      const chatId = 12345;
      const mockCalculate = {
        id: 'singleton',
        step4Question: 'Question 4',
        step4Options: JSON.stringify(['Option X', 'Option Y']),
      };

      const mockCtx = {
        from: { id: chatId },
        message: {
          text: '50',
        },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      const step2Ctx = {
        from: { id: chatId },
        match: ['calc_step2_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate
        .mockResolvedValueOnce({
          id: 'singleton',
          step2Options: JSON.stringify(['Option A']),
          step3Question: 'Question 3',
        })
        .mockResolvedValueOnce(mockCalculate);

      await update.handleStep2(step2Ctx);
      await update.handleTextMessage(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith(
        mockCalculate.step4Question,
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should reject invalid area input', async () => {
      const chatId = 12346;
      const mockCtx = {
        from: { id: chatId },
        message: {
          text: 'invalid',
        },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      const step2Ctx = {
        from: { id: chatId },
        match: ['calc_step2_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue({
        id: 'singleton',
        step2Options: JSON.stringify(['Option A']),
        step3Question: 'Question 3',
      });

      await update.handleStep2(step2Ctx);
      await update.handleTextMessage(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith(
        'Пожалуйста, введите корректное число (метраж в м²)',
      );
    });

    it('should reject negative area', async () => {
      const chatId = 12347;
      const mockCtx = {
        from: { id: chatId },
        message: {
          text: '-10',
        },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      const step2Ctx = {
        from: { id: chatId },
        match: ['calc_step2_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue({
        id: 'singleton',
        step2Options: JSON.stringify(['Option A']),
        step3Question: 'Question 3',
      });

      await update.handleStep2(step2Ctx);
      await update.handleTextMessage(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith(
        'Пожалуйста, введите корректное число (метраж в м²)',
      );
    });

    it('should handle contact info input and finish calculate', async () => {
      const chatId = 12348;
      const mockCalculate = {
        id: 'singleton',
        step4Options: JSON.stringify(['Email']),
        finalMessage: 'Thank you!',
      };

      const mockCtx = {
        from: { id: chatId },
        message: {
          text: 'test@example.com',
        },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      const step1Ctx = {
        from: { id: chatId },
        match: ['calc_step1_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      const step2Ctx = {
        from: { id: chatId },
        match: ['calc_step2_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      const step4Ctx = {
        from: { id: chatId },
        match: ['calc_step4_0', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      const areaCtx = {
        from: { id: chatId },
        message: {
          text: '50',
        },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate
        .mockResolvedValueOnce({
          id: 'singleton',
          step1Options: JSON.stringify(['Apartment']),
          step2Question: 'Question 2',
          step2Options: JSON.stringify(['Moscow']),
        })
        .mockResolvedValueOnce({
          id: 'singleton',
          step2Options: JSON.stringify(['Moscow']),
          step3Question: 'Question 3',
        })
        .mockResolvedValueOnce({
          id: 'singleton',
          step4Question: 'Question 4',
          step4Options: JSON.stringify(['Email']),
        })
        .mockResolvedValueOnce({
          id: 'singleton',
          step4Options: JSON.stringify(['Email']),
          step5ContactPrompt: 'Enter contact',
        })
        .mockResolvedValueOnce(mockCalculate);

      await update.handleStep1(step1Ctx);
      await update.handleStep2(step2Ctx);
      await update.handleTextMessage(areaCtx);
      await update.handleStep4(step4Ctx);
      await update.handleTextMessage(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledTimes(2);
      expect(mockCtx.reply).toHaveBeenLastCalledWith(
        mockCalculate.finalMessage,
      );
    });

    it('should return early when no session exists', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        message: {
          text: 'some text',
        },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.handleTextMessage(mockCtx);

      expect(mockCtx.reply).not.toHaveBeenCalled();
    });

    it('should return early when chatId is undefined', async () => {
      const mockCtx = {
        from: undefined,
        message: {
          text: 'some text',
        },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.handleTextMessage(mockCtx);

      expect(mockCtx.reply).not.toHaveBeenCalled();
    });

    it('should return early when message is not text', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        message: {
          photo: [{ file_id: 'photo1' }],
        },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.handleTextMessage(mockCtx);

      expect(mockCtx.reply).not.toHaveBeenCalled();
    });
  });
});
