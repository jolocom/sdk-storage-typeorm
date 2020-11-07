import { Entity, Column, PrimaryColumn } from 'typeorm'
import { Expose } from 'class-transformer'

@Entity('identityCache')
@Expose()
export class IdentityCacheEntity {
  @PrimaryColumn()
  key!: string

  @Column({ nullable: false, type: 'simple-json' })
  value!: any
}
