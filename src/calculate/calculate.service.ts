import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Calculate } from './calculate.entity';

@Injectable()
export class CalculateService {
  constructor(
    @InjectModel(Calculate)
    private calculateModel: typeof Calculate,
  ) {}

  async getCalculate(): Promise<Calculate | null> {
    const calculate = await this.calculateModel.findByPk('singleton');
    return calculate;
  }

  async updateCalculate(data: {
    step1Question?: string;
    step1Options?: string[] | string;
    step2Question?: string;
    step2Options?: string[] | string;
    step3Question?: string;
    step4Question?: string;
    step4Options?: string[] | string;
    step5ContactPrompt?: string;
    finalMessage?: string;
  }): Promise<Calculate> {
    const updateData: Partial<Calculate> & { id: string } = {
      id: 'singleton',
    };

    if (data.step1Question !== undefined) {
      updateData.step1Question = data.step1Question;
    }
    if (data.step1Options !== undefined) {
      updateData.step1Options = Array.isArray(data.step1Options)
        ? JSON.stringify(data.step1Options)
        : data.step1Options;
    }
    if (data.step2Question !== undefined) {
      updateData.step2Question = data.step2Question;
    }
    if (data.step2Options !== undefined) {
      updateData.step2Options = Array.isArray(data.step2Options)
        ? JSON.stringify(data.step2Options)
        : data.step2Options;
    }
    if (data.step3Question !== undefined) {
      updateData.step3Question = data.step3Question;
    }
    if (data.step4Question !== undefined) {
      updateData.step4Question = data.step4Question;
    }
    if (data.step4Options !== undefined) {
      updateData.step4Options = Array.isArray(data.step4Options)
        ? JSON.stringify(data.step4Options)
        : data.step4Options;
    }
    if (data.step5ContactPrompt !== undefined) {
      updateData.step5ContactPrompt = data.step5ContactPrompt;
    }
    if (data.finalMessage !== undefined) {
      updateData.finalMessage = data.finalMessage;
    }

    const [calculate] = await this.calculateModel.upsert<Calculate>(updateData);
    return calculate;
  }
}
