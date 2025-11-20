import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { PortfolioService } from './portfolio.service';
import { Portfolio } from './portfolio.entity';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let portfolioModel: typeof Portfolio;

  const mockPortfolioModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getModelToken(Portfolio),
          useValue: mockPortfolioModel,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    portfolioModel = module.get<typeof Portfolio>(
      getModelToken(Portfolio),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPortfolios', () => {
    it('should return all portfolios ordered by id', async () => {
      const mockPortfolios = [
        { id: 1, imageSrc: 'image1.jpg', title: 'Title 1', description: 'Desc 1' },
        { id: 2, imageSrc: 'image2.jpg', title: 'Title 2', description: 'Desc 2' },
      ];

      mockPortfolioModel.findAll.mockResolvedValue(mockPortfolios);

      const result = await service.getAllPortfolios();

      expect(mockPortfolioModel.findAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']],
      });
      expect(result).toEqual(mockPortfolios);
    });

    it('should return empty array when no portfolios', async () => {
      mockPortfolioModel.findAll.mockResolvedValue([]);

      const result = await service.getAllPortfolios();

      expect(result).toEqual([]);
    });
  });

  describe('getPortfolioById', () => {
    it('should return portfolio when found', async () => {
      const id = 1;
      const mockPortfolio = {
        id,
        imageSrc: 'image1.jpg',
        title: 'Title 1',
        description: 'Desc 1',
      };

      mockPortfolioModel.findByPk.mockResolvedValue(mockPortfolio);

      const result = await service.getPortfolioById(id);

      expect(mockPortfolioModel.findByPk).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPortfolio);
    });

    it('should return null when not found', async () => {
      const id = 999;

      mockPortfolioModel.findByPk.mockResolvedValue(null);

      const result = await service.getPortfolioById(id);

      expect(result).toBeNull();
    });
  });

  describe('getPortfolioByIndex', () => {
    it('should return portfolio at valid index', async () => {
      const mockPortfolios = [
        { id: 1, imageSrc: 'image1.jpg', title: 'Title 1', description: 'Desc 1' },
        { id: 2, imageSrc: 'image2.jpg', title: 'Title 2', description: 'Desc 2' },
      ];

      mockPortfolioModel.findAll.mockResolvedValue(mockPortfolios);

      const result = await service.getPortfolioByIndex(0);

      expect(result).toEqual(mockPortfolios[0]);
    });

    it('should return null for negative index', async () => {
      const mockPortfolios = [
        { id: 1, imageSrc: 'image1.jpg', title: 'Title 1', description: 'Desc 1' },
      ];

      mockPortfolioModel.findAll.mockResolvedValue(mockPortfolios);

      const result = await service.getPortfolioByIndex(-1);

      expect(result).toBeNull();
    });

    it('should return null for index out of bounds', async () => {
      const mockPortfolios = [
        { id: 1, imageSrc: 'image1.jpg', title: 'Title 1', description: 'Desc 1' },
      ];

      mockPortfolioModel.findAll.mockResolvedValue(mockPortfolios);

      const result = await service.getPortfolioByIndex(5);

      expect(result).toBeNull();
    });
  });

  describe('getTotalCount', () => {
    it('should return total count of portfolios', async () => {
      const total = 5;

      mockPortfolioModel.count.mockResolvedValue(total);

      const result = await service.getTotalCount();

      expect(mockPortfolioModel.count).toHaveBeenCalled();
      expect(result).toBe(total);
    });
  });

  describe('createPortfolio', () => {
    it('should create a new portfolio', async () => {
      const imageSrc = 'new-image.jpg';
      const title = 'New Title';
      const description = 'New Description';

      const mockPortfolio = {
        id: 3,
        imageSrc,
        title,
        description,
      };

      mockPortfolioModel.create.mockResolvedValue(mockPortfolio);

      const result = await service.createPortfolio(imageSrc, title, description);

      expect(mockPortfolioModel.create).toHaveBeenCalledWith({
        imageSrc,
        title,
        description,
      });
      expect(result).toEqual(mockPortfolio);
    });
  });

  describe('deletePortfolio', () => {
    it('should return true when portfolio is deleted', async () => {
      const id = 1;

      mockPortfolioModel.destroy.mockResolvedValue(1);

      const result = await service.deletePortfolio(id);

      expect(mockPortfolioModel.destroy).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBe(true);
    });

    it('should return false when portfolio is not found', async () => {
      const id = 999;

      mockPortfolioModel.destroy.mockResolvedValue(0);

      const result = await service.deletePortfolio(id);

      expect(result).toBe(false);
    });
  });
});

