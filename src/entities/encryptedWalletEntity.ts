import { PrimaryColumn, Entity, Column } from 'typeorm'

@Entity('encrypted_wallet')
export class EncryptedWalletEntity {
  @PrimaryColumn({ length: 100 })
  id!: string

  @Column("bigint")
  timestamp!: number

  @Column("text")
  encryptedWallet!: string
}
