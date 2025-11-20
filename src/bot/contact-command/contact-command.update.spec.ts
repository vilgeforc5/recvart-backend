import { Test, TestingModule } from '@nestjs/testing';
import { Context } from 'telegraf';
import { ContactCommandUpdate } from './contact-command.update';
import { ContactService } from '../../contact/contact.service';
import { UserService } from '../../user/user.service';

describe('ContactCommandUpdate', () => {
  let update: ContactCommandUpdate;
  let contactService: ContactService;
  let userService: UserService;

  const mockContactService = {
    getContact: jest.fn(),
  };

  const mockUserService = {
    updateLastMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactCommandUpdate,
        {
          provide: ContactService,
          useValue: mockContactService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    update = module.get<ContactCommandUpdate>(ContactCommandUpdate);
    contactService = module.get<ContactService>(ContactService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(update).toBeDefined();
  });

  describe('showContacts', () => {
    it('should show contacts with buttons', async () => {
      const chatId = 12345;
      const mockContact = {
        id: 'singleton',
        address: '123 Main St',
        managerText: 'Contact manager',
        buttons: JSON.stringify([
          { text: 'Telegram', url: 'https://t.me/test' },
        ]),
      };

      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockContactService.getContact.mockResolvedValue(mockContact);

      await update.showContacts(mockCtx);

      expect(mockUserService.updateLastMessage).toHaveBeenCalledWith(chatId);
      expect(mockContactService.getContact).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledTimes(2);
      expect(mockCtx.reply).toHaveBeenNthCalledWith(1, mockContact.address);
      expect(mockCtx.reply).toHaveBeenNthCalledWith(
        2,
        mockContact.managerText,
        expect.objectContaining({
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should show error when contact config not found', async () => {
      const chatId = 12345;
      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockContactService.getContact.mockResolvedValue(null);

      await update.showContacts(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith('Конфигурация не найдена');
    });

    it('should handle empty buttons', async () => {
      const chatId = 12345;
      const mockContact = {
        id: 'singleton',
        address: '123 Main St',
        managerText: 'Contact manager',
        buttons: '[]',
      };

      const mockCtx = {
        from: { id: chatId },
        reply: jest.fn().mockResolvedValue(undefined),
      } as unknown as Context;

      mockContactService.getContact.mockResolvedValue(mockContact);

      await update.showContacts(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledTimes(2);
    });
  });
});

