import { createConnection, getConnection } from 'typeorm'
import { JolocomSDK } from '@jolocom/sdk'
import { JolocomTypeormStorage } from '../src'

beforeEach(async () =>
  createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'typeormtest',
    password: 'password',
    database: 'typeormtest',
    entities: [
      'src/entities/*.ts',
    ],
    synchronize: true,
    logging: ['error', 'warn', 'schema'],
  }),
)

afterEach(async () => {
  const conn = getConnection()
  return conn.close()
})

test('Create identity', async () => {
  const SDK = new JolocomSDK({
    storage: new JolocomTypeormStorage(getConnection()),
  })
  const agent = await SDK.createAgent("pass", "jun")
  console.log(agent)

  const ewa = await SDK.storage.get.encryptedWallet(agent.idw.did)
  console.log(typeof ewa!.timestamp)
})
