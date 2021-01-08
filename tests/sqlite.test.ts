import { claimsMetadata } from 'jolocom-lib'
import { createConnection, getConnection } from 'typeorm'
import { JolocomSDK } from '@jolocom/sdk'
import { JolocomTypeormStorage } from '../src'

beforeEach(async () =>
  createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
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

  const ewa = await SDK.storage.get.encryptedWallet(agent.idw.did)
  expect(typeof ewa!.timestamp).toBe('number')
})

test('Query credentials', async () => {
  const SDK = new JolocomSDK({
    storage: new JolocomTypeormStorage(getConnection()),
  })
  const agent = await SDK.createAgent("pass", "jun")

  const cred1 = await agent.signedCredential({
    metadata: claimsMetadata.name,
    subject: agent.idw.did,
    claim: {
      givenName: "test",
      familyName: "name"
    }
  })

  const cred2 = await agent.signedCredential({
    metadata: claimsMetadata.name,
    subject: "did:test:123abc",
    claim: {
      givenName: "test2",
      familyName: "name"
    }
  })

  await SDK.storage.store.verifiableCredential(cred1)
  await SDK.storage.store.verifiableCredential(cred2)

  const byIssuer = await SDK.storage.get.verifiableCredential({
    issuer: agent.idw.did
  })

  const byClaim = await agent.getCredentials({
    claims: { givenName: "test" }
  })

  const byClaim2 = await agent.getCredentials({
    claims: { givenName: "test2" }
  })

  const byClaim3 = await SDK.storage.get.verifiableCredential({
    claims: { familyName: "name" }
  })

  // both should be present
  expect(byIssuer).toContainEqual(cred1)
  expect(byIssuer).toContainEqual(cred2)

  // should only contain the vc which the agent is the subject of
  expect(byClaim).toContainEqual(cred1)
  expect(byClaim).not.toContainEqual(cred2)
  
  // no results, agent is not the subject
  expect(byClaim2).toEqual([])

  // both should be present
  expect(byClaim3).toContainEqual(cred1)
  expect(byClaim3).toContainEqual(cred2)
})
