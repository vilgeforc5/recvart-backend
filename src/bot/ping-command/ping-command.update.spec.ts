import { Test, TestingModule } from '@nestjs/testing';
import { Context } from 'telegraf';
import { PingCommandUpdate } from './ping-command.update';
import { UserService } from '../../user/user.service';

describe('PingCommandUpdate', () => {
  let update: PingCommandUpdate;
  let userService: UserService;

  const mockUserService = {
    updateLastMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PingCommandUpdate,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    update = module.get<PingCommandUpdate>(PingCommandUpdate);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(update).toBeDefined();
  });

  describe('ping', () => {
    it('should reply with "Все ОК" and update last message', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.ping(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockCtx.reply).toHaveBeenCalledWith('Все ОК');
    });

    it('should reply even when chatId is undefined', async () => {
      const mockCtx = {
        from: undefined,
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      await update.ping(mockCtx);

      expect(mockUserService.updateLastMessage).not.toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith('Все ОК');
    });
  });
});

