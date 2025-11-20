import {
  Column,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'calculate' })
export class Calculate extends Model {
  @PrimaryKey
  @Default('singleton')
  @Column
  declare id: string;

  @Column({ type: 'TEXT' })
  declare step1Question: string;

  @Column({ type: 'TEXT' })
  declare step1Options: string;

  @Column({ type: 'TEXT' })
  declare step2Question: string;

  @Column({ type: 'TEXT' })
  declare step2Options: string;

  @Column({ type: 'TEXT' })
  declare step3Question: string;

  @Column({ type: 'TEXT' })
  declare step4Question: string;

  @Column({ type: 'TEXT' })
  declare step4Options: string;

  @Column({ type: 'TEXT' })
  declare step5ContactPrompt: string;

  @Column({ type: 'TEXT' })
  declare finalMessage: string;
}
