import {
  Column,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'contact' })
export class Contact extends Model {
  @PrimaryKey
  @Default('singleton')
  @Column
  declare id: string;

  @Column
  declare address: string;

  @Column
  declare managerText: string;

  @Column({ type: 'TEXT', defaultValue: '[]' })
  declare buttons: string;
}
