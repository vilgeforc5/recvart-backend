import { Test, TestingModule } from '@nestjs/testing';
import { Context } from 'telegraf';
import { PortfolioCommandUpdate } from './portfolio-command.update';
import { PortfolioService } from '../../portfolio/portfolio.service';
import { UserService } from '../../user/user.service';

describe('PortfolioCommandUpdate', () => {
  let update: PortfolioCommandUpdate;
  let portfolioService: PortfolioService;
  let userService: UserService;

  const mockPortfolioService = {
    getAllPortfolios: jest.fn(),
  };

  const mockUserService = {
    updateLastMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioCommandUpdate,
        {
          provide: PortfolioService,
          useValue: mockPortfolioService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    update = module.get<PortfolioCommandUpdate>(PortfolioCommandUpdate);
    portfolioService = module.get<PortfolioService>(PortfolioService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(update).toBeDefined();
  });

  describe('showPortfolio', () => {
    it('should show first portfolio when portfolios exist', async () => {
      const chatId = 12345;
      const mockPortfolios = [
        {
          id: 1,
          imageSrc: 'image1.jpg',
          title: 'Portfolio 1',
          description: 'Description 1',
        },
        {
          id: 2,
          imageSrc: 'image2.jpg',
          title: 'Portfolio 2',
          description: 'Description 2',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        replyWithPhoto: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockPortfolioService.getAllPortfolios.mockResolvedValue(mockPortfolios);

      await update.showPortfolio(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockPortfolioService.getAllPortfolios).toHaveBeenCalled();
      expect(mockCtx.replyWithPhoto).toHaveBeenCalledWith(
        mockPortfolios[0].imageSrc,
        expect.objectContaining({
          caption: expect.stringContaining('Portfolio 1'),
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should show error when no portfolios', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockPortfolioService.getAllPortfolios.mockResolvedValue([]);

      await update.showPortfolio(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith('Пока нет портфолио.');
    });
  });

  describe('handlePortfolioNavigation', () => {
    it('should navigate to next portfolio', async () => {
      const chatId = 12345;
      const mockPortfolios = [
        {
          id: 1,
          imageSrc: 'image1.jpg',
          title: 'Portfolio 1',
          description: 'Description 1',
        },
        {
          id: 2,
          imageSrc: 'image2.jpg',
          title: 'Portfolio 2',
          description: 'Description 2',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        match: ['portfolio_next_0', 'next', '0'],
        callbackQuery: {
          message: {
            photo: [{ file_id: 'photo1' }],
          },
        },
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        editMessageMedia: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockPortfolioService.getAllPortfolios.mockResolvedValue(mockPortfolios);

      await update.handlePortfolioNavigation(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
      expect(mockCtx.editMessageMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'photo',
          media: mockPortfolios[1].imageSrc,
          caption: expect.stringContaining('Portfolio 2'),
        }),
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should navigate to previous portfolio', async () => {
      const chatId = 12345;
      const mockPortfolios = [
        {
          id: 1,
          imageSrc: 'image1.jpg',
          title: 'Portfolio 1',
          description: 'Description 1',
        },
        {
          id: 2,
          imageSrc: 'image2.jpg',
          title: 'Portfolio 2',
          description: 'Description 2',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        match: ['portfolio_prev_1', 'prev', '1'],
        callbackQuery: {
          message: {
            photo: [{ file_id: 'photo1' }],
          },
        },
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        editMessageMedia: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockPortfolioService.getAllPortfolios.mockResolvedValue(mockPortfolios);

      await update.handlePortfolioNavigation(mockCtx);

      expect(mockCtx.editMessageMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          media: mockPortfolios[0].imageSrc,
          caption: expect.stringContaining('Portfolio 1'),
        }),
        expect.any(Object),
      );
    });

    it('should wrap around to last portfolio when going prev from first', async () => {
      const chatId = 12345;
      const mockPortfolios = [
        {
          id: 1,
          imageSrc: 'image1.jpg',
          title: 'Portfolio 1',
          description: 'Description 1',
        },
        {
          id: 2,
          imageSrc: 'image2.jpg',
          title: 'Portfolio 2',
          description: 'Description 2',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        match: ['portfolio_prev_0', 'prev', '0'],
        callbackQuery: {
          message: {
            photo: [{ file_id: 'photo1' }],
          },
        },
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        editMessageMedia: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockPortfolioService.getAllPortfolios.mockResolvedValue(mockPortfolios);

      await update.handlePortfolioNavigation(mockCtx);

      expect(mockCtx.editMessageMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          media: mockPortfolios[1].imageSrc,
          caption: expect.stringContaining('Portfolio 2'),
        }),
        expect.any(Object),
      );
    });

    it('should handle error when match is invalid', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        match: null,
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.handlePortfolioNavigation(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('Ошибка навигации');
    });

    it('should handle error when no portfolios', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        match: ['portfolio_next_0', 'next', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockPortfolioService.getAllPortfolios.mockResolvedValue([]);

      await update.handlePortfolioNavigation(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('Нет портфолио');
    });

    it('should fallback to replyWithPhoto when editMessageMedia fails', async () => {
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
        match: ['portfolio_next_0', 'next', '0'],
        callbackQuery: {
          message: {},
        },
        answerCbQuery: jest.fn().mockResolvedValue(undefined),
        deleteMessage: jest.fn().mockResolvedValue(undefined),
        replyWithPhoto: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockPortfolioService.getAllPortfolios.mockResolvedValue(mockPortfolios);

      await update.handlePortfolioNavigation(mockCtx);

      expect(mockCtx.deleteMessage).toHaveBeenCalled();
      expect(mockCtx.replyWithPhoto).toHaveBeenCalled();
    });
  });
});

