import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'comments' })
export class Comment extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Column
  declare name: string;

  @Column
  declare date: string;

  @Column({ type: 'TEXT' })
  declare text: string;
}
