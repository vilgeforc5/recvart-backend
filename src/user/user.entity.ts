import {
  AutoIncrement,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Column({ unique: true })
  declare chatId: number;

  @Column({ allowNull: true })
  declare clientId: string;

  @Column({ allowNull: true })
  declare username: string;

  @Column({ allowNull: true })
  declare firstName: string;

  @Column({ allowNull: true })
  declare lastName: string;

  @CreatedAt
  @Column
  declare createdAt: Date;

  @UpdatedAt
  @Column
  declare updatedAt: Date;

  @Column({ allowNull: true })
  declare lastMessage: Date;
}
