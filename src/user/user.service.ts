import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async createOrUpdateUser(
    chatId: number,
    data: {
      clientId?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({
      where: { chatId },
    });

    if (existingUser) {
      await existingUser.update(
        {
          username: data.username ?? existingUser.username,
          firstName: data.firstName ?? existingUser.firstName,
          lastName: data.lastName ?? existingUser.lastName,
          clientId: data.clientId ?? existingUser.clientId,
        },
        {
          fields: [
            'username',
            'firstName',
            'lastName',
            'clientId',
            'updatedAt',
          ],
        },
      );
      await existingUser.reload();
      return existingUser;
    }

    return await this.userModel.create({
      chatId,
      ...data,
    });
  }

  async getUserByChatId(chatId: number): Promise<User | null> {
    return await this.userModel.findOne({
      where: { chatId },
    });
  }

  async getAllUsers(
    skip?: number,
    take?: number,
  ): Promise<{
    users: User[];
    total: number;
  }> {
    const total = await this.userModel.count();

    const users = await this.userModel.findAll({
      order: [['createdAt', 'DESC']],
      limit: take,
      offset: skip,
    });

    return { users, total };
  }

  async getTotalCount(): Promise<number> {
    return await this.userModel.count();
  }

  async updateLastMessage(chatId: number): Promise<void> {
    await this.userModel.update(
      { lastMessage: new Date() },
      {
        where: { chatId },
        fields: ['lastMessage'],
      },
    );
  }
}
