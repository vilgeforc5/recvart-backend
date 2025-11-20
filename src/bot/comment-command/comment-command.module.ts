import { Module } from '@nestjs/common';
import { CommentModule } from '../../comment/comment.module';
import { UserModule } from '../../user/user.module';
import { CommentCommandUpdate } from './comment-command.update';

@Module({
  imports: [CommentModule, UserModule],
  providers: [CommentCommandUpdate],
})
export class CommentCommandModule {}
