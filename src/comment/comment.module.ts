import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

@Module({
  imports: [SequelizeModule.forFeature([Comment])],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
