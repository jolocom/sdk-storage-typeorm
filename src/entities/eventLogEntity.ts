import { PrimaryColumn, Entity, Column } from 'typeorm'

@Entity('event_log')
export class EventLogEntity {
  @PrimaryColumn({ length: 100 })
  id!: string

  @Column("text")
  eventStream!: string
}
