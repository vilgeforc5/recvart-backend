import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'portfolios' })
export class Portfolio extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Column({ type: 'TEXT' })
  declare imageSrc: string;

  @Column
  declare title: string;

  @Column({ type: 'TEXT' })
  declare description: string;
}
