import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: number; // 1 if ethereum, 2 if polygon

  @Column('double precision')
  price: number;

  @Column()
  email: string;
}
