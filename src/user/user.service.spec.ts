import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let userModel: typeof User;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<typeof User>(getModelToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdateUser', () => {
    it('should create a new user when user does not exist', async () => {
      const chatId = 12345;
      const userData = {
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        clientId: 'client123',
      };

      mockUserModel.findOne.mockResolvedValue(null);
      const mockUser = {
        id: 1,
        chatId,
        ...userData,
        update: jest.fn(),
        reload: jest.fn(),
      };
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.createOrUpdateUser(chatId, userData);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { chatId },
      });
      expect(mockUserModel.create).toHaveBeenCalledWith({
        chatId,
        ...userData,
      });
      expect(result).toEqual(mockUser);
    });

    it('should update existing user when user exists', async () => {
      const chatId = 12345;
      const userData = {
        username: 'updateduser',
        firstName: 'Updated',
      };

      const existingUser = {
        id: 1,
        chatId,
        username: 'olduser',
        firstName: 'Old',
        lastName: 'User',
        clientId: 'oldclient',
        update: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue(undefined),
      };

      mockUserModel.findOne.mockResolvedValue(existingUser);

      const result = await service.createOrUpdateUser(chatId, userData);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { chatId },
      });
      expect(existingUser.update).toHaveBeenCalledWith(
        {
          username: userData.username,
          firstName: userData.firstName,
          lastName: existingUser.lastName,
          clientId: existingUser.clientId,
        },
        {
          fields: [
            'username',
            'firstName',
            'lastName',
            'clientId',
            'updatedAt',
          ],
        },
      );
      expect(existingUser.reload).toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    it('should handle partial update data', async () => {
      const chatId = 12345;
      const userData = {
        username: 'newusername',
      };

      const existingUser = {
        id: 1,
        chatId,
        username: 'olduser',
        firstName: 'Old',
        lastName: 'User',
        clientId: 'oldclient',
        update: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue(undefined),
      };

      mockUserModel.findOne.mockResolvedValue(existingUser);

      await service.createOrUpdateUser(chatId, userData);

      expect(existingUser.update).toHaveBeenCalledWith(
        {
          username: userData.username,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          clientId: existingUser.clientId,
        },
        expect.any(Object),
      );
    });
  });

  describe('getUserByChatId', () => {
    it('should return user when found', async () => {
      const chatId = 12345;
      const mockUser = {
        id: 1,
        chatId,
        username: 'testuser',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserByChatId(chatId);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { chatId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const chatId = 12345;

      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.getUserByChatId(chatId);

      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      const mockUsers = [
        { id: 1, chatId: 12345 },
        { id: 2, chatId: 67890 },
      ];
      const total = 2;
      const skip = 0;
      const take = 10;

      mockUserModel.count.mockResolvedValue(total);
      mockUserModel.findAll.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(skip, take);

      expect(mockUserModel.count).toHaveBeenCalled();
      expect(mockUserModel.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
        limit: take,
        offset: skip,
      });
      expect(result).toEqual({ users: mockUsers, total });
    });

    it('should return all users without pagination', async () => {
      const mockUsers = [{ id: 1, chatId: 12345 }];
      const total = 1;

      mockUserModel.count.mockResolvedValue(total);
      mockUserModel.findAll.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      expect(mockUserModel.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
        limit: undefined,
        offset: undefined,
      });
      expect(result).toEqual({ users: mockUsers, total });
    });
  });

  describe('getTotalCount', () => {
    it('should return total count of users', async () => {
      const total = 5;

      mockUserModel.count.mockResolvedValue(total);

      const result = await service.getTotalCount();

      expect(mockUserModel.count).toHaveBeenCalled();
      expect(result).toBe(total);
    });
  });

  describe('updateLastMessage', () => {
    it('should update lastMessage field', async () => {
      const chatId = 12345;

      mockUserModel.update.mockResolvedValue([1]);

      await service.updateLastMessage(chatId);

      expect(mockUserModel.update).toHaveBeenCalledWith(
        { lastMessage: expect.any(Date) },
        {
          where: { chatId },
          fields: ['lastMessage'],
        },
      );
    });
  });
});

