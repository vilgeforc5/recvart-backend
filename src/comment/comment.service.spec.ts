import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';

describe('CommentService', () => {
  let service: CommentService;
  let commentModel: typeof Comment;

  const mockCommentModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getModelToken(Comment),
          useValue: mockCommentModel,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    commentModel = module.get<typeof Comment>(getModelToken(Comment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllComments', () => {
    it('should return all comments ordered by date DESC', async () => {
      const mockComments = [
        { id: 1, name: 'User 1', date: '2024-01-02', text: 'Comment 1' },
        { id: 2, name: 'User 2', date: '2024-01-01', text: 'Comment 2' },
      ];

      mockCommentModel.findAll.mockResolvedValue(mockComments);

      const result = await service.getAllComments();

      expect(mockCommentModel.findAll).toHaveBeenCalledWith({
        order: [['date', 'DESC']],
      });
      expect(result).toEqual(mockComments);
    });

    it('should return empty array when no comments', async () => {
      mockCommentModel.findAll.mockResolvedValue([]);

      const result = await service.getAllComments();

      expect(result).toEqual([]);
    });
  });

  describe('getCommentById', () => {
    it('should return comment when found', async () => {
      const id = 1;
      const mockComment = {
        id,
        name: 'User 1',
        date: '2024-01-01',
        text: 'Comment text',
      };

      mockCommentModel.findByPk.mockResolvedValue(mockComment);

      const result = await service.getCommentById(id);

      expect(mockCommentModel.findByPk).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockComment);
    });

    it('should return null when not found', async () => {
      const id = 999;

      mockCommentModel.findByPk.mockResolvedValue(null);

      const result = await service.getCommentById(id);

      expect(result).toBeNull();
    });
  });

  describe('getCommentByIndex', () => {
    it('should return comment at valid index', async () => {
      const mockComments = [
        { id: 1, name: 'User 1', date: '2024-01-01', text: 'Comment 1' },
        { id: 2, name: 'User 2', date: '2024-01-02', text: 'Comment 2' },
      ];

      mockCommentModel.findAll.mockResolvedValue(mockComments);

      const result = await service.getCommentByIndex(0);

      expect(result).toEqual(mockComments[0]);
    });

    it('should return null for negative index', async () => {
      const mockComments = [
        { id: 1, name: 'User 1', date: '2024-01-01', text: 'Comment 1' },
      ];

      mockCommentModel.findAll.mockResolvedValue(mockComments);

      const result = await service.getCommentByIndex(-1);

      expect(result).toBeNull();
    });

    it('should return null for index out of bounds', async () => {
      const mockComments = [
        { id: 1, name: 'User 1', date: '2024-01-01', text: 'Comment 1' },
      ];

      mockCommentModel.findAll.mockResolvedValue(mockComments);

      const result = await service.getCommentByIndex(5);

      expect(result).toBeNull();
    });
  });

  describe('getTotalCount', () => {
    it('should return total count of comments', async () => {
      const total = 10;

      mockCommentModel.count.mockResolvedValue(total);

      const result = await service.getTotalCount();

      expect(mockCommentModel.count).toHaveBeenCalled();
      expect(result).toBe(total);
    });
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const name = 'New User';
      const date = '2024-01-01';
      const text = 'New comment text';

      const mockComment = {
        id: 3,
        name,
        date,
        text,
      };

      mockCommentModel.create.mockResolvedValue(mockComment);

      const result = await service.createComment(name, date, text);

      expect(mockCommentModel.create).toHaveBeenCalledWith({
        name,
        date,
        text,
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe('deleteComment', () => {
    it('should return true when comment is deleted', async () => {
      const id = 1;

      mockCommentModel.destroy.mockResolvedValue(1);

      const result = await service.deleteComment(id);

      expect(mockCommentModel.destroy).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBe(true);
    });

    it('should return false when comment is not found', async () => {
      const id = 999;

      mockCommentModel.destroy.mockResolvedValue(0);

      const result = await service.deleteComment(id);

      expect(result).toBe(false);
    });
  });
});

