import { Test, TestingModule } from '@nestjs/testing';
import { Context } from 'telegraf';
import { CommentService } from '../../comment/comment.service';
import { UserService } from '../../user/user.service';
import { CommentCommandUpdate } from './comment-command.update';

describe('CommentCommandUpdate', () => {
  let update: CommentCommandUpdate;

  const mockCommentService = {
    getAllComments: jest.fn(),
  };

  const mockUserService = {
    updateLastMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentCommandUpdate,
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    update = module.get<CommentCommandUpdate>(CommentCommandUpdate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(update).toBeDefined();
  });

  describe('showComment', () => {
    it('should show first comment when comments exist', async () => {
      const chatId = 12345;
      const mockComments = [
        {
          id: 1,
          name: 'User 1',
          date: '2024-01-01',
          text: 'Great service!',
        },
        {
          id: 2,
          name: 'User 2',
          date: '2024-01-02',
          text: 'Excellent work!',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCommentService.getAllComments.mockResolvedValue(mockComments);

      await update.showComment(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockCommentService.getAllComments).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining('User 1'),
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should show error when no comments', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCommentService.getAllComments.mockResolvedValue([]);

      await update.showComment(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith('Пока нет отзывов.');
    });
  });

  describe('handleCommentNavigation', () => {
    it('should navigate to next comment', async () => {
      const chatId = 12345;
      const mockComments = [
        {
          id: 1,
          name: 'User 1',
          date: '2024-01-01',
          text: 'Comment 1',
        },
        {
          id: 2,
          name: 'User 2',
          date: '2024-01-02',
          text: 'Comment 2',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        match: ['comment_next_0', 'next', '0'],
        callbackQuery: {},
        answerCbQuery: jest.fn().mockResolvedValue(true),
        editMessageText: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCommentService.getAllComments.mockResolvedValue(mockComments);

      await update.handleCommentNavigation(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
      expect(mockCtx.editMessageText).toHaveBeenCalledWith(
        expect.stringContaining('User 2'),
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should navigate to previous comment', async () => {
      const chatId = 12345;
      const mockComments = [
        {
          id: 1,
          name: 'User 1',
          date: '2024-01-01',
          text: 'Comment 1',
        },
        {
          id: 2,
          name: 'User 2',
          date: '2024-01-02',
          text: 'Comment 2',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        match: ['comment_prev_1', 'prev', '1'],
        callbackQuery: {},
        answerCbQuery: jest.fn().mockResolvedValue(true),
        editMessageText: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCommentService.getAllComments.mockResolvedValue(mockComments);

      await update.handleCommentNavigation(mockCtx);

      expect(mockCtx.editMessageText).toHaveBeenCalledWith(
        expect.stringContaining('User 1'),
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should wrap around to last comment when going prev from first', async () => {
      const chatId = 12345;
      const mockComments = [
        {
          id: 1,
          name: 'User 1',
          date: '2024-01-01',
          text: 'Comment 1',
        },
        {
          id: 2,
          name: 'User 2',
          date: '2024-01-02',
          text: 'Comment 2',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        match: ['comment_prev_0', 'prev', '0'],
        callbackQuery: {},
        answerCbQuery: jest.fn().mockResolvedValue(true),
        editMessageText: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCommentService.getAllComments.mockResolvedValue(mockComments);

      await update.handleCommentNavigation(mockCtx);

      expect(mockCtx.editMessageText).toHaveBeenCalledWith(
        expect.stringContaining('User 2'),
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should wrap around to first comment when going next from last', async () => {
      const chatId = 12345;
      const mockComments = [
        {
          id: 1,
          name: 'User 1',
          date: '2024-01-01',
          text: 'Comment 1',
        },
        {
          id: 2,
          name: 'User 2',
          date: '2024-01-02',
          text: 'Comment 2',
        },
      ];

      const mockCtx = {
        from: { id: chatId },
        match: ['comment_next_1', 'next', '1'],
        callbackQuery: {},
        answerCbQuery: jest.fn().mockResolvedValue(true),
        editMessageText: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockCommentService.getAllComments.mockResolvedValue(mockComments);

      await update.handleCommentNavigation(mockCtx);

      expect(mockCtx.editMessageText).toHaveBeenCalledWith(
        expect.stringContaining('User 1'),
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should handle error when match is invalid', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        match: null,
        answerCbQuery: jest.fn().mockResolvedValue(true),
      } as unknown as Context;

      await update.handleCommentNavigation(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('Ошибка навигации');
    });

    it('should handle error when no comments', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        match: ['comment_next_0', 'next', '0'],
        answerCbQuery: jest.fn().mockResolvedValue(true),
      } as unknown as Context;

      mockCommentService.getAllComments.mockResolvedValue([]);

      await update.handleCommentNavigation(mockCtx);

      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('Нет отзывов');
    });
  });
});
