import { PrimaryColumn, Entity, Column } from 'typeorm'

@Entity('master_keys')
export class EncryptedWalletEntity {
  @PrimaryColumn({ length: 100 })
  id!: string

  @Column()
  timestamp!: number
  
  @Column("text")
  encryptedWallet!: string
}
