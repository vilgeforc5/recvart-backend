import {
  Column,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'start' })
export class Start extends Model {
  @PrimaryKey
  @Default('singleton')
  @Column
  declare id: string;

  @Column
  declare title: string;

  @Column
  declare content: string;

  @Column({ type: 'TEXT', defaultValue: '[]' })
  declare buttons: string;
}
