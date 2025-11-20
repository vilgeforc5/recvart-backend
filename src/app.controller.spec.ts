import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StartService } from './start/start.service';
import { CommentService } from './comment/comment.service';
import { ContactService } from './contact/contact.service';
import { PortfolioService } from './portfolio/portfolio.service';
import { CalculateService } from './calculate/calculate.service';
import { UserService } from './user/user.service';

describe('AppController', () => {
  let appController: AppController;

  const mockStartService = {
    getStart: jest.fn(),
    updateStart: jest.fn(),
  };

  const mockCommentService = {
    getAllComments: jest.fn(),
    createComment: jest.fn(),
    deleteComment: jest.fn(),
  };

  const mockContactService = {
    getContact: jest.fn(),
    updateContact: jest.fn(),
  };

  const mockPortfolioService = {
    getAllPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
  };

  const mockCalculateService = {
    getCalculate: jest.fn(),
    updateCalculate: jest.fn(),
  };

  const mockUserService = {
    getAllUsers: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: StartService,
          useValue: mockStartService,
        },
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: ContactService,
          useValue: mockContactService,
        },
        {
          provide: PortfolioService,
          useValue: mockPortfolioService,
        },
        {
          provide: CalculateService,
          useValue: mockCalculateService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
