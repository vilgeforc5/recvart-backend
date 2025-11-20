import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { CalculateService } from './calculate.service';
import { Calculate } from './calculate.entity';

describe('CalculateService', () => {
  let service: CalculateService;
  let calculateModel: typeof Calculate;

  const mockCalculateModel = {
    findByPk: jest.fn(),
    upsert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateService,
        {
          provide: getModelToken(Calculate),
          useValue: mockCalculateModel,
        },
      ],
    }).compile();

    service = module.get<CalculateService>(CalculateService);
    calculateModel = module.get<typeof Calculate>(
      getModelToken(Calculate),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCalculate', () => {
    it('should return calculate config when found', async () => {
      const mockCalculate = {
        id: 'singleton',
        step1Question: 'Question 1',
        step1Options: '[]',
      };

      mockCalculateModel.findByPk.mockResolvedValue(mockCalculate);

      const result = await service.getCalculate();

      expect(mockCalculateModel.findByPk).toHaveBeenCalledWith('singleton');
      expect(result).toEqual(mockCalculate);
    });

    it('should return null when not found', async () => {
      mockCalculateModel.findByPk.mockResolvedValue(null);

      const result = await service.getCalculate();

      expect(result).toBeNull();
    });
  });

  describe('updateCalculate', () => {
    it('should update calculate with all fields', async () => {
      const updateData = {
        step1Question: 'New Question 1',
        step1Options: ['Option 1', 'Option 2'],
        step2Question: 'New Question 2',
        step2Options: ['Option A', 'Option B'],
        step3Question: 'New Question 3',
        step4Question: 'New Question 4',
        step4Options: ['Option X', 'Option Y'],
        step5ContactPrompt: 'Contact prompt',
        finalMessage: 'Final message',
      };

      const mockCalculate = {
        id: 'singleton',
        ...updateData,
      };

      mockCalculateModel.upsert.mockResolvedValue([mockCalculate]);

      const result = await service.updateCalculate(updateData);

      expect(mockCalculateModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        step1Question: updateData.step1Question,
        step1Options: JSON.stringify(updateData.step1Options),
        step2Question: updateData.step2Question,
        step2Options: JSON.stringify(updateData.step2Options),
        step3Question: updateData.step3Question,
        step4Question: updateData.step4Question,
        step4Options: JSON.stringify(updateData.step4Options),
        step5ContactPrompt: updateData.step5ContactPrompt,
        finalMessage: updateData.finalMessage,
      });
      expect(result).toEqual(mockCalculate);
    });

    it('should update calculate with partial fields', async () => {
      const updateData = {
        step1Question: 'New Question 1',
      };

      const mockCalculate = {
        id: 'singleton',
        step1Question: 'New Question 1',
      };

      mockCalculateModel.upsert.mockResolvedValue([mockCalculate]);

      const result = await service.updateCalculate(updateData);

      expect(mockCalculateModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        step1Question: updateData.step1Question,
      });
      expect(result).toEqual(mockCalculate);
    });

    it('should handle string options without JSON.stringify', async () => {
      const updateData = {
        step1Options: '["Option 1"]',
      };

      const mockCalculate = {
        id: 'singleton',
        step1Options: '["Option 1"]',
      };

      mockCalculateModel.upsert.mockResolvedValue([mockCalculate]);

      const result = await service.updateCalculate(updateData);

      expect(mockCalculateModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        step1Options: updateData.step1Options,
      });
      expect(result).toEqual(mockCalculate);
    });

    it('should handle array options with JSON.stringify', async () => {
      const updateData = {
        step1Options: ['Option 1', 'Option 2'],
      };

      const mockCalculate = {
        id: 'singleton',
        step1Options: JSON.stringify(['Option 1', 'Option 2']),
      };

      mockCalculateModel.upsert.mockResolvedValue([mockCalculate]);

      const result = await service.updateCalculate(updateData);

      expect(mockCalculateModel.upsert).toHaveBeenCalledWith({
        id: 'singleton',
        step1Options: JSON.stringify(updateData.step1Options),
      });
      expect(result).toEqual(mockCalculate);
    });
  });
});

