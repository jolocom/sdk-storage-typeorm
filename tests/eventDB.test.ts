import { createConnection, getConnection } from 'typeorm'
import { JolocomSDK } from '@jolocom/sdk'
import { JolocomTypeormStorage } from '../src'

beforeEach(async () =>
  createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [
      'node_modules/@jolocom/sdk-storage-typeorm/js/src/entities/*.js',
    ],
    synchronize: true,
    logging: false,
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
  console.log(SDK)
})
