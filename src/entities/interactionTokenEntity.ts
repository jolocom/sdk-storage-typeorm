import { plainToClass } from 'class-transformer'

import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm'
import {
  JSONWebToken,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'

@Entity('interaction_tokens')
export class InteractionTokenEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  nonce!: string

  @Column()
  type!: string

  @Column()
  issuer!: string

  @Column("bigint")
  timestamp!: number

  @Column("text")
  original!: string

  static fromJWT(jwt: JSONWebToken<any>): InteractionTokenEntity {
    return plainToClass(InteractionTokenEntity, {
      nonce: jwt.nonce,
      type: jwt.interactionType,
      issuer: jwt.issuer,
      timestamp: jwt.issued,
      original: jwt.encode(),
    })
  }
}
