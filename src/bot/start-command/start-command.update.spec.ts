import { Test, TestingModule } from '@nestjs/testing';
import { Context } from 'telegraf';
import { StartCommandUpdate } from './start-command.update';
import { StartService } from '../../start/start.service';
import { CommentService } from '../../comment/comment.service';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { ContactService } from '../../contact/contact.service';
import { UserService } from '../../user/user.service';
import { CalculateService } from '../../calculate/calculate.service';

describe('StartCommandUpdate', () => {
  let update: StartCommandUpdate;
  let startService: StartService;
  let commentService: CommentService;
  let portfolioService: PortfolioService;
  let contactService: ContactService;
  let userService: UserService;
  let calculateService: CalculateService;

  const mockStartService = {
    getStart: jest.fn(),
  };

  const mockCommentService = {
    getAllComments: jest.fn(),
  };

  const mockPortfolioService = {
    getAllPortfolios: jest.fn(),
  };

  const mockContactService = {
    getContact: jest.fn(),
  };

  const mockUserService = {
    createOrUpdateUser: jest.fn(),
    updateLastMessage: jest.fn(),
  };

  const mockCalculateService = {
    getCalculate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartCommandUpdate,
        {
          provide: StartService,
          useValue: mockStartService,
        },
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: PortfolioService,
          useValue: mockPortfolioService,
        },
        {
          provide: ContactService,
          useValue: mockContactService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CalculateService,
          useValue: mockCalculateService,
        },
      ],
    }).compile();

    update = module.get<StartCommandUpdate>(StartCommandUpdate);
    startService = module.get<StartService>(StartService);
    commentService = module.get<CommentService>(CommentService);
    portfolioService = module.get<PortfolioService>(PortfolioService);
    contactService = module.get<ContactService>(ContactService);
    userService = module.get<UserService>(UserService);
    calculateService = module.get<CalculateService>(CalculateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(update).toBeDefined();
  });

  describe('start', () => {
    it('should send start message and pin it', async () => {
      const chatId = 12345;
      const mockStartData = {
        id: 'singleton',
        content: 'Welcome message',
        buttons: JSON.stringify([
          { text: 'Button 1', callback_data: 'action1' },
        ]),
      };

      const mockCtx = {
        from: {
          id: chatId,
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
        },
        reply: jest.fn().mockResolvedValue({ message_id: 1 }),
        pinChatMessage: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockStartService.getStart.mockResolvedValue(mockStartData);

      await update.start(mockCtx);

      expect(mockUserService.createOrUpdateUser).toHaveBeenCalledWith(
        chatId,
        {
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
      );
      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockStartService.getStart).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        mockStartData.content,
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
      expect(mockCtx.pinChatMessage).toHaveBeenCalledWith(1);
    });

    it('should show error when start config not found', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockStartService.getStart.mockResolvedValue(null);

      await update.start(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith('Конфигурация не найдена');
    });

    it('should handle missing user info', async () => {
      const mockStartData = {
        id: 'singleton',
        content: 'Welcome message',
        buttons: '[]',
      };

      const mockCtx = {
        from: undefined,
        reply: jest.fn().mockResolvedValue({ message_id: 1 }),
        pinChatMessage: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockStartService.getStart.mockResolvedValue(mockStartData);

      await update.start(mockCtx);

      expect(mockUserService.createOrUpdateUser).not.toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalled();
    });
  });

  describe('handleButtonClick', () => {
    it('should handle otzivi button', async () => {
      const chatId = 12345;
      const mockComments = [
        {
          id: 1,
          name: 'User 1',
          date: '2024-01-01',
          text: 'Comment 1',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        match: ['otzivi', 'otzivi'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCommentService.getAllComments.mockResolvedValue(mockComments);

      await update.handleButtonClick(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
      expect(mockCommentService.getAllComments).toHaveBeenCalled();
    });

    it('should handle portfolio button', async () => {
      const chatId = 12345;
      const mockPortfolios = [
        {
          id: 1,
          imageSrc: 'image1.jpg',
          title: 'Portfolio 1',
          description: 'Description 1',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        match: ['portfolio', 'portfolio'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        replyWithPhoto: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockPortfolioService.getAllPortfolios.mockResolvedValue(mockPortfolios);

      await update.handleButtonClick(mockCtx);

      expect(mockPortfolioService.getAllPortfolios).toHaveBeenCalled();
    });

    it('should handle contacts button', async () => {
      const chatId = 12345;
      const mockContact = {
        id: 'singleton',
        address: '123 Main St',
        managerText: 'Contact manager',
        buttons: '[]',
      };

      const mockCtx = {
        from: { id: chatId },
        match: ['contacts', 'contacts'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockContactService.getContact.mockResolvedValue(mockContact);

      await update.handleButtonClick(mockCtx);

      expect(mockContactService.getContact).toHaveBeenCalled();
    });

    it('should handle calculate button', async () => {
      const chatId = 12345;
      const mockCalculate = {
        id: 'singleton',
        step1Question: 'Question 1',
        step1Options: JSON.stringify(['Option 1', 'Option 2']),
      };

      const mockCtx = {
        from: { id: chatId },
        match: ['calculate', 'calculate'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCalculateService.getCalculate.mockResolvedValue(mockCalculate);

      await update.handleButtonClick(mockCtx);

      expect(mockCalculateService.getCalculate).toHaveBeenCalled();
    });

    it('should handle unknown button', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        match: ['unknown', 'unknown'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.handleButtonClick(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith(
        'Команда "unknown" не найдена.',
      );
    });

    it('should handle error when match is invalid', async () => {
      const mockCtx = {
        match: null,
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.handleButtonClick(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('Ошибка');
    });
  });
});

