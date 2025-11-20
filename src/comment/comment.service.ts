import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment)
    private commentModel: typeof Comment,
  ) {}

  async getAllComments(): Promise<Comment[]> {
    return await this.commentModel.findAll({
      order: [['date', 'DESC']],
    });
  }

  async getCommentById(id: number): Promise<Comment | null> {
    return await this.commentModel.findByPk(id);
  }

  async getCommentByIndex(index: number): Promise<Comment | null> {
    const comments = await this.getAllComments();
    if (index < 0 || index >= comments.length) {
      return null;
    }
    return comments[index];
  }

  async getTotalCount(): Promise<number> {
    return await this.commentModel.count();
  }

  async createComment(
    name: string,
    date: string,
    text: string,
  ): Promise<Comment> {
    return await this.commentModel.create({
      name,
      date,
      text,
    });
  }

  async deleteComment(id: number): Promise<boolean> {
    const deleted = await this.commentModel.destroy({
      where: { id },
    });
    return deleted > 0;
  }
}
