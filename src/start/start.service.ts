import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Start } from './start.entity';

@Injectable()
export class StartService {
  constructor(
    @InjectModel(Start)
    private startModel: typeof Start,
  ) {}

  async getStart(): Promise<Start | null> {
    const start = await this.startModel.findByPk('singleton');
    return start;
  }

  async updateStart(
    content: string,
    buttons?: Array<{ text: string; callback_data: string }>,
  ): Promise<Start> {
    const updateData: Partial<Start> & { id: string } = {
      id: 'singleton',
      content,
    };
    if (buttons !== undefined) {
      updateData.buttons = JSON.stringify(buttons);
    }
    const [start] = await this.startModel.upsert<Start>(updateData);
    return start;
  }
}
