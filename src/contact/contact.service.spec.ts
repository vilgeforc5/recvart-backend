import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Contact } from './contact.entity';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;

  const mockContactModel = {
    findByPk: jest.fn(),
    upsert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: getModelToken(Contact),
          useValue: mockContactModel,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getContact', () => {
    it('should return contact config when found', async () => {
      const mockContact = {
        id: 'singleton',
        address: '123 Main St',
        managerText: 'Contact manager',
        buttons: '[]',
      };

      mockContactModel.findByPk.mockResolvedValue(mockContact);

      const result = await service.getContact();

      expect(mockContactModel.findByPk).toHaveBeenCalledWith('singleton');
      expect(result).toEqual(mockContact);
    });

    it('should return null when not found', async () => {
      mockContactModel.findByPk.mockResolvedValue(null);

      const result = await service.getContact();

      expect(result).toBeNull();
    });
  });

  describe('updateContact', () => {
    it('should update contact with address, managerText and buttons', async () => {
      const address = '456 New St';
      const managerText = 'New manager text';
      const buttons = [
        { text: 'Telegram', url: 'https://t.me/test' },
        { text: 'Email', url: 'mailto:test@example.com' },
      ];

      const mockContact = {
        id: 'singleton',
        address,
        managerText,
        buttons: JSON.stringify(buttons),
      };

      mockContactModel.upsert.mockResolvedValue([mockContact]);

      const result = await service.updateContact(address, managerText, buttons);

      expect(mockContactModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        address,
        managerText,
        buttons: JSON.stringify(buttons),
      });
      expect(result).toEqual(mockContact);
    });

    it('should update contact without buttons', async () => {
      const address = '456 New St';
      const managerText = 'New manager text';

      const mockContact = {
        id: 'singleton',
        address,
        managerText,
        buttons: '[]',
      };

      mockContactModel.upsert.mockResolvedValue([mockContact]);

      const result = await service.updateContact(address, managerText);

      expect(mockContactModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        address,
        managerText,
      });
      expect(result).toEqual(mockContact);
    });

    it('should handle empty buttons array', async () => {
      const address = '456 New St';
      const managerText = 'New manager text';
      const buttons: Array<{ text: string; url: string }> = [];

      const mockContact = {
        id: 'singleton',
        address,
        managerText,
        buttons: JSON.stringify(buttons),
      };

      mockContactModel.upsert.mockResolvedValue([mockContact]);

      const result = await service.updateContact(address, managerText, buttons);

      expect(mockContactModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        address,
        managerText,
        buttons: JSON.stringify(buttons),
      });
      expect(result).toEqual(mockContact);
    });
  });
});
