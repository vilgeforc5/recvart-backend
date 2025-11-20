import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Portfolio } from './portfolio.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectModel(Portfolio)
    private portfolioModel: typeof Portfolio,
  ) {}

  async getAllPortfolios(): Promise<Portfolio[]> {
    return await this.portfolioModel.findAll({
      order: [['id', 'ASC']],
    });
  }

  async getPortfolioById(id: number): Promise<Portfolio | null> {
    return await this.portfolioModel.findByPk(id);
  }

  async getPortfolioByIndex(index: number): Promise<Portfolio | null> {
    const portfolios = await this.getAllPortfolios();
    if (index < 0 || index >= portfolios.length) {
      return null;
    }
    return portfolios[index];
  }

  async getTotalCount(): Promise<number> {
    return await this.portfolioModel.count();
  }

  async createPortfolio(
    imageSrc: string,
    title: string,
    description: string,
  ): Promise<Portfolio> {
    return await this.portfolioModel.create({
      imageSrc,
      title,
      description,
    });
  }

  async deletePortfolio(id: number): Promise<boolean> {
    const deleted = await this.portfolioModel.destroy({
      where: { id },
    });
    return deleted > 0;
  }
}

