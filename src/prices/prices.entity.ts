import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: Date;

  @Column('double precision')
  eth_price: number;

  @Column('double precision')
  pol_price: number;
}
