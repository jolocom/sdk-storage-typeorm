import { PrimaryColumn, Entity, Column } from 'typeorm'
import { numberTransformer } from '../utils'

@Entity('encrypted_wallet')
export class EncryptedWalletEntity {
  @PrimaryColumn({ length: 100 })
  id!: string

  @Column("bigint", { transformer: [numberTransformer] })
  timestamp!: number

  @Column("text")
  encryptedWallet!: string
}
