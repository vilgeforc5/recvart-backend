import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { StartService } from './start.service';
import { Start } from './start.entity';

describe('StartService', () => {
  let service: StartService;
  let startModel: typeof Start;

  const mockStartModel = {
    findByPk: jest.fn(),
    upsert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartService,
        {
          provide: getModelToken(Start),
          useValue: mockStartModel,
        },
      ],
    }).compile();

    service = module.get<StartService>(StartService);
    startModel = module.get<typeof Start>(getModelToken(Start));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStart', () => {
    it('should return start config when found', async () => {
      const mockStart = {
        id: 'singleton',
        content: 'Welcome message',
        buttons: '[]',
      };

      mockStartModel.findByPk.mockResolvedValue(mockStart);

      const result = await service.getStart();

      expect(mockStartModel.findByPk).toHaveBeenCalledWith('singleton');
      expect(result).toEqual(mockStart);
    });

    it('should return null when not found', async () => {
      mockStartModel.findByPk.mockResolvedValue(null);

      const result = await service.getStart();

      expect(result).toBeNull();
    });
  });

  describe('updateStart', () => {
    it('should update start with content and buttons', async () => {
      const content = 'New welcome message';
      const buttons = [
        { text: 'Button 1', callback_data: 'action1' },
        { text: 'Button 2', callback_data: 'action2' },
      ];

      const mockStart = {
        id: 'singleton',
        content,
        buttons: JSON.stringify(buttons),
      };

      mockStartModel.upsert.mockResolvedValue([mockStart]);

      const result = await service.updateStart(content, buttons);

      expect(mockStartModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        content,
        buttons: JSON.stringify(buttons),
      });
      expect(result).toEqual(mockStart);
    });

    it('should update start with content only', async () => {
      const content = 'New welcome message';

      const mockStart = {
        id: 'singleton',
        content,
        buttons: '[]',
      };

      mockStartModel.upsert.mockResolvedValue([mockStart]);

      const result = await service.updateStart(content);

      expect(mockStartModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        content,
      });
      expect(result).toEqual(mockStart);
    });

    it('should handle empty buttons array', async () => {
      const content = 'New welcome message';
      const buttons: Array<{ text: string; callback_data: string }> = [];

      const mockStart = {
        id: 'singleton',
        content,
        buttons: JSON.stringify(buttons),
      };

      mockStartModel.upsert.mockResolvedValue([mockStart]);

      const result = await service.updateStart(content, buttons);

      expect(mockStartModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        content,
        buttons: JSON.stringify(buttons),
      });
      expect(result).toEqual(mockStart);
    });
  });
});

